import asyncHandler from 'express-async-handler';
import {
  createPayment as svcCreatePayment,
  getAllPayments as svcGetAllPayments,
  getPaymentByOrder as svcGetPaymentByOrder,
  refundPayment as svcRefundPayment,
  confirmCodPayment as svcConfirmCodPayment
} from '../services/paymentService.js';

const createPayment = asyncHandler(async (req, res) => {
  const { order_id, method } = req.body;
  const payment = await svcCreatePayment(order_id, method);
  if (req.io) req.io.to('admin').emit('payment_completed', payment);
  res.status(201).json({ success: true, data: payment });
});

const getAllPayments = asyncHandler(async (req, res) => {
  const result = await svcGetAllPayments(req.query);
  res.status(200).json({ success: true, ...result });
});

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const payment = await svcGetPaymentByOrder(orderId);
  res.status(200).json({ success: true, data: payment });
});

const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await svcRefundPayment(id);
  if (req.io) req.io.to('admin').emit('payment_refunded', payment);
  res.status(200).json({ success: true, message: 'Payment refunded', data: payment });
});

const confirmCodPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await svcConfirmCodPayment(id);
  if (req.io) req.io.to('admin').emit('payment_completed', payment);
  res.status(200).json({ success: true, message: 'COD payment confirmed', data: payment });
});

export { createPayment, getAllPayments, getPaymentByOrder, refundPayment, confirmCodPayment };
