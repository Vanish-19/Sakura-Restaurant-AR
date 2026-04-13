import asyncHandler from 'express-async-handler';
import { 
  login as serviceLogin, 
  register as serviceRegister,
  refresh as serviceRefresh,
  logout as serviceLogout,
} from '../services/adminAuthService.js';

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await serviceLogin(username, password);
  res.status(200).json({ message: 'Đăng nhập thành công', data: result });
});

const register = asyncHandler(async (req, res) => {
  const { username, password, name, email, role } = req.body;
  const admin = await serviceRegister(username, password, name, email, role);
  res.status(201).json({ message: 'Đã tạo tài khoản admin', data: admin });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await serviceRefresh(refreshToken);
  res.status(200).json({ message: 'Làm mới token thành công', data: result });
});

const logout = asyncHandler(async (req, res) => {
  await serviceLogout(req.admin?.id || req.admin?.sub);
  res.status(200).json({ message: 'Đăng xuất thành công' });
});

export { login, register, refresh, logout };
