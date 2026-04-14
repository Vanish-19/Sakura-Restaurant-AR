import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || process.env.jwt_secret;
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  process.env.jwt_refresh_secret ||
  process.env.JWT_SECRET ||
  process.env.jwt_secret;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function ensureJwtConfig() {
  if (!ACCESS_SECRET) {
    throw new Error('Missing JWT_SECRET in environment variables');
  }

  if (!REFRESH_SECRET) {
    throw new Error('Missing JWT_REFRESH_SECRET (or JWT_SECRET) in environment variables');
  }
}

function extractBearerTokenFromHeader(headerValue) {
  const header = String(headerValue || '');
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

function extractBearerToken(req, headerName = 'authorization') {
  return extractBearerTokenFromHeader(req?.headers?.[headerName]);
}

function signAccessToken(payload, options = {}) {
  ensureJwtConfig();
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
    ...options,
  });
}

function signRefreshToken(payload, options = {}) {
  ensureJwtConfig();
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
    ...options,
  });
}

function verifyAccessToken(token) {
  ensureJwtConfig();
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  ensureJwtConfig();
  return jwt.verify(token, REFRESH_SECRET);
}

export {
  ensureJwtConfig,
  extractBearerTokenFromHeader,
  extractBearerToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
