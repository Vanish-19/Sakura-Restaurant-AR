import User from '../models/User.js';
import crypto from 'crypto';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './tokenService.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeBaseUrl(value, fallback) {
  return String(value || fallback || '').trim().replace(/\/$/, '');
}

function getFrontendBaseUrl() {
  return normalizeBaseUrl(process.env.FRONTEND_URL, 'http://localhost:5173');
}

function getBackendPublicUrl() {
  const configured =
    process.env.BACKEND_PUBLIC_URL ||
    process.env.API_PUBLIC_URL ||
    process.env.SERVER_PUBLIC_URL;
  const fallback = `http://127.0.0.1:${process.env.PORT || 3000}`;
  return normalizeBaseUrl(configured, fallback);
}

function buildDefaultGoogleRedirectUrl() {
  const base = getBackendPublicUrl();
  if (base.endsWith('/api/v1')) return `${base}/auth/google/callback`;
  return `${base}/api/v1/auth/google/callback`;
}

function getGoogleOAuthConfig() {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const redirectUri = String(
    process.env.GOOGLE_OAUTH_REDIRECT_URL ||
    process.env.GOOGLE_REDIRECT_URI ||
    buildDefaultGoogleRedirectUrl(),
  ).trim();

  if (!clientId || !clientSecret) {
    throw createHttpError('Missing Google OAuth client configuration', 500);
  }

  return { clientId, clientSecret, redirectUri };
}

function getOAuthStateSecret() {
  const secret =
    process.env.GOOGLE_OAUTH_STATE_SECRET ||
    process.env.JWT_SECRET ||
    process.env.jwt_secret;
  if (!secret) throw createHttpError('Missing OAuth state secret', 500);
  return secret;
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signOAuthStatePayload(encodedPayload) {
  return crypto
    .createHmac('sha256', getOAuthStateSecret())
    .update(encodedPayload)
    .digest('base64url');
}

function sanitizeClientRedirect(value) {
  const text = String(value || '/').trim();
  if (!text || !text.startsWith('/') || text.startsWith('//') || text.includes('\\')) {
    return '/';
  }

  try {
    const parsed = new URL(text, 'http://client.local');
    if (parsed.origin !== 'http://client.local') return '/';
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  } catch {
    return '/';
  }
}

function createOAuthState(redirect) {
  const payload = {
    redirect: sanitizeClientRedirect(redirect),
    createdAt: Date.now(),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signOAuthStatePayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifyOAuthState(state) {
  const [encodedPayload, signature] = String(state || '').split('.');
  if (!encodedPayload || !signature) {
    throw createHttpError('Invalid OAuth state', 400);
  }

  const expectedSignature = signOAuthStatePayload(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw createHttpError('Invalid OAuth state signature', 400);
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw createHttpError('Invalid OAuth state payload', 400);
  }

  if (!payload?.createdAt || Date.now() - Number(payload.createdAt) > GOOGLE_OAUTH_STATE_TTL_MS) {
    throw createHttpError('Expired OAuth state', 400);
  }

  return {
    redirect: sanitizeClientRedirect(payload.redirect),
  };
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
    avatar: user.avatar || '',
    role: user.role || 'Guest',
    status: user.status || 'Pending',
    last_login: user.last_login,
  };
}

function buildGoogleOAuthUrl(redirect = '/') {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const state = createOAuthState(redirect);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  return {
    authorizationUrl: `${GOOGLE_AUTH_URL}?${params.toString()}`,
    state,
  };
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function exchangeGoogleCode(code) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const payload = await parseJsonResponse(response);

  if (!response.ok || !payload?.access_token) {
    throw createHttpError(payload?.error_description || 'Google token exchange failed', 401);
  }

  return payload;
}

async function fetchGoogleProfile(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await parseJsonResponse(response);

  if (!response.ok || !payload?.sub) {
    throw createHttpError(payload?.error_description || 'Google profile lookup failed', 401);
  }

  return payload;
}

function getNameFromGoogleProfile(profile) {
  const name = String(profile?.name || '').trim();
  if (name) return name;

  const emailName = String(profile?.email || '').split('@')[0]?.trim();
  return emailName || 'Google User';
}

async function findOrCreateGoogleUser(profile) {
  const googleId = String(profile.sub || '').trim();
  const email = String(profile.email || '').trim().toLowerCase();
  const emailVerified = profile.email_verified === true || profile.email_verified === 'true';

  if (!googleId || !email || !emailVerified) {
    throw createHttpError('Google account email is not verified', 401);
  }

  let user = await User.findOne({ googleId }).select('+refreshToken');
  if (!user) {
    user = await User.findOne({ email }).select('+refreshToken');
  }

  if (user?.status === 'Inactive') {
    throw createHttpError('User account is inactive', 403);
  }

  if (!user) {
    user = new User({
      googleId,
      email,
      name: getNameFromGoogleProfile(profile),
      avatar: profile.picture || '',
      role: 'Guest',
      status: 'Verified',
      last_login: new Date(),
    });
  } else {
    user.googleId = user.googleId || googleId;
    user.email = user.email || email;
    user.name = user.name || getNameFromGoogleProfile(profile);
    user.avatar = profile.picture || user.avatar || '';
    user.status = 'Verified';
    user.last_login = new Date();
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
}

function buildOAuthCallbackRedirectUrl({ result, redirect }) {
  const callbackUrl = new URL('/auth/oauth-callback', getFrontendBaseUrl());
  callbackUrl.hash = new URLSearchParams({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: JSON.stringify(result.user),
    redirect: sanitizeClientRedirect(redirect),
  }).toString();
  return callbackUrl.toString();
}

function buildGoogleOAuthFailureRedirectUrl(state) {
  let redirect = '/';
  try {
    redirect = verifyOAuthState(state).redirect;
  } catch {
    redirect = '/';
  }

  const loginUrl = new URL('/auth/login', getFrontendBaseUrl());
  loginUrl.searchParams.set('oauth', 'error');
  if (redirect && redirect !== '/') {
    loginUrl.searchParams.set('redirect', redirect);
  }
  return loginUrl.toString();
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

const loginWithGoogleOAuthCallback = async ({ code, state }) => {
  if (!code) throw createHttpError('Missing Google authorization code', 400);

  const { redirect } = verifyOAuthState(state);
  const tokenPayload = await exchangeGoogleCode(code);
  const googleProfile = await fetchGoogleProfile(tokenPayload.access_token);
  const result = await findOrCreateGoogleUser(googleProfile);

  return {
    ...result,
    redirectUrl: buildOAuthCallbackRedirectUrl({ result, redirect }),
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
  buildGoogleOAuthFailureRedirectUrl,
  buildGoogleOAuthUrl,
  loginWithGoogleOAuthCallback,
  refreshUserToken,
  logoutUser,
};
