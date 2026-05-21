import asyncHandler from 'express-async-handler';
import {
  createRewardVoucher as svcCreateRewardVoucher,
  deleteRewardVoucher as svcDeleteRewardVoucher,
  getLoyaltyAdminOverview as svcGetLoyaltyAdminOverview,
  getLoyaltyProfiles as svcGetLoyaltyProfiles,
  getRewardVouchers as svcGetRewardVouchers,
  updateRewardVoucher as svcUpdateRewardVoucher,
} from '../services/loyaltyService.js';

export const getOverview = asyncHandler(async (_req, res) => {
  const data = await svcGetLoyaltyAdminOverview();
  res.status(200).json({ success: true, data });
});

export const getProfiles = asyncHandler(async (req, res) => {
  const data = await svcGetLoyaltyProfiles(req.query);
  res.status(200).json({ success: true, count: data.length, data });
});

export const getVouchers = asyncHandler(async (_req, res) => {
  const data = await svcGetRewardVouchers();
  res.status(200).json({ success: true, count: data.length, data });
});

export const createVoucher = asyncHandler(async (req, res) => {
  const item = await svcCreateRewardVoucher(req.body);
  if (req.io) req.io.to('admin').emit('loyalty_voucher_created', item);
  res.status(201).json({ success: true, data: item });
});

export const updateVoucher = asyncHandler(async (req, res) => {
  const item = await svcUpdateRewardVoucher(req.params.id, req.body);
  if (req.io) req.io.to('admin').emit('loyalty_voucher_updated', item);
  res.status(200).json({ success: true, data: item });
});

export const deleteVoucher = asyncHandler(async (req, res) => {
  const item = await svcDeleteRewardVoucher(req.params.id);
  if (req.io) req.io.to('admin').emit('loyalty_voucher_deleted', { id: item._id });
  res.status(200).json({ success: true, message: 'Đã xóa voucher đổi thưởng' });
});
