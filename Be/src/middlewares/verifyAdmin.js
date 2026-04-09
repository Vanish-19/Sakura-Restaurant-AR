import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

/**
 * Middleware xác thực Admin qua JWT.
 * Expects: Authorization: Bearer <token>
 */
export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.role || !['admin', 'staff'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired admin token' });
  }
};

/**
 * Middleware chỉ cho phép role admin (không cho staff).
 * Phải dùng SAU verifyAdmin.
 */
export const adminOnly = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  next();
};
