import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { createHttpError } from '../utils/AppError.js';
import { finalizeLoyaltyForPaidOrder, revertLoyaltyForCancelledOrder } from './loyaltyService.js';

async function attachPaymentStatus(orders) {
  const orderIds = orders.map((order) => order._id);
  const payments = await Payment.find({ order: { $in: orderIds } });
  const paymentMap = new Map(payments.map((payment) => [String(payment.order), payment]));

  return orders.map((order) => {
    const payment = paymentMap.get(String(order._id));
    const isTakeaway = order.order_type === 'takeaway';
    const paidStatus = payment?.status === 'completed' || order.status === 'paid' ? 'paid' : 'unpaid';
    const paymentMethod = payment?.method || (isTakeaway ? 'cod' : undefined);

    return {
      ...order.toObject(),
      paid_status: isTakeaway ? paidStatus : undefined,
      payment_method: isTakeaway ? paymentMethod : undefined,
      payment: payment
        ? {
            id: payment._id,
            status: payment.status,
            method: payment.method,
            provider: payment.provider,
            provider_ref: payment.provider_ref,
            checkout_url: payment.checkout_url,
            paid_at: payment.paid_at,
          }
        : null,
    };
  });
}

function normalizePagination({ page = 1, limit = 20 }) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
}

async function getPopulatedOrder(id) {
  return Order.findById(id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category');
}

const getAllOrders = async ({ status, order_type, order_id, page = 1, limit = 20 }) => {
  const query = {};
  if (status) query.status = status;
  if (order_type) query.order_type = order_type;
  if (order_id) {
    const orderIdKeyword = String(order_id).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$expr = {
      $regexMatch: {
        input: { $toString: '$_id' },
        regex: orderIdKeyword,
        options: 'i',
      },
    };
  }

  const { page: normalizedPage, limit: normalizedLimit, skip } = normalizePagination({ page, limit });

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('table', 'name')
      .populate('items.menu_item', 'name image_url price category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(normalizedLimit),
    Order.countDocuments(query),
  ]);

  const ordersWithPayment = await attachPaymentStatus(orders);

  return {
    orders: ordersWithPayment,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      pages: Math.ceil(total / normalizedLimit),
    },
  };
};

const getOrderById = async (id) => {
  const order = await getPopulatedOrder(id);
  if (!order) throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');

  const [orderWithPayment] = await attachPaymentStatus([order]);
  return orderWithPayment;
};

const updateOrderStatus = async (id, newStatus) => {
  const order = await Order.findById(id);
  if (!order) throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');

  const validTransitions = {
    dine_in: {
      pending: ['cooking', 'cancelled'],
      cooking: ['served', 'cancelled'],
      served: ['paid'],
    },
    takeaway: {
      pending: ['cooking', 'cancelled'],
      cooking: ['ready', 'cancelled'],
      ready: ['picked_up', 'cancelled'],
      picked_up: ['paid'],
    },
  };

  const allowed = validTransitions[order.order_type]?.[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw createHttpError(
      `Cannot transition ${order.order_type} order from ${order.status} to ${newStatus}`,
      409,
      'INVALID_ORDER_STATUS_TRANSITION',
    );
  }

  order.status = newStatus;
  if (newStatus === 'cancelled') {
    order.items.forEach((item) => {
      item.status = 'cancelled';
    });
  }
  if (newStatus === 'cooking') {
    order.items.forEach((item) => {
      if (item.status === 'pending') item.status = 'cooking';
    });
  }
  if (newStatus === 'served') {
    order.items.forEach((item) => {
      if (item.status !== 'cancelled') item.status = 'served';
    });
  }
  if (newStatus === 'ready') {
    order.items.forEach((item) => {
      if (item.status !== 'cancelled') item.status = 'ready';
    });
  }

  const updated = await order.save();
  if (newStatus === 'paid') {
    await finalizeLoyaltyForPaidOrder(updated._id);
  } else if (newStatus === 'cancelled') {
    await revertLoyaltyForCancelledOrder(updated._id);
  }
  const populated = await getPopulatedOrder(updated._id);
  const [orderWithPayment] = await attachPaymentStatus([populated]);
  return orderWithPayment;
};

function deriveOrderStatusFromItems(order) {
  if (['paid', 'cancelled'].includes(order.status)) return order.status;

  const itemStatuses = order.items.map((item) => item.status);
  const activeStatuses = itemStatuses.filter((status) => status !== 'cancelled');
  if (activeStatuses.length === 0) return 'cancelled';

  if (order.order_type === 'dine_in') {
    if (activeStatuses.every((status) => status === 'served')) return 'served';
    if (activeStatuses.some((status) => ['cooking', 'ready', 'served'].includes(status))) return 'cooking';
    return 'pending';
  }

  if (activeStatuses.every((status) => ['ready', 'served'].includes(status))) return 'ready';
  if (activeStatuses.some((status) => ['cooking', 'ready', 'served'].includes(status))) return 'cooking';
  return 'pending';
}

const updateOrderItemStatus = async (orderId, itemId, itemStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');
  if (['paid', 'cancelled'].includes(order.status)) {
    throw createHttpError('Cannot update items for a closed order', 409, 'ORDER_CLOSED');
  }

  const item = order.items.id(itemId);
  if (!item) throw createHttpError('Order item not found', 404, 'ORDER_ITEM_NOT_FOUND');

  item.status = itemStatus;
  order.status = deriveOrderStatusFromItems(order);
  const updated = await order.save();

  const populated = await getPopulatedOrder(updated._id);
  const [orderWithPayment] = await attachPaymentStatus([populated]);
  return orderWithPayment;
};

const cancelOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');

  if (['paid', 'cancelled', 'picked_up'].includes(order.status)) {
    throw createHttpError(`Cannot cancel an order with status ${order.status}`, 409, 'ORDER_NOT_CANCELLABLE');
  }

  order.status = 'cancelled';
  order.items.forEach((item) => {
    item.status = 'cancelled';
  });
  const cancelled = await order.save();
  await revertLoyaltyForCancelledOrder(cancelled._id);
  return cancelled;
};

const hardDeleteOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');

  if (order.status !== 'cancelled') {
    throw createHttpError('Only cancelled orders can be permanently deleted', 409, 'ORDER_NOT_CANCELLED');
  }

  await Order.findByIdAndDelete(id);
  return { id, deleted: true };
};

const getOrderStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedOnlineOrderIds = await Payment.distinct('order', { status: 'completed' });
  const revenueOrConditions = [{ status: 'paid' }];

  if (completedOnlineOrderIds.length > 0) {
    revenueOrConditions.push({ _id: { $in: completedOnlineOrderIds } });
  }

  const [todayOrders, todayRevenue, statusCounts] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          $or: revenueOrConditions,
        },
      },
      { $group: { _id: null, total: { $sum: '$total_amount' } } },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    today_orders: todayOrders,
    today_revenue: todayRevenue[0]?.total || 0,
    by_status: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
  };
};

export {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  cancelOrder,
  hardDeleteOrder,
  getOrderStats,
};
