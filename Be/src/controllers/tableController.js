import asyncHandler from 'express-async-handler';
import Table from '../models/Table.js';
import { signAccessToken } from '../services/tokenService.js';
import { createTableSession } from '../services/tableSessionService.js';
import { getReservationBlockingTableUse } from '../services/tableReservationService.js';

const scanTable = asyncHandler(async (req, res) => {
  const { qr_hash } = req.body;

  if (!qr_hash) {
    return res.status(400).json({ success: false, error: 'qr_hash is required' });
  }

  const normalizedQrHash = String(qr_hash).trim();

  const table =
    (await Table.findOne({ qr_hash: normalizedQrHash })) ||
    (await Table.findOne({ qr_hash: normalizedQrHash.toLowerCase() })) ||
    (await Table.findOne({ qr_hash: normalizedQrHash.toUpperCase() }));

  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }

  const blockingReservation = await getReservationBlockingTableUse(table._id);
  if (blockingReservation) {
    return res.status(409).json({
      success: false,
      code: 'TABLE_RESERVED_SOON',
      error: 'This table is reserved and cannot be used during the reservation hold window',
      reservation_time: blockingReservation.reservation_time,
    });
  }

  table.status = 'dining';
  await table.save();

  const session = await createTableSession(table, normalizedQrHash);
  const token = signAccessToken(
    {
      table_id: table._id,
      session_id: session._id,
      name: table.name,
      type: 'table',
    },
    { expiresIn: process.env.TABLE_SESSION_JWT_EXPIRES_IN || '24h' },
  );

  res.status(200).json({
    success: true,
    message: 'Table session started',
    token,
    session: {
      id: session._id,
      expires_at: session.expires_at,
    },
    table,
  });
});

export { scanTable };
