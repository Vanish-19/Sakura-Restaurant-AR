import asyncHandler from 'express-async-handler';
import Table from '../models/Table.js';
import { signAccessToken } from '../services/tokenService.js';
import { createTableSession } from '../services/tableSessionService.js';
import { getReservationBlockingTableUse } from '../services/tableReservationService.js';

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addCaseVariants(set, value) {
  const text = String(value || '').trim();
  if (!text) return;
  set.add(text);
  set.add(text.toLowerCase());
  set.add(text.toUpperCase());
}

function buildQrHashCandidates(value) {
  const normalized = String(value || '').trim();
  const candidates = new Set();
  addCaseVariants(candidates, normalized);

  const digits = normalized.replace(/\D/g, '');
  if (digits) {
    const numericDigits = digits.replace(/^0+/, '') || '0';
    const variants = new Set([
      digits,
      digits.padStart(2, '0'),
      digits.padStart(3, '0'),
      numericDigits,
    ]);

    for (const variant of variants) {
      addCaseVariants(candidates, variant);
      addCaseVariants(candidates, `t-${variant}`);
      addCaseVariants(candidates, `table-${variant}`);
      addCaseVariants(candidates, `table-${variant}-qr`);
      addCaseVariants(candidates, `table-${variant}-sakura`);
    }
  }

  return Array.from(candidates);
}

async function findTableByQrHash(qrHash) {
  const candidates = buildQrHashCandidates(qrHash);
  const table = await Table.findOne({ qr_hash: { $in: candidates } });
  if (table) return table;

  const digits = String(qrHash || '').replace(/\D/g, '');
  if (!digits) return null;

  const numericDigits = digits.replace(/^0+/, '') || '0';
  const namePattern = new RegExp(`^(?:t|table|ban)?\\s*0*${escapeRegExp(numericDigits)}$`, 'i');
  return Table.findOne({ name: namePattern });
}

const scanTable = asyncHandler(async (req, res) => {
  const { qr_hash } = req.body;

  if (!qr_hash) {
    return res.status(400).json({ success: false, error: 'qr_hash is required' });
  }

  const normalizedQrHash = String(qr_hash).trim();
  const table = await findTableByQrHash(normalizedQrHash);

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

  const session = await createTableSession(table, table.qr_hash || normalizedQrHash);
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
