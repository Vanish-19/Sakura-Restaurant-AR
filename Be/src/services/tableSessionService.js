import TableSession from '../models/TableSession.js';
import { createHttpError } from '../utils/AppError.js';

const TABLE_SESSION_TTL_HOURS = Number(process.env.TABLE_SESSION_TTL_HOURS || 24);

function getSessionExpiresAt() {
  const hours = Number.isFinite(TABLE_SESSION_TTL_HOURS) && TABLE_SESSION_TTL_HOURS > 0
    ? TABLE_SESSION_TTL_HOURS
    : 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function createTableSession(table, qrHash) {
  return TableSession.create({
    table: table._id,
    status: 'active',
    expires_at: getSessionExpiresAt(),
    qr_hash: qrHash,
  });
}

export async function assertActiveTableSession({ sessionId, tableId }) {
  if (!sessionId) {
    throw createHttpError('Table session is missing. Please scan the table QR again.', 401, 'TABLE_SESSION_MISSING');
  }

  const session = await TableSession.findOne({
    _id: sessionId,
    table: tableId,
  });

  if (!session) {
    throw createHttpError('Table session was not found. Please scan the table QR again.', 401, 'TABLE_SESSION_NOT_FOUND');
  }

  if (session.status !== 'active') {
    throw createHttpError('Table session is no longer active. Please scan the table QR again.', 401, 'TABLE_SESSION_INACTIVE');
  }

  if (session.expires_at && session.expires_at.getTime() <= Date.now()) {
    session.status = 'expired';
    await session.save();
    throw createHttpError('Table session expired. Please scan the table QR again.', 401, 'TABLE_SESSION_EXPIRED');
  }

  session.last_seen_at = new Date();
  await session.save({ validateBeforeSave: false });
  return session;
}

export async function revokeActiveTableSessions(tableId) {
  return TableSession.updateMany(
    { table: tableId, status: 'active' },
    {
      $set: {
        status: 'revoked',
        revoked_at: new Date(),
      },
    },
  );
}
