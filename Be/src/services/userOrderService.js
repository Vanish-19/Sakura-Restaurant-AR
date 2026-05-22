import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { createHttpError } from '../utils/AppError.js';
import { revertLoyaltyForCancelledOrder } from './loyaltyService.js';

export async function getUserOrderHistory(userId) {
  return Order.find({ user: userId })
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category')
    .sort({ createdAt: -1 });
}

export async function cancelUserOrder({ orderId, userId, reason }) {
  const cleanReason = String(reason || '').trim();
  if (!cleanReason) {
    throw createHttpError('Vui lòng nhập lý do hủy đơn', 400, 'CANCEL_REASON_REQUIRED');
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  if (order.status !== 'pending') {
    throw createHttpError('Chỉ có thể hủy đơn đang chờ xử lý', 409, 'ORDER_NOT_CANCELLABLE');
  }

  const completedPayment = await Payment.findOne({ order: order._id, status: 'completed' }).lean();
  if (completedPayment) {
    throw createHttpError('Không thể hủy đơn đã thanh toán', 409, 'ORDER_ALREADY_PAID');
  }

  order.status = 'cancelled';
  order.cancellation = {
    reason: cleanReason,
    cancelled_by: 'user',
    cancelled_at: new Date(),
  };
  order.items.forEach((item) => {
    item.status = 'cancelled';
  });

  const cancelled = await order.save();
  await revertLoyaltyForCancelledOrder(cancelled._id);

  return Order.findById(cancelled._id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category');
}
