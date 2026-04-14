import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './tokenService.js';

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function toIdentityQuery(identity) {
  const text = String(identity || '').trim();
  if (!text) return null;

  if (text.includes('@')) return { email: text.toLowerCase() };
  return { phone: text };
}

function mapUserPayload(user) {
  return {
    sub: String(user._id),
    id: String(user._id),
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'Guest',
    type: 'user',
  };
}

function issueUserTokens(user) {
  const payload = mapUserPayload(user);
  const accessToken = signAccessToken(payload, { expiresIn: '2h' });
  const refreshToken = signRefreshToken(payload, { expiresIn: '14d' });
  return { accessToken, refreshToken };
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'Guest',
    status: user.status || 'Pending',
    last_login: user.last_login,
  };
}

const registerUser = async ({ name, email, phone, password }) => {
  if (!password) throw createHttpError('Vui lòng nhập mật khẩu', 400);

  const normalizedName = String(name || '').trim();
  if (!normalizedName) {
    throw createHttpError('Vui lòng nhập họ và tên', 400);
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPhone = String(phone || '').trim();

  if (!normalizedEmail && !normalizedPhone) {
    throw createHttpError('Vui lòng nhập email hoặc số điện thoại', 400);
  }

  if (normalizedEmail) {
    const sameEmail = await User.findOne({ email: normalizedEmail }).lean();
    if (sameEmail) {
      throw createHttpError('Email đã tồn tại', 409);
    }
  }

  if (normalizedPhone) {
    const samePhone = await User.findOne({ phone: normalizedPhone }).lean();
    if (samePhone) {
      throw createHttpError('Số điện thoại đã tồn tại', 409);
    }
  }

  const user = new User({
    name: normalizedName,
    email: normalizedEmail || undefined,
    phone: normalizedPhone || undefined,
    password,
    status: 'Verified',
    role: 'Guest',
    last_login: new Date(),
  });

  const { accessToken, refreshToken } = issueUserTokens(user);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
};

const loginUser = async ({ identity, password }) => {
  const query = toIdentityQuery(identity);
  if (!query) throw createHttpError('Vui lòng nhập thông tin đăng nhập', 400);

  const user = await User.findOne(query).select('+password +refreshToken');
  if (!user) throw createHttpError('Sai tài khoản hoặc mật khẩu', 401);

  const matched = await user.comparePassword(password);
  if (!matched) throw createHttpError('Sai tài khoản hoặc mật khẩu', 401);

  user.last_login = new Date();
  user.status = user.status || 'Verified';

  const { accessToken, refreshToken } = issueUserTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
};

const issuePhoneToken = async ({ phone, name = 'Guest User' }) => {
  const normalizedPhone = String(phone || '').trim();
  if (!normalizedPhone) throw createHttpError('Vui lòng nhập số điện thoại', 400);

  let user = await User.findOne({ phone: normalizedPhone }).select('+refreshToken');
  if (!user) {
    user = new User({
      name,
      phone: normalizedPhone,
      role: 'Guest',
      status: 'Verified',
      last_login: new Date(),
    });
  } else {
    user.last_login = new Date();
    if (name && name !== 'Guest User') user.name = name;
  }

  const { accessToken, refreshToken } = issueUserTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
};

const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) throw createHttpError('Thiếu refresh token', 400);

  const decoded = verifyRefreshToken(refreshToken);
  if (decoded.type !== 'user') throw createHttpError('Loại refresh token không hợp lệ', 403);

  const userId = decoded.sub || decoded.id;
  const user = await User.findById(userId).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw createHttpError('Refresh token không hợp lệ', 403);
  }

  const nextTokens = issueUserTokens(user);
  user.refreshToken = nextTokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    token: nextTokens.accessToken,
    accessToken: nextTokens.accessToken,
    refreshToken: nextTokens.refreshToken,
    user: toPublicUser(user),
  };
};

const logoutUser = async (userId) => {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { refreshToken: '' });
};

export {
  registerUser,
  loginUser,
  issuePhoneToken,
  refreshUserToken,
  logoutUser,
};
