import { extractBearerToken, verifyAccessToken } from '../services/tokenService.js';

/**
 * Middleware xác thực Admin qua JWT.
 * Expects: Authorization: Bearer <token>
 */
export const verifyAdmin = (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({ error: 'Thiếu token xác thực admin' });
    }

    const decoded = verifyAccessToken(token);
    const tokenType = String(decoded.type || '').toLowerCase();
    const tokenScope = String(decoded.scope || '').toLowerCase();
    const hasLegacyAdminType = tokenType === 'admin';
    const hasScopedAccessToken = tokenType === 'access' && tokenScope === 'admin';

    if (!hasLegacyAdminType && !hasScopedAccessToken) {
      return res.status(403).json({ error: 'Token admin không hợp lệ' });
    }

    const normalizedRole =
      decoded.role === 'superAdmin'
        ? 'super_admin'
        : decoded.role === 'staff'
          ? 'admin'
          : decoded.role

    if (!normalizedRole || !['admin', 'super_admin'].includes(normalizedRole)) {
      return res.status(403).json({ error: 'Không đủ quyền truy cập' });
    }

    req.admin = {
      id: decoded.sub || decoded.id,
      username: decoded.username || '',
      role: normalizedRole,
      email: decoded.email || '',
      name: decoded.name || '',
    };
    next();
  } catch {
    return res.status(403).json({ error: 'Token admin không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * Middleware chỉ cho phép role admin.
 * Phải dùng SAU verifyAdmin.
 */
export const adminOnly = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Yêu cầu quyền admin' });
  }
  next();
};

/**
 * Middleware chỉ cho phép role super admin.
 * Phải dùng SAU verifyAdmin.
 */
export const superAdminOnly = (req, res, next) => {
  if (req.admin?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Yêu cầu quyền super admin' });
  }
  next();
};

export const allowAdminRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Không đủ quyền theo vai trò' });
    }
    next();
  };
};
