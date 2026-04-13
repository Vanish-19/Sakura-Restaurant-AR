import { extractBearerToken, verifyAccessToken } from '../services/tokenService.js';

function normalizeUserPayload(decoded) {
  if (!decoded || decoded.type !== 'user') return null;

  const id = decoded.sub || decoded.id;
  if (!id) return null;

  return {
    id,
    role: decoded.role || 'Guest',
    email: decoded.email || '',
    phone: decoded.phone || '',
    name: decoded.name || '',
  };
}

export const verifyUser = (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Thiếu access token người dùng' });
    }

    const decoded = verifyAccessToken(token);
    const user = normalizeUserPayload(decoded);
    if (!user) {
      return res.status(403).json({ error: 'Token người dùng không hợp lệ' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Token người dùng không hợp lệ hoặc đã hết hạn' });
  }
};

export const verifyUserAccess = verifyUser;

export const attachOptionalUser = (headerName = 'x-user-authorization') => {
  return (req, res, next) => {
    try {
      const token = extractBearerToken(req, headerName);
      if (!token) return next();

      const decoded = verifyAccessToken(token);
      const user = normalizeUserPayload(decoded);
      if (!user) return res.status(403).json({ error: 'Token người dùng không hợp lệ' });
      req.user = user;
    } catch {
      return res.status(403).json({ error: 'Token người dùng không hợp lệ' });
    }

    next();
  };
};
