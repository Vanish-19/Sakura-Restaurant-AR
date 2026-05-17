import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { createHttpError } from '../utils/AppError.js';

const createPayment = async (orderId, method) => {
  const session = await mongoose.startSession();
  let savedPaymentId = null;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');
      if (order.status === 'paid') throw createHttpError('Order already paid', 409, 'ORDER_ALREADY_PAID');
      if (order.status === 'cancelled') throw createHttpError('Cannot pay for cancelled order', 409, 'ORDER_CANCELLED');

      const existingPayment = await Payment.findOne({ order: orderId, method }).session(session);
      if (existingPayment) {
        if (existingPayment.status === 'completed') {
          throw createHttpError('Payment already completed for this order', 409, 'PAYMENT_ALREADY_COMPLETED');
        }
        savedPaymentId = existingPayment._id;
        return;
      }

      const [payment] = await Payment.create(
        [
          {
            order: orderId,
            amount: order.total_amount,
            method,
            status: method === 'cod' ? 'pending' : 'completed',
            paid_at: method === 'online' ? new Date() : null,
          },
        ],
        { session },
      );

      if (method === 'online') {
        order.status = 'paid';
        await order.save({ session });
      }

      savedPaymentId = payment._id;
    });
  } finally {
    await session.endSession();
  }

  return Payment.findById(savedPaymentId).populate('order');
};

const getPaymentByOrder = async (orderId) => {
  const payment = await Payment.findOne({ order: orderId }).populate('order');
  if (!payment) throw createHttpError('Payment not found for this order', 404, 'PAYMENT_NOT_FOUND');
  return payment;
};

const getAllPayments = async ({ page = 1, limit = 20 }) => {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (normalizedPage - 1) * normalizedLimit;

  const [payments, total] = await Promise.all([
    Payment.find()
      .populate({ path: 'order', populate: { path: 'table', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(normalizedLimit),
    Payment.countDocuments(),
  ]);

  return {
    payments,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      pages: Math.ceil(total / normalizedLimit),
    },
  };
};

const refundPayment = async (paymentId) => {
  const session = await mongoose.startSession();
  let savedPaymentId = null;

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) throw createHttpError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
      if (payment.status === 'refunded') throw createHttpError('Payment already refunded', 409, 'PAYMENT_ALREADY_REFUNDED');
      if (payment.status !== 'completed') throw createHttpError('Can only refund completed payments', 409, 'PAYMENT_NOT_COMPLETED');

      payment.status = 'refunded';
      const saved = await payment.save({ session });

      await Order.findByIdAndUpdate(payment.order, { status: 'cancelled' }, { session });
      savedPaymentId = saved._id;
    });
  } finally {
    await session.endSession();
  }

  return Payment.findById(savedPaymentId).populate('order');
};

const confirmCodPayment = async (paymentId) => {
  const session = await mongoose.startSession();
  let savedPaymentId = null;

  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) throw createHttpError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
      if (payment.method !== 'cod') throw createHttpError('This is not a COD payment', 400, 'PAYMENT_NOT_COD');
      if (payment.status !== 'pending') throw createHttpError('Payment is not pending', 409, 'PAYMENT_NOT_PENDING');

      payment.status = 'completed';
      payment.paid_at = new Date();
      const saved = await payment.save({ session });

      await Order.findByIdAndUpdate(payment.order, { status: 'paid' }, { session });
      savedPaymentId = saved._id;
    });
  } finally {
    await session.endSession();
  }

  return Payment.findById(savedPaymentId).populate('order');
};

export { createPayment, getPaymentByOrder, getAllPayments, refundPayment, confirmCodPayment };
