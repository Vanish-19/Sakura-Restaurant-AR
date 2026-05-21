import LoyaltyProfile from '../models/LoyaltyProfile.js';
import RewardVoucher from '../models/RewardVoucher.js';
import LoyaltyTransaction from '../models/LoyaltyTransaction.js';
import Order from '../models/Order.js';
import { createHttpError } from '../utils/AppError.js';

const LOYALTY_POINT_PER_VND = 1 / 10000;

function digitsOnly(value = '') {
  return String(value || '').replace(/\D/g, '');
}

export function normalizeVietnamPhone(phone = '') {
  const digits = digitsOnly(phone);
  if (!digits) return '';
  if (digits.startsWith('84') && digits.length >= 10) return `0${digits.slice(2)}`;
  if (digits.startsWith('0')) return digits;
  return digits;
}

export function calculateEarnPoints(amount = 0) {
  const normalizedAmount = Math.max(0, Number(amount) || 0);
  return Math.floor(normalizedAmount * LOYALTY_POINT_PER_VND);
}

function buildVoucherPreview(voucher, subtotal, availablePoints) {
  const eligibleByPoints = availablePoints >= Number(voucher.points_cost || 0);
  const eligibleByOrder = subtotal >= Number(voucher.min_order_amount || 0);
  const isExpired = voucher.expires_at ? new Date(voucher.expires_at).getTime() < Date.now() : false;
  const quantityLeft = Math.max(0, Number(voucher.quantity || 0) - Number(voucher.used_count || 0));
  const eligibleByStock = quantityLeft > 0 || Number(voucher.quantity || 0) === 0;

  let discountAmount = 0;
  if (voucher.discount_type === 'percentage') {
    discountAmount = subtotal * (Number(voucher.discount_value || 0) / 100);
    if (Number(voucher.max_discount_amount || 0) > 0) {
      discountAmount = Math.min(discountAmount, Number(voucher.max_discount_amount));
    }
  } else {
    discountAmount = Number(voucher.discount_value || 0);
  }

  discountAmount = Math.max(0, Math.min(subtotal, Math.round(discountAmount)));

  return {
    id: String(voucher._id),
    code: voucher.code,
    title: voucher.title,
    description: voucher.description || '',
    points_cost: Number(voucher.points_cost || 0),
    discount_type: voucher.discount_type,
    discount_value: Number(voucher.discount_value || 0),
    min_order_amount: Number(voucher.min_order_amount || 0),
    max_discount_amount: Number(voucher.max_discount_amount || 0),
    expires_at: voucher.expires_at || null,
    quantity_left: quantityLeft,
    discount_amount: discountAmount,
    points_to_earn_after_redeem: calculateEarnPoints(Math.max(0, subtotal - discountAmount)),
    is_eligible: Boolean(voucher.is_active) && !isExpired && eligibleByPoints && eligibleByOrder && eligibleByStock,
    reasons: [
      !voucher.is_active ? 'Voucher đang tạm khóa' : '',
      isExpired ? 'Voucher đã hết hạn' : '',
      !eligibleByPoints ? 'Chưa đủ điểm để đổi voucher' : '',
      !eligibleByOrder ? `Áp dụng cho đơn từ ${Number(voucher.min_order_amount || 0).toLocaleString('vi-VN')}đ` : '',
      !eligibleByStock ? 'Voucher đã hết lượt sử dụng' : '',
    ].filter(Boolean),
  };
}

async function queryActiveVouchers({ session } = {}) {
  const query = RewardVoucher.find({
    is_active: true,
    $or: [{ expires_at: { $exists: false } }, { expires_at: null }, { expires_at: { $gt: new Date() } }],
  }).sort({ points_cost: 1, createdAt: -1 });

  if (session) query.session(session);
  return query;
}

async function findProfileByPhone(phone, { session } = {}) {
  const normalizedPhone = normalizeVietnamPhone(phone);
  if (!normalizedPhone) return null;
  const query = LoyaltyProfile.findOne({ phone: normalizedPhone });
  if (session) query.session(session);
  return query;
}

async function findProfileByUser({ userId = '', phone = '' } = {}) {
  if (userId) {
    const byUser = await LoyaltyProfile.findOne({ user: userId });
    if (byUser) return byUser;
  }

  return findProfileByPhone(phone);
}

