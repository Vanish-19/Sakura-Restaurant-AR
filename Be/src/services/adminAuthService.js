import Admin from '../models/Admin.js';
import { createHttpError } from '../utils/AppError.js';
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

const login = async (identity, password) => {
  const normalizedIdentity = String(identity || '').trim();
  const admin = await Admin.findOne({
    $or: [
      { username: normalizedIdentity },
      { email: normalizedIdentity.toLowerCase() },
    ],
  });
  if (!admin) {
    throw createHttpError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  if (admin.status !== 'Active') {
    throw createHttpError('Admin account is inactive', 403, 'ADMIN_INACTIVE');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw createHttpError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
  }

  const { _id: id, role, username } = admin;
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
  if (existing) {
    throw createHttpError('Username or email already exists', 409, 'ADMIN_DUPLICATE');
  }

  const admin = new Admin({ username, password, name, email, role: normalizeAdminRole(role) });
  const saved = await admin.save();

  const { _id: id } = saved;
  return { id, username, role: normalizeAdminRole(saved.role), name, email };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError('Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (decoded.type !== 'admin') {
    throw createHttpError('Invalid refresh token type', 403, 'INVALID_REFRESH_TOKEN');
  }

  const adminId = decoded.sub || decoded.id;
  const admin = await Admin.findById(adminId);
  if (!admin || admin.refreshToken !== refreshToken) {
    throw createHttpError('Invalid refresh token', 403, 'INVALID_REFRESH_TOKEN');
  }

  if (admin.status !== 'Active') {
    throw createHttpError('Admin account is inactive', 403, 'ADMIN_INACTIVE');
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

export { login, register, refresh, logout };
