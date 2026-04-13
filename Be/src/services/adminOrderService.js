import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

async function attachPaymentStatus(orders) {
  const orderIds = orders.map((order) => order._id);
  const payments = await Payment.find({ order: { $in: orderIds }, method: 'online' });
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
            provider: payment.provider,
            provider_ref: payment.provider_ref,
            checkout_url: payment.checkout_url,
            paid_at: payment.paid_at,
          }
        : null,
    };
  });
}

const getAllOrders = async ({ status, order_type, page = 1, limit = 20 }) => {
  const query = {};
  if (status) query.status = status;
  if (order_type) query.order_type = order_type;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('table', 'name')
      .populate('items.menu_item', 'name image_url price category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query)
  ]);

  const ordersWithPayment = await attachPaymentStatus(orders);

  return {
    orders: ordersWithPayment,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    }
  };
};

const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category');
  if (!order) throw new Error('Không tìm thấy đơn hàng');

  const [orderWithPayment] = await attachPaymentStatus([order]);
  return orderWithPayment;
};

const updateOrderStatus = async (id, newStatus) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Không tìm thấy đơn hàng');

  // Validate trạng thái hợp lệ theo luồng
  const validTransitions = {
    dine_in: {
      pending: ['cooking', 'cancelled'],
      cooking: ['served', 'cancelled'],
      served: ['paid'],
    },
    takeaway: {
      pending: ['cooking', 'cancelled'],
      cooking: ['ready', 'cancelled'],
      ready: ['picked_up'],
      picked_up: ['paid'],
    }
  };

  const allowed = validTransitions[order.order_type]?.[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Không thể chuyển trạng thái từ '${order.status}' sang '${newStatus}' cho đơn ${order.order_type}`);
  }

  order.status = newStatus;
  const updated = await order.save();
  const populated = await Order.findById(updated._id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url');

  const [orderWithPayment] = await attachPaymentStatus([populated]);
  return orderWithPayment;
};

const cancelOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Không tìm thấy đơn hàng');

  if (['paid', 'cancelled', 'picked_up'].includes(order.status)) {
    throw new Error(`Không thể hủy đơn có trạng thái '${order.status}'`);
  }

  order.status = 'cancelled';
  return await order.save();
};

const hardDeleteOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Không tìm thấy đơn hàng');

  // Require cancel first to avoid accidental destructive deletion.
  if (order.status !== 'cancelled') {
    throw new Error('Chỉ được xóa vĩnh viễn đơn đã hủy');
  }

  await Order.findByIdAndDelete(id);
  return { id, deleted: true };
};

const getOrderStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOptions, todayRevenue, statusCounts] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  return {
    today_orders: todayOptions,
    today_revenue: todayRevenue[0]?.total || 0,
    by_status: Object.fromEntries(statusCounts.map(s => [s._id, s.count])),
  };
};

export { getAllOrders, getOrderById, updateOrderStatus, cancelOrder, hardDeleteOrder, getOrderStats };