export async function findOrCreateLoyaltyProfile(
  { phone, displayName = '', userId = null },
  { session } = {},
) {
  const normalizedPhone = normalizeVietnamPhone(phone);
  if (!normalizedPhone) return null;

  let profile = await findProfileByPhone(normalizedPhone, { session });
  if (!profile) {
    const [created] = await LoyaltyProfile.create(
      [
        {
          phone: normalizedPhone,
          display_name: String(displayName || '').trim(),
          user: userId || undefined,
        },
      ],
      session ? { session } : undefined,
    );
    profile = created;
  } else {
    let shouldSave = false;
    if (displayName && !profile.display_name) {
      profile.display_name = String(displayName).trim();
      shouldSave = true;
    }
    if (userId && !profile.user) {
      profile.user = userId;
      shouldSave = true;
    }
    if (shouldSave) await profile.save(session ? { session } : undefined);
  }

  return profile;
}

export async function getLoyaltyPreview({ phone, subtotal = 0 }) {
  const normalizedPhone = normalizeVietnamPhone(phone);
  if (!normalizedPhone) {
    return {
      phone: '',
      profile: null,
      available_vouchers: [],
      points_to_earn: calculateEarnPoints(subtotal),
    };
  }

  const profile = await findProfileByPhone(normalizedPhone);
  const vouchers = await queryActiveVouchers();
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const availablePoints = Number(profile?.available_points || 0);

  return {
    phone: normalizedPhone,
    profile: profile
      ? {
          id: String(profile._id),
          display_name: profile.display_name || '',
          available_points: availablePoints,
          total_points_earned: Number(profile.total_points_earned || 0),
          total_orders_paid: Number(profile.total_orders_paid || 0),
          lifetime_spend: Number(profile.lifetime_spend || 0),
          last_rewarded_at: profile.last_rewarded_at || null,
        }
      : null,
    points_to_earn: calculateEarnPoints(safeSubtotal),
    available_vouchers: vouchers.map((voucher) => buildVoucherPreview(voucher, safeSubtotal, availablePoints)),
  };
}

export async function getMyLoyaltySummary({ userId = '', phone = '' } = {}) {
  const profile = await findProfileByUser({ userId, phone });
  if (!profile) {
    return {
      phone: normalizeVietnamPhone(phone),
      profile: null,
    };
  }

  return {
    phone: profile.phone,
    profile: {
      id: String(profile._id),
      display_name: profile.display_name || '',
      available_points: Number(profile.available_points || 0),
      total_points_earned: Number(profile.total_points_earned || 0),
      total_points_redeemed: Number(profile.total_points_redeemed || 0),
      total_orders_paid: Number(profile.total_orders_paid || 0),
      lifetime_spend: Number(profile.lifetime_spend || 0),
      last_rewarded_at: profile.last_rewarded_at || null,
    },
  };
}

export async function reserveRewardVoucherForOrder(
  { phone, voucherId, subtotal, orderId, customerName = '', userId = null },
  { session } = {},
) {
  if (!voucherId) {
    return {
      profile: await findOrCreateLoyaltyProfile({ phone, displayName: customerName, userId }, { session }),
      discountAmount: 0,
      rewardRedemption: null,
    };
  }

  const normalizedPhone = normalizeVietnamPhone(phone);
  if (!normalizedPhone) {
    throw createHttpError('Cần số điện thoại để đổi voucher', 400, 'LOYALTY_PHONE_REQUIRED');
  }

  const profile = await findOrCreateLoyaltyProfile(
    { phone: normalizedPhone, displayName: customerName, userId },
    { session },
  );

  const voucherQuery = RewardVoucher.findById(voucherId);
  if (session) voucherQuery.session(session);
  const voucher = await voucherQuery;

  if (!voucher) {
    throw createHttpError('Voucher đổi thưởng không tồn tại', 404, 'REWARD_VOUCHER_NOT_FOUND');
  }

  const preview = buildVoucherPreview(voucher, Math.max(0, Number(subtotal) || 0), Number(profile.available_points || 0));
  if (!preview.is_eligible) {
    throw createHttpError(preview.reasons[0] || 'Voucher chưa đủ điều kiện áp dụng', 409, 'REWARD_VOUCHER_NOT_ELIGIBLE');
  }

  profile.available_points = Math.max(0, Number(profile.available_points || 0) - preview.points_cost);
  profile.total_points_redeemed = Number(profile.total_points_redeemed || 0) + preview.points_cost;
  await profile.save(session ? { session } : undefined);

  await LoyaltyTransaction.create(
    [
      {
        profile: profile._id,
        phone: normalizedPhone,
        order: orderId,
        voucher: voucher._id,
        type: 'redeem',
        points: preview.points_cost,
        amount: preview.discount_amount,
        note: `Đổi voucher ${voucher.code}`,
      },
    ],
    session ? { session } : undefined,
  );

  return {
    profile,
    discountAmount: preview.discount_amount,
    rewardRedemption: {
      voucher: voucher._id,
      code: voucher.code,
      title: voucher.title,
      points_cost: preview.points_cost,
      discount_type: voucher.discount_type,
      discount_value: Number(voucher.discount_value || 0),
      max_discount_amount: Number(voucher.max_discount_amount || 0),
      discount_amount: preview.discount_amount,
      status: 'reserved',
    },
  };
}

