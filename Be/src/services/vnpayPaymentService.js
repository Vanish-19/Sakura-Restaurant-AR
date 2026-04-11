import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

function getVnpayConfig() {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/v1/payments/vnpay/return';
  const ipnUrl = process.env.VNPAY_IPN_URL;
  const vnpayUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

  if (!tmnCode || !hashSecret || !ipnUrl) {
    throw new Error('VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_IPN_URL must be configured');
  }

  return {
    tmnCode,
    hashSecret,
    returnUrl,
    ipnUrl,
    vnpayUrl,
    locale: process.env.VNPAY_LOCALE || 'vn',
    currCode: process.env.VNPAY_CURR_CODE || 'VND',
    orderType: process.env.VNPAY_ORDER_TYPE || 'other',
  };
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function normalizeClientIp(clientIp) {
  if (!clientIp) return '127.0.0.1';
  const first = String(clientIp).split(',')[0].trim();
  if (first.startsWith('::ffff:')) return first.replace('::ffff:', '');
  if (first === '::1') return '127.0.0.1';
  return first;
}

function formatVnpDate(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${getPart('year')}${getPart('month')}${getPart('day')}${getPart('hour')}${getPart('minute')}${getPart('second')}`;
}

function buildTxnRef(orderId) {
  const digits = String(orderId).replace(/\D/g, '');
  const tail = digits.slice(-6) || '000000';
  const stamp = Date.now().toString().slice(-8);
  const randomSuffix = Math.floor(Math.random() * 90 + 10).toString();
  return `${stamp}${tail}${randomSuffix}`.slice(0, 12);
}

function buildSignedQuery(params, hashSecret) {
  const sortedKeys = Object.keys(params).filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '').sort();

  const hashData = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const secureHash = crypto
    .createHmac('sha512', hashSecret)
    .update(Buffer.from(hashData, 'utf-8'))
    .digest('hex');

  const query = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  return { query, secureHash };
}

function verifySignedQuery(query, hashSecret) {
  const params = { ...query };
  const secureHash = String(params.vnp_SecureHash || '').toLowerCase();
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedKeys = Object.keys(params).sort();
  const hashData = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const calculated = crypto
    .createHmac('sha512', hashSecret)
    .update(Buffer.from(hashData, 'utf-8'))
    .digest('hex');

  return { valid: calculated.toLowerCase() === secureHash, params };
}

export async function createVnpayPaymentLinkForOrder(order, clientIp) {
  const config = getVnpayConfig();
  const txnRef = buildTxnRef(order._id);
  const amount = Math.max(1, Math.round(Number(order.total_amount || 0))) * 100;
  const now = new Date();
  const expireMinutes = Math.max(5, Number(process.env.VNPAY_EXPIRE_MINUTES || 15));

  const createDate = formatVnpDate(now);
  const expireDate = formatVnpDate(new Date(now.getTime() + expireMinutes * 60 * 1000));

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: amount,
    vnp_CurrCode: config.currCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don ${String(order._id).slice(-6).toUpperCase()}`.slice(0, 255),
    vnp_OrderType: config.orderType,
    vnp_Locale: config.locale,
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpnUrl: config.ipnUrl,
    vnp_IpAddr: normalizeClientIp(clientIp),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
    vnp_Bill_Mobile: order.customer_phone || '',
    vnp_Bill_Email: '',
    vnp_Bill_FirstName: order.customer_name || 'Khach hang',
    vnp_Bill_Address: order.delivery_address || '',
    vnp_Bill_City: '',
    vnp_Bill_Country: 'VN',
  };

  const { query, secureHash } = buildSignedQuery(params, config.hashSecret);
  const checkoutUrl = `${config.vnpayUrl}?${query}&vnp_SecureHash=${secureHash}`;

  const payment = await Payment.findOneAndUpdate(
    { order: order._id, method: 'online' },
    {
      order: order._id,
      amount: order.total_amount,
      method: 'online',
      status: 'pending',
      paid_at: null,
      provider: 'vnpay',
      provider_ref: txnRef,
      checkout_url: checkoutUrl,
      order_code: Number(txnRef),
      currency: 'vnd',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { checkoutUrl, payment, txnRef };
}

export async function handleVnpayIpnEvent(query) {
  const config = getVnpayConfig();
  const { valid, params } = verifySignedQuery(query, config.hashSecret);

  if (!valid) {
    return { handled: false, rspCode: '97', message: 'Invalid signature' };
  }

  if (params.vnp_TmnCode !== config.tmnCode) {
    return { handled: false, rspCode: '02', message: 'Invalid terminal code' };
  }

  const txnRef = String(params.vnp_TxnRef || '');
  const amount = Number(params.vnp_Amount || 0) / 100;
  const responseCode = String(params.vnp_ResponseCode || '');
  const transactionStatus = String(params.vnp_TransactionStatus || '');

  const payment = await Payment.findOne({ method: 'online', provider_ref: txnRef });
  if (!payment) {
    return { handled: false, rspCode: '01', message: 'Order not found' };
  }

  if (Number(payment.amount) !== Number(amount)) {
    return { handled: false, rspCode: '04', message: 'Invalid amount' };
  }

  if (payment.status === 'completed') {
    return { handled: true, rspCode: '02', message: 'Order already confirmed', payment };
  }

  if (responseCode === '00' && transactionStatus === '00') {
    payment.status = 'completed';
    payment.paid_at = new Date();
    payment.provider = 'vnpay';
    payment.provider_ref = txnRef;

    const saved = await payment.save();
    await Order.findByIdAndUpdate(payment.order, { status: 'paid' });
    const populatedPayment = await Payment.findById(saved._id).populate('order');
    return { handled: true, rspCode: '00', message: 'Confirm Success', payment: populatedPayment };
  }

  return { handled: false, rspCode: '00', message: 'Payment not completed', payment };
}

export function buildVnpayReturnRedirectUrl(query) {
  const frontendUrl = getFrontendUrl();
  const responseCode = String(query?.vnp_ResponseCode || '');
  const transactionStatus = String(query?.vnp_TransactionStatus || '');
  const paymentStatus = responseCode === '00' && transactionStatus === '00' ? 'success' : 'cancelled';
  return `${frontendUrl}/cart?payment=${paymentStatus}`;
}