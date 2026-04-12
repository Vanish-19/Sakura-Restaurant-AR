import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function getSepayConfig() {
  const checkoutBaseUrl = process.env.SEPAY_CHECKOUT_URL || 'https://qr.sepay.vn/img';
  const returnUrl = process.env.SEPAY_RETURN_URL || 'http://localhost:3000/api/v1/payments/sepay/return';

  return {
    apiKey: process.env.SEPAY_API_KEY || '',
    qrAccountNumber: process.env.SEPAY_QR_ACCOUNT_NUMBER || '',
    qrBank: process.env.SEPAY_QR_BANK || '',
    qrDescriptionPrefix: process.env.SEPAY_QR_DESCRIPTION_PREFIX || 'SEVQR TKPV88',
    checkoutBaseUrl,
    returnUrl,
  };
}

function buildTxnRef(orderId) {
  const digits = String(orderId).replace(/\D/g, '');
  const tail = digits.slice(-6) || '000000';
  const stamp = Date.now().toString().slice(-8);
  const randomSuffix = Math.floor(Math.random() * 90 + 10).toString();
  return `${stamp}${tail}${randomSuffix}`.slice(0, 12);
}

function normalizeStatus(status) {
  const text = String(status || '').toLowerCase();
  if (['paid', 'success', 'completed', 'done'].includes(text)) return 'completed';
  if (['pending', 'processing'].includes(text)) return 'pending';
  return 'unknown';
}

function verifyWebhookAuthorization(authorization, apiKey) {
  if (!apiKey) return true;

  const headerValue = String(authorization || '').trim();
  if (!headerValue) return true;

  const normalized = headerValue.toLowerCase();
  const expectedApikey = `apikey ${apiKey}`.toLowerCase();
  const expectedBearer = `bearer ${apiKey}`.toLowerCase();

  return normalized === expectedApikey || normalized === expectedBearer;
}

function extractTxnRef(payload) {
  const direct =
    payload?.txnRef ||
    payload?.orderCode ||
    payload?.reference ||
    payload?.referenceCode ||
    payload?.code;
  if (direct) return String(direct);

  const fromContent = payload?.transferContent || payload?.content || payload?.description || '';
  const text = String(fromContent);
  const matched = text.match(/\b\d{10,16}\b/);
  return matched ? matched[0] : '';
}

function isIncomingTransfer(payload) {
  const transferType = String(payload?.transferType || '').toLowerCase();
  if (transferType === 'in') return true;

  const status = String(payload?.status || '').toLowerCase();
  if (['paid', 'success', 'completed', 'done'].includes(status)) return true;

  return false;
}

function extractAmount(payload) {
  const candidates = [
    payload?.amount,
    payload?.transferAmount,
    payload?.amount_in,
    payload?.total,
  ];

  for (const value of candidates) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue) && numberValue > 0) {
      return numberValue;
    }
  }

  return 0;
}

export async function createSepayPaymentLinkForOrder(order) {
  const config = getSepayConfig();
  const txnRef = buildTxnRef(order._id);
  const checkoutUrl = new URL(config.checkoutBaseUrl);

  if (checkoutUrl.hostname.includes('qr.sepay.vn')) {
    if (!config.qrAccountNumber || !config.qrBank) {
      throw new Error('SEPAY_QR_ACCOUNT_NUMBER and SEPAY_QR_BANK must be configured for QR checkout');
    }

    checkoutUrl.searchParams.set('acc', config.qrAccountNumber);
    checkoutUrl.searchParams.set('bank', config.qrBank);
    checkoutUrl.searchParams.set('amount', String(Math.round(Number(order.total_amount || 0))));
    checkoutUrl.searchParams.set('des', `${config.qrDescriptionPrefix} ${txnRef}`.trim());
  } else {
    checkoutUrl.searchParams.set('txnRef', txnRef);
    checkoutUrl.searchParams.set('amount', String(Math.round(Number(order.total_amount || 0))));
    checkoutUrl.searchParams.set('returnUrl', config.returnUrl);
    checkoutUrl.searchParams.set('orderInfo', `Thanh toan don ${String(order._id).slice(-6).toUpperCase()}`);

    if (config.apiKey) {
      checkoutUrl.searchParams.set('apiKey', config.apiKey);
    }
  }

  const payment = await Payment.findOneAndUpdate(
    { order: order._id, method: 'online' },
    {
      order: order._id,
      amount: order.total_amount,
      method: 'online',
      status: 'pending',
      paid_at: null,
      provider: 'sepay',
      provider_ref: txnRef,
      checkout_url: checkoutUrl.toString(),
      order_code: Number(txnRef),
      currency: 'vnd',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { checkoutUrl: checkoutUrl.toString(), payment, txnRef };
}

export async function handleSepayWebhookEvent(payload, authorization) {
  const config = getSepayConfig();
  const validAuthorization = verifyWebhookAuthorization(authorization, config.apiKey);

  if (!validAuthorization) {
    return { handled: false, rspCode: '97', message: 'Invalid authorization' };
  }

  const txnRef = extractTxnRef(payload);
  if (!txnRef) {
    return { handled: false, rspCode: '01', message: 'Transaction reference missing' };
  }

  const incomingAmount = extractAmount(payload);

  let payment = await Payment.findOne({ method: 'online', provider: 'sepay', provider_ref: txnRef });

  if (!payment && Number.isFinite(incomingAmount) && incomingAmount > 0) {
    payment = await Payment.findOne({
      method: 'online',
      provider: 'sepay',
      status: 'pending',
      amount: incomingAmount,
    }).sort({ createdAt: -1 });
  }

  if (!payment && Number.isFinite(Number(txnRef))) {
    payment = await Payment.findOne({
      method: 'online',
      provider: 'sepay',
      order_code: Number(txnRef),
    });
  }

  if (!payment) {
    return { handled: false, rspCode: '01', message: 'Order not found' };
  }

  if (incomingAmount > 0 && Number(payment.amount) !== Number(incomingAmount)) {
    return { handled: false, rspCode: '04', message: 'Invalid amount' };
  }

  if (payment.status === 'completed') {
    return { handled: true, rspCode: '02', message: 'Order already confirmed', payment };
  }

  const status = normalizeStatus(payload?.status);
  if (status !== 'completed' && !isIncomingTransfer(payload)) {
    return { handled: false, rspCode: '00', message: 'Payment not completed', payment };
  }

  payment.status = 'completed';
  payment.paid_at = new Date();
  payment.provider = 'sepay';
  payment.provider_ref = txnRef;

  const saved = await payment.save();
  await Order.findByIdAndUpdate(payment.order, { status: 'paid' });
  const populatedPayment = await Payment.findById(saved._id).populate('order');
  return { handled: true, rspCode: '00', message: 'Confirm Success', payment: populatedPayment };
}

export function buildSepayReturnRedirectUrl(query) {
  const frontendUrl = getFrontendUrl();
  const status = normalizeStatus(query?.status || query?.payment_status || query?.result);
  const paymentStatus = status === 'completed' ? 'success' : 'cancelled';
  return `${frontendUrl}/cart?payment=${paymentStatus}`;
}