export async function finalizeLoyaltyForPaidOrder(orderId, { session } = {}) {
  const query = Order.findById(orderId);
  if (session) query.session(session);
  const order = await query;
  if (!order) return null;

  const phone = normalizeVietnamPhone(order?.loyalty?.phone || order.customer_phone || '');
  if (!phone) return null;

  const profile = await findOrCreateLoyaltyProfile(
    {
      phone,
      displayName: order.customer_name || '',
      userId: order.user || null,
    },
    { session },
  );

  if (order?.loyalty?.reward_redemption?.voucher && order.loyalty.reward_redemption.status === 'reserved') {
    const voucherQuery = RewardVoucher.findById(order.loyalty.reward_redemption.voucher);
    if (session) voucherQuery.session(session);
    const voucher = await voucherQuery;
    if (voucher) {
      voucher.used_count = Number(voucher.used_count || 0) + 1;
      await voucher.save(session ? { session } : undefined);
    }

    order.loyalty.reward_redemption.status = 'used';
  }

  if (!order.loyalty?.points_awarded_at) {
    const pointsToAward = calculateEarnPoints(Number(order.total_amount || 0));
    if (pointsToAward > 0) {
      profile.available_points = Number(profile.available_points || 0) + pointsToAward;
      profile.total_points_earned = Number(profile.total_points_earned || 0) + pointsToAward;
      profile.last_rewarded_at = new Date();

      await LoyaltyTransaction.create(
        [
          {
            profile: profile._id,
            phone,
            order: order._id,
            type: 'earn',
            points: pointsToAward,
            amount: Number(order.total_amount || 0),
            note: `Tích điểm cho đơn ${String(order._id).slice(-6).toUpperCase()}`,
          },
        ],
        session ? { session } : undefined,
      );
    }

    profile.total_orders_paid = Number(profile.total_orders_paid || 0) + 1;
    profile.lifetime_spend = Number(profile.lifetime_spend || 0) + Number(order.total_amount || 0);
    await profile.save(session ? { session } : undefined);

    order.loyalty.profile = profile._id;
    order.loyalty.points_earned = pointsToAward;
    order.loyalty.points_awarded_at = new Date();
    await order.save(session ? { session } : undefined);
  } else if (!order.loyalty?.profile) {
    order.loyalty.profile = profile._id;
    await order.save(session ? { session } : undefined);
  }

  return { order, profile };
}

