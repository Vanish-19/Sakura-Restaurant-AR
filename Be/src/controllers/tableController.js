import asyncHandler from 'express-async-handler';
import Table from '../models/Table.js';
import { signAccessToken } from '../services/tokenService.js';

/**
 * Handles scanning a QR code for a table to start a dining session.
 */
const scanTable = asyncHandler(async (req, res) => {
  const { qr_hash } = req.body;

  if (!qr_hash) {
    return res.status(400).json({ error: 'Thiếu mã qr_hash' });
  }

  const normalizedQrHash = String(qr_hash).trim();

  const table =
    (await Table.findOne({ qr_hash: normalizedQrHash })) ||
    (await Table.findOne({ qr_hash: normalizedQrHash.toLowerCase() })) ||
    (await Table.findOne({ qr_hash: normalizedQrHash.toUpperCase() }));

  if (!table) {
    return res.status(404).json({ error: 'Không tìm thấy bàn' });
  }

  // Update table status to dining
  table.status = 'dining';
  await table.save();

  // Generate JWT session token
  const token = signAccessToken(
    { table_id: table._id, name: table.name, type: 'table' },
    { expiresIn: '24h' }
  );

  res.status(200).json({
    message: 'Đã bắt đầu phiên bàn',
    token,
    table
  });
});

export { scanTable };