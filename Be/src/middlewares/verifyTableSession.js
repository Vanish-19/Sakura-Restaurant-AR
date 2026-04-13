import { extractBearerToken, verifyAccessToken } from '../services/tokenService.js';

/**
 * Express middleware to verify the table session via JWT token.
 * Expects the token in the Authorization header as "Bearer <token>".
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {void}
 */
export const verifyTableSession = (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({ error: 'Thiếu token xác thực phiên bàn' });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.type && decoded.type !== 'table') {
      return res.status(403).json({ error: 'Token phiên bàn không hợp lệ' });
    }

    // Attach the decoded payload (table info) to the request object
    req.table = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Session verification failed:', error.message);
    return res.status(403).json({ error: 'Token phiên bàn không hợp lệ hoặc đã hết hạn' });
  }
};