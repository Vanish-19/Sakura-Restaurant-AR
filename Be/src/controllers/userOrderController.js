import asyncHandler from 'express-async-handler';
import { getUserOrderHistory } from '../services/userOrderService.js';

export const getMyOrderHistory = asyncHandler(async (req, res) => {
  const data = await getUserOrderHistory(req.user.id);
  res.status(200).json({ success: true, count: data.length, data });
});
