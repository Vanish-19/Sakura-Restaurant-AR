import asyncHandler from 'express-async-handler';
import {
  createNewOrder as svcCreateNewOrder,
  getKitchenOrders as svcGetKitchenOrders,
  updateOrderStatus as svcUpdateOrderStatus
} from '../services/orderService.js';

const createOrder = asyncHandler(async (req, res) => {
  const { table_id } = req.table; 
  const { items } = req.body;
  const order = await svcCreateNewOrder(table_id, items);
  
  if (req.io) req.io.to('admin').emit('new_order_received', order);
  res.status(201).json({ success: true, data: order });
});

const getActiveOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const orders = await svcGetKitchenOrders(status);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await svcUpdateOrderStatus(id, status);
  
  if (req.io) req.io.to('admin').emit('order_updated', order);
  res.status(200).json({ success: true, data: order });
});

export { createOrder, getActiveOrders, updateOrderStatus };
