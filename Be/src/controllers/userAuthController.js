import asyncHandler from 'express-async-handler';
import {
  issuePhoneToken,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from '../services/userAuthService.js';

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json({ success: true, message: 'Đăng ký thành công', data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.status(200).json({ success: true, message: 'Đăng nhập thành công', data: result });
});

const loginWithPhone = asyncHandler(async (req, res) => {
  const result = await issuePhoneToken(req.body);
  res.status(200).json({ success: true, message: 'Xác thực số điện thoại thành công', data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await refreshUserToken(refreshToken);
  res.status(200).json({ success: true, message: 'Làm mới token thành công', data: result });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user?.id);
  res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
});

export { register, login, loginWithPhone, refresh, me, logout };
