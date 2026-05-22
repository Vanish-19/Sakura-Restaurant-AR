import asyncHandler from 'express-async-handler';
import {
  buildGoogleOAuthFailureRedirectUrl,
  buildGoogleOAuthUrl,
  issuePhoneToken,
  loginWithGoogleOAuthCallback,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from '../services/userAuthService.js';

const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
const GOOGLE_OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function getGoogleOAuthStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/v1/auth/google',
    maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_MS,
  };
}

function getCookieValue(cookieHeader, name) {
  const cookies = String(cookieHeader || '').split(';');
  for (const cookie of cookies) {
    const [rawKey, ...rawValueParts] = cookie.trim().split('=');
    if (rawKey === name) return rawValueParts.join('=');
  }
  return '';
}

function clearGoogleOAuthStateCookie(res) {
  const options = getGoogleOAuthStateCookieOptions();
  delete options.maxAge;
  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, options);
}

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

const startGoogleOAuth = asyncHandler(async (req, res) => {
  const { authorizationUrl, state } = buildGoogleOAuthUrl(req.query?.redirect);
  res.cookie(GOOGLE_OAUTH_STATE_COOKIE, state, getGoogleOAuthStateCookieOptions());
  res.redirect(302, authorizationUrl);
});

const googleOAuthCallback = async (req, res) => {
  try {
    const stateFromCookie = getCookieValue(req.headers.cookie, GOOGLE_OAUTH_STATE_COOKIE);
    if (!stateFromCookie || stateFromCookie !== req.query?.state) {
      throw new Error('Invalid Google OAuth state cookie');
    }

    const result = await loginWithGoogleOAuthCallback(req.query || {});
    clearGoogleOAuthStateCookie(res);
    return res.redirect(302, result.redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error?.message || error);
    clearGoogleOAuthStateCookie(res);
    return res.redirect(302, buildGoogleOAuthFailureRedirectUrl(req.query?.state));
  }
};

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

export {
  register,
  login,
  loginWithPhone,
  startGoogleOAuth,
  googleOAuthCallback,
  refresh,
  me,
  logout,
};
