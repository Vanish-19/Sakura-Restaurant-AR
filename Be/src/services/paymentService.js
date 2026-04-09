import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

const createPayment = async (orderId, method) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  if (order.status === 'paid') throw new Error('Order already paid');
  if (order.status === 'cancelled') throw new Error('Cannot pay for cancelled order');

  // Kiểm tra đã có payment chưa
  const existingPayment = await Payment.findOne({ order: orderId, status: 'completed' });
  if (existingPayment) throw new Error('Payment already exists for this order');

  const payment = new Payment({
    order: orderId,
    amount: order.total_amount,
    method,
    status: method === 'cod' ? 'pending' : 'completed',
    paid_at: method === 'online' ? new Date() : null,
  });

  const savedPayment = await payment.save();

  // Nếu online → cập nhật order status luôn
  if (method === 'online') {
    order.status = 'paid';
    await order.save();
  }

  return await Payment.findById(savedPayment._id).populate('order');
};

const getPaymentByOrder = async (orderId) => {
  const payment = await Payment.findOne({ order: orderId }).populate('order');
  if (!payment) throw new Error('Payment not found for this order');
  return payment;
};

const getAllPayments = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find()
      .populate({ path: 'order', populate: { path: 'table', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments()
  ]);

  return {
    payments,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  };
};

const refundPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'refunded') throw new Error('Payment already refunded');
  if (payment.status !== 'completed') throw new Error('Can only refund completed payments');

  payment.status = 'refunded';
  const saved = await payment.save();

  // Revert order status
  await Order.findByIdAndUpdate(payment.order, { status: 'cancelled' });

  return await Payment.findById(saved._id).populate('order');
};

// COD: xác nhận đã nhận tiền khi giao hàng
const confirmCodPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.method !== 'cod') throw new Error('This is not a COD payment');
  if (payment.status !== 'pending') throw new Error('Payment is not in pending status');

  payment.status = 'completed';
  payment.paid_at = new Date();
  const saved = await payment.save();

  await Order.findByIdAndUpdate(payment.order, { status: 'paid' });

  return await Payment.findById(saved._id).populate('order');
};

export { createPayment, getPaymentByOrder, getAllPayments, refundPayment, confirmCodPayment };
