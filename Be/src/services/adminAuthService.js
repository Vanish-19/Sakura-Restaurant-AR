import Admin from '../models/Admin.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './tokenService.js';

function normalizeAdminRole(role) {
  if (role === 'superAdmin') return 'super_admin';
  if (role === 'staff') return 'admin';
  if (role === 'super_admin') return 'super_admin';
  return 'admin';
}

const formatAdminPayload = (admin) => ({
  sub: String(admin._id),
  id: String(admin._id),
  username: admin.username,
  role: normalizeAdminRole(admin.role),
  type: 'admin',
});

const buildTokenResult = (admin) => {
  const payload = formatAdminPayload(admin);

  const accessToken = signAccessToken(payload, { expiresIn: '24h' });
  const refreshToken = signRefreshToken(payload, { expiresIn: '14d' });

  return { accessToken, refreshToken };
};

const login = async (username, password) => {
  const admin = await Admin.findOne({ username });
  if (!admin) throw new Error('Sai tài khoản hoặc mật khẩu');

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw new Error('Sai tài khoản hoặc mật khẩu');

  const { _id: id, role } = admin;
  const { accessToken, refreshToken } = buildTokenResult(admin);

  admin.lastLogin = new Date();
  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    admin: {
      id,
      username,
      role: normalizeAdminRole(role),
      name: admin.name || '',
      email: admin.email || '',
    },
  };
};

const register = async (username, password, name, email, role = 'admin') => {
  const existing = await Admin.findOne({ $or: [{ username }, { email }] });
  if (existing) throw new Error('Tên đăng nhập hoặc email đã tồn tại');

  const admin = new Admin({ username, password, name, email, role: normalizeAdminRole(role) });
  const saved = await admin.save();
  
  const { _id: id } = saved;
  return { id, username, role: normalizeAdminRole(saved.role), name, email };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new Error('Thiếu refresh token');

  const decoded = verifyRefreshToken(refreshToken);
  if (decoded.type !== 'admin') throw new Error('Loại refresh token không hợp lệ');

  const adminId = decoded.sub || decoded.id;
  const admin = await Admin.findById(adminId);
  if (!admin || admin.refreshToken !== refreshToken) {
    throw new Error('Refresh token không hợp lệ');
  }

  const nextTokens = buildTokenResult(admin);
  admin.refreshToken = nextTokens.refreshToken;
  await admin.save({ validateBeforeSave: false });

  return {
    token: nextTokens.accessToken,
    accessToken: nextTokens.accessToken,
    refreshToken: nextTokens.refreshToken,
    admin: {
      id: admin._id,
      username: admin.username,
      role: normalizeAdminRole(admin.role),
      name: admin.name || '',
      email: admin.email || '',
    },
  };
};

const logout = async (adminId) => {
  if (!adminId) return;
  await Admin.findByIdAndUpdate(adminId, { refreshToken: '' });
};

// ======= MODULE EXPORTS =======
export { login, register, refresh, logout };