export async function revertLoyaltyForCancelledOrder(orderId, { session } = {}) {
  const query = Order.findById(orderId);
  if (session) query.session(session);
  const order = await query;
  if (!order) return null;

  const phone = normalizeVietnamPhone(order?.loyalty?.phone || order.customer_phone || '');
  const reward = order?.loyalty?.reward_redemption || null;
  const shouldRefundEarnedPoints = Boolean(order?.loyalty?.points_awarded_at) && Number(order?.loyalty?.points_earned || 0) > 0;

  if (phone && (reward?.voucher || shouldRefundEarnedPoints)) {
    const profile = await findOrCreateLoyaltyProfile(
      {
        phone,
        displayName: order.customer_name || '',
        userId: order.user || null,
      },
      { session },
    );

    if (
      reward?.voucher &&
      ['reserved', 'used'].includes(reward.status) &&
      Number(reward.points_cost || 0) > 0
    ) {
      if (reward.status === 'used') {
        const voucherQuery = RewardVoucher.findById(reward.voucher);
        if (session) voucherQuery.session(session);
        const voucher = await voucherQuery;
        if (voucher) {
          voucher.used_count = Math.max(0, Number(voucher.used_count || 0) - 1);
          await voucher.save(session ? { session } : undefined);
        }
      }

      profile.available_points = Number(profile.available_points || 0) + Number(reward.points_cost || 0);
      profile.total_points_redeemed = Math.max(
        0,
        Number(profile.total_points_redeemed || 0) - Number(reward.points_cost || 0),
      );

      await LoyaltyTransaction.create(
        [
          {
            profile: profile._id,
            phone,
            order: order._id,
            voucher: reward.voucher,
            type: 'redeem_refund',
            points: Number(reward.points_cost || 0),
            amount: Number(reward.discount_amount || 0),
            note: `Hoàn điểm do hủy đơn ${String(order._id).slice(-6).toUpperCase()}`,
          },
        ],
        session ? { session } : undefined,
      );

      order.loyalty.reward_redemption.status = 'refunded';
    }

    if (shouldRefundEarnedPoints) {
      const awardedPoints = Number(order.loyalty.points_earned || 0);
      profile.available_points = Math.max(0, Number(profile.available_points || 0) - awardedPoints);
      profile.total_points_earned = Math.max(0, Number(profile.total_points_earned || 0) - awardedPoints);
      profile.total_orders_paid = Math.max(0, Number(profile.total_orders_paid || 0) - 1);
      profile.lifetime_spend = Math.max(0, Number(profile.lifetime_spend || 0) - Number(order.total_amount || 0));

      await LoyaltyTransaction.create(
        [
          {
            profile: profile._id,
            phone,
            order: order._id,
            type: 'earn_reversal',
            points: awardedPoints,
            amount: Number(order.total_amount || 0),
            note: `Hoàn tích điểm do refund đơn ${String(order._id).slice(-6).toUpperCase()}`,
          },
        ],
        session ? { session } : undefined,
      );

      order.loyalty.points_earned = 0;
      order.loyalty.points_awarded_at = null;
    }

    order.loyalty.profile = profile._id;
    await profile.save(session ? { session } : undefined);
    await order.save(session ? { session } : undefined);
  }

  return order;
}

export async function getLoyaltyAdminOverview() {
  const [profileCount, voucherCount, totals, topProfiles, recentTransactions] = await Promise.all([
    LoyaltyProfile.countDocuments(),
    RewardVoucher.countDocuments(),
    LoyaltyProfile.aggregate([
      {
        $group: {
          _id: null,
          available_points: { $sum: '$available_points' },
          total_points_earned: { $sum: '$total_points_earned' },
          total_points_redeemed: { $sum: '$total_points_redeemed' },
          lifetime_spend: { $sum: '$lifetime_spend' },
        },
      },
    ]),
    LoyaltyProfile.find().sort({ available_points: -1, updatedAt: -1 }).limit(5).lean(),
    LoyaltyTransaction.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('voucher', 'code title')
      .populate('order', 'status total_amount')
      .lean(),
  ]);

  return {
    summary: {
      total_profiles: profileCount,
      total_vouchers: voucherCount,
      available_points: Number(totals[0]?.available_points || 0),
      total_points_earned: Number(totals[0]?.total_points_earned || 0),
      total_points_redeemed: Number(totals[0]?.total_points_redeemed || 0),
      lifetime_spend: Number(totals[0]?.lifetime_spend || 0),
    },
    top_profiles: topProfiles,
    recent_transactions: recentTransactions,
  };
}

export async function getLoyaltyProfiles({ search = '' } = {}) {
  const keyword = String(search || '').trim();
  const query = {};
  if (keyword) {
    query.$or = [
      { phone: { $regex: keyword, $options: 'i' } },
      { display_name: { $regex: keyword, $options: 'i' } },
    ];
  }

  return LoyaltyProfile.find(query).sort({ updatedAt: -1 }).lean();
}

export async function getRewardVouchers() {
  return RewardVoucher.find().sort({ is_active: -1, points_cost: 1, createdAt: -1 }).lean();
}

export async function createRewardVoucher(payload) {
  const voucher = new RewardVoucher({
    ...payload,
    code: String(payload.code || '').trim().toUpperCase(),
  });
  return voucher.save();
}

export async function updateRewardVoucher(id, payload) {
  const updated = await RewardVoucher.findByIdAndUpdate(
    id,
    { ...payload, ...(payload.code ? { code: String(payload.code).trim().toUpperCase() } : {}) },
    { new: true, runValidators: true },
  );
  if (!updated) throw createHttpError('Voucher không tồn tại', 404, 'REWARD_VOUCHER_NOT_FOUND');
  return updated;
}

export async function deleteRewardVoucher(id) {
  const deleted = await RewardVoucher.findByIdAndDelete(id);
  if (!deleted) throw createHttpError('Voucher không tồn tại', 404, 'REWARD_VOUCHER_NOT_FOUND');
  return deleted;
}
