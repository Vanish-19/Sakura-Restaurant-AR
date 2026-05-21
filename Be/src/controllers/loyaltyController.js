import asyncHandler from 'express-async-handler';
import { getLoyaltyPreview as svcGetLoyaltyPreview, getMyLoyaltySummary as svcGetMyLoyaltySummary } from '../services/loyaltyService.js';

export const preview = asyncHandler(async (req, res) => {
  const data = await svcGetLoyaltyPreview(req.body);
  res.status(200).json({ success: true, data });
});

export const me = asyncHandler(async (req, res) => {
  const data = await svcGetMyLoyaltySummary({
    userId: req.user?.id || '',
    phone: req.user?.phone || '',
  });
  res.status(200).json({ success: true, data });
});
