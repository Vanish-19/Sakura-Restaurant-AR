import asyncHandler from 'express-async-handler';
import {
  getAllOrders as svcGetAllOrders,
  getOrderById as svcGetOrderById,
  updateOrderStatus as svcUpdateOrderStatus,
  updateOrderItemStatus as svcUpdateOrderItemStatus,
  cancelOrder as svcCancelOrder,
  hardDeleteOrder as svcHardDeleteOrder,
  getOrderStats as svcGetOrderStats
} from '../services/adminOrderService.js';

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await svcGetAllOrders(req.query);
  res.status(200).json({ success: true, ...result });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await svcGetOrderById(req.params.id);
  res.status(200).json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await svcUpdateOrderStatus(req.params.id, req.body.status);
  if (req.io) req.io.to('admin').emit('order_updated', order);
  res.status(200).json({ success: true, data: order });
});

const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const order = await svcUpdateOrderItemStatus(req.params.id, req.params.itemId, req.body.status);
  if (req.io) req.io.to('admin').emit('order_updated', order);
  res.status(200).json({ success: true, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await svcCancelOrder(req.params.id);
  if (req.io) req.io.to('admin').emit('order_cancelled', order);
  res.status(200).json({ success: true, message: 'Đã hủy đơn hàng', data: order });
});

const hardDeleteOrder = asyncHandler(async (req, res) => {
  const result = await svcHardDeleteOrder(req.params.id);
  if (req.io) req.io.to('admin').emit('order_deleted', result);
  res.status(200).json({ success: true, message: 'Đã xóa đơn hàng', data: result });
});

const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await svcGetOrderStats();
  res.status(200).json({ success: true, data: stats });
});

export {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  cancelOrder,
  hardDeleteOrder,
  getOrderStats,
};
