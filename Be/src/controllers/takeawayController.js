import asyncHandler from 'express-async-handler';
import {
  createTakeawayOrder as svcCreateTakeawayOrder,
  getTakeawayOrdersByPhone as svcGetTakeawayOrdersByPhone,
  getTakeawayOrderById as svcGetTakeawayOrderById
} from '../services/takeawayService.js';

const createTakeawayOrder = asyncHandler(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
  const order = await svcCreateTakeawayOrder(req.body, { clientIp });
  if (req.io) req.io.to('admin').emit('new_takeaway_order', order);
  res.status(201).json({ success: true, data: order });
});

const getTakeawayOrdersByPhone = asyncHandler(async (req, res) => {
  const { phone } = req.query;
  const orders = await svcGetTakeawayOrdersByPhone(phone);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const getTakeawayOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await svcGetTakeawayOrderById(id);
  res.status(200).json({ success: true, data: order });
});

export { createTakeawayOrder, getTakeawayOrdersByPhone, getTakeawayOrderById };
