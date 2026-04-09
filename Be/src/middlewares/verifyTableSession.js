import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded payload (table info) to the request object
    req.table = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Session verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired session token' });
  }
};