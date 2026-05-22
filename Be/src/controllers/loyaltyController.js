import asyncHandler from 'express-async-handler';
import {
  getAvailableRewardVouchers as svcGetAvailableRewardVouchers,
  getLoyaltyPreview as svcGetLoyaltyPreview,
  getMyLoyaltySummary as svcGetMyLoyaltySummary,
} from '../services/loyaltyService.js';

export const preview = asyncHandler(async (req, res) => {
  const data = await svcGetLoyaltyPreview(req.body);
  res.status(200).json({ success: true, data });
});

export const vouchers = asyncHandler(async (_req, res) => {
  const data = await svcGetAvailableRewardVouchers();
  res.status(200).json({ success: true, count: data.length, data });
});

export const me = asyncHandler(async (req, res) => {
  const data = await svcGetMyLoyaltySummary({
    userId: req.user?.id || '',
    phone: req.user?.phone || '',
  });
  res.status(200).json({ success: true, data });
});
