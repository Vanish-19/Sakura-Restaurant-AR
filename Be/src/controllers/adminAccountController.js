import asyncHandler from 'express-async-handler';
import * as adminAccountService from '../services/adminAccountService.js';

export const getAll = asyncHandler(async (req, res) => {
  const admins = await adminAccountService.getAllAdmins();
  res.status(200).json({ success: true, data: admins });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminAccountService.getAdminStats();
  res.status(200).json({ success: true, data: stats });
});

export const toggleStatus = asyncHandler(async (req, res) => {
  const admin = await adminAccountService.toggleAdminStatus(req.params.id);
  res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái admin', data: admin });
});
