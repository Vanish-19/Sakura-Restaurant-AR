import asyncHandler from 'express-async-handler';
import { cancelUserOrder, getUserOrderHistory } from '../services/userOrderService.js';

export const getMyOrderHistory = asyncHandler(async (req, res) => {
  const data = await getUserOrderHistory(req.user.id);
  res.status(200).json({ success: true, count: data.length, data });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await cancelUserOrder({
    orderId: req.params.id,
    userId: req.user.id,
    reason: req.body.cancel_reason,
  });

  if (req.io) {
    req.io.to('admin').emit('user_order_cancelled', order);
  }

  res.status(200).json({ success: true, message: 'Đã hủy đơn hàng', data: order });
});
