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

export const getOne = asyncHandler(async (req, res) => {
  const admin = await adminAccountService.getAdminById(req.params.id);
  res.status(200).json({ success: true, data: admin });
});

export const toggleStatus = asyncHandler(async (req, res) => {
  const admin = await adminAccountService.toggleAdminStatus(req.params.id);
  res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái admin', data: admin });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const admin = await adminAccountService.resetAdminPassword(req.params.id, password);
  res.status(200).json({ success: true, message: 'Đã cập nhật mật khẩu admin', data: admin });
});
