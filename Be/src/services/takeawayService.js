import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { createHttpError } from '../utils/AppError.js';
import { reserveRewardVoucherForOrder, revertLoyaltyForCancelledOrder } from './loyaltyService.js';
import { createSepayPaymentLinkForOrder } from './sepayPaymentService.js';

function normalizeOrderItems(itemsData = [], menuItems = []) {
  const menuMap = new Map(menuItems.map((item) => [String(item._id), item]));
  let subtotalAmount = 0;

  const processedItems = itemsData.map((item) => {
    const menuItem = menuMap.get(String(item.menu_item_id));
    if (!menuItem) {
      throw createHttpError(`Menu item ${item.menu_item_id} is unavailable`, 404, 'MENU_ITEM_UNAVAILABLE');
    }

    const quantity = Number(item.quantity || 1);
    subtotalAmount += menuItem.price * quantity;

    return {
      menu_item: menuItem._id,
      quantity,
      price_at_order: menuItem.price,
      note: item.note,
      status: 'pending',
    };
  });

  return { processedItems, subtotalAmount };
}

async function getAvailableMenuItems(itemsData, session) {
  const menuItemIds = [...new Set(itemsData.map((item) => item.menu_item_id))];
  return MenuItem.find({
    _id: { $in: menuItemIds },
    is_available: true,
  }).session(session);
}

const createTakeawayOrder = async (
  { customer_name, customer_phone, delivery_address, payment_method = 'cod', reward_voucher_id, items },
  userId,
) => {
  if (!userId) {
    throw createHttpError('Login is required for delivery orders', 401, 'LOGIN_REQUIRED');
  }

  const session = await mongoose.startSession();
  let savedOrderId = null;
  let checkoutUrl = '';

  try {
    await session.withTransaction(async () => {
      const menuItems = await getAvailableMenuItems(items, session);
      const { processedItems, subtotalAmount } = normalizeOrderItems(items, menuItems);

      const [order] = await Order.create(
        [
          {
            order_type: 'takeaway',
            user: userId,
            customer_name,
            customer_phone,
            delivery_address,
            items: processedItems,
            subtotal_amount: subtotalAmount,
            total_amount: subtotalAmount,
            loyalty: {
              phone: customer_phone,
            },
          },
        ],
        { session },
      );

      if (reward_voucher_id) {
        const { profile, discountAmount, rewardRedemption } = await reserveRewardVoucherForOrder(
          {
            phone: customer_phone,
            voucherId: reward_voucher_id,
            subtotal: subtotalAmount,
            orderId: order._id,
            customerName: customer_name,
            userId,
          },
          { session },
        );

        order.discount_amount = discountAmount;
        order.total_amount = Math.max(0, subtotalAmount - discountAmount);
        order.loyalty = {
          ...order.loyalty?.toObject?.(),
          phone: customer_phone,
          profile: profile?._id,
          reward_redemption: rewardRedemption || undefined,
        };
        await order.save({ session });
      }

      savedOrderId = order._id;

      if (payment_method === 'online') {
        const paymentResult = await createSepayPaymentLinkForOrder(order, { session });
        checkoutUrl = paymentResult.checkoutUrl;
      }
    });
  } finally {
    await session.endSession();
  }

  const createdOrder = await Order.findById(savedOrderId)
    .populate('items.menu_item', 'name image_url category');

  if (payment_method === 'online') {
    const result = createdOrder.toObject();
    result.checkout_url = checkoutUrl;
    result.payment_method = 'online';
    result.payment = {
      checkout_url: checkoutUrl,
      status: 'pending',
    };
    return result;
  }

  return createdOrder;
};

const getTakeawayOrdersByPhone = async (phone, userId) => {
  const query = userId
    ? { order_type: 'takeaway', user: userId }
    : { order_type: 'takeaway', customer_phone: phone };

  return Order.find(query)
    .populate('items.menu_item', 'name image_url price')
    .sort({ createdAt: -1 });
};

const getTakeawayOrderById = async (id, userId) => {
  const query = { _id: id, order_type: 'takeaway' };
  if (userId) query.user = userId;

  const order = await Order.findOne(query)
    .populate('items.menu_item', 'name image_url price category');
  if (!order) {
    throw createHttpError('Delivery order not found', 404, 'TAKEAWAY_ORDER_NOT_FOUND');
  }

  const payment = await Payment.findOne({ order: order._id, method: 'online' });
  const orderObject = order.toObject();

  return {
    ...orderObject,
    payment: payment
      ? {
          id: payment._id,
          status: payment.status,
          checkout_url: payment.checkout_url,
          provider: payment.provider,
          amount: payment.amount,
          currency: payment.currency,
          paid_at: payment.paid_at,
          provider_ref: payment.provider_ref,
        }
      : null,
    checkout_url: payment?.checkout_url || '',
  };
};

const cancelTakeawayOrder = async (id, userId, { reason = '', cancelledBy = 'user' } = {}) => {
  const orderQuery = { _id: id, order_type: 'takeaway' };
  if (userId) orderQuery.user = userId;

  const order = await Order.findOne(orderQuery);
  if (!order) {
    throw createHttpError('Delivery order not found', 404, 'TAKEAWAY_ORDER_NOT_FOUND');
  }

  if (order.status === 'paid') {
    throw createHttpError('Cannot cancel a paid order', 409, 'ORDER_ALREADY_PAID');
  }

  order.status = 'cancelled';
  order.cancellation = {
    reason: String(reason || 'Người dùng hủy đơn giao hàng').trim(),
    cancelled_by: cancelledBy,
    cancelled_at: new Date(),
  };
  order.items.forEach((item) => {
    item.status = 'cancelled';
  });
  const cancelledOrder = await order.save();
  await revertLoyaltyForCancelledOrder(cancelledOrder._id);

  return Order.findById(cancelledOrder._id)
    .populate('items.menu_item', 'name image_url price category');
};

export { createTakeawayOrder, getTakeawayOrdersByPhone, getTakeawayOrderById, cancelTakeawayOrder };
