import User from '../models/User.js';
import { extractBearerToken, verifyAccessToken } from '../services/tokenService.js';

async function normalizeUserPayload(decoded) {
  if (!decoded || decoded.type !== 'user') return null;

  const id = decoded.sub || decoded.id;
  if (!id) return null;

  const userDoc = await User.findById(id).select('role email phone name status').lean();
  if (!userDoc || userDoc.status === 'Inactive') return null;

  return {
    id: String(userDoc._id),
    role: userDoc.role || decoded.role || 'Guest',
    email: userDoc.email || decoded.email || '',
    phone: userDoc.phone || decoded.phone || '',
    name: userDoc.name || decoded.name || '',
    status: userDoc.status || '',
  };
}

export const verifyUser = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'User access token is required' });
    }

    const decoded = verifyAccessToken(token);
    const user = await normalizeUserPayload(decoded);
    if (!user) {
      return res.status(403).json({ success: false, error: 'Invalid or inactive user token' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ success: false, error: 'Invalid or expired user token' });
  }
};

export const verifyUserAccess = verifyUser;

export const attachOptionalUser = (headerName = 'x-user-authorization') => {
  return async (req, res, next) => {
    try {
      const token = extractBearerToken(req, headerName);
      if (!token) return next();

      const decoded = verifyAccessToken(token);
      const user = await normalizeUserPayload(decoded);
      if (!user) {
        return res.status(403).json({ success: false, error: 'Invalid or inactive user token' });
      }
      req.user = user;
    } catch {
      return res.status(403).json({ success: false, error: 'Invalid user token' });
    }

    next();
  };
};
