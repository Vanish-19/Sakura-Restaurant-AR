import { extractBearerToken, verifyAccessToken } from '../services/tokenService.js';
import { assertActiveTableSession } from '../services/tableSessionService.js';

export const verifyTableSession = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({ success: false, error: 'Table session token is required' });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'table') {
      return res.status(403).json({ success: false, error: 'Invalid table session token' });
    }

    if (!decoded.table_id) {
      return res.status(403).json({ success: false, error: 'Invalid table session payload' });
    }

    const session = await assertActiveTableSession({
      sessionId: decoded.session_id,
      tableId: decoded.table_id,
    });

    req.table = decoded;
    req.tableSession = session;
    next();
  } catch (error) {
    const status = Number(error?.status || error?.statusCode || 403);
    return res.status(status).json({
      success: false,
      code: error?.code || 'INVALID_TABLE_SESSION',
      error: error?.message || 'Invalid or expired table session',
      message: error?.message || 'Invalid or expired table session',
    });
  }
};
