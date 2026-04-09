import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Table from '../models/Table.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

/**
 * Handles scanning a QR code for a table to start a dining session.
 */
const scanTable = asyncHandler(async (req, res) => {
  const { qr_hash } = req.body;

  if (!qr_hash) {
    return res.status(400).json({ error: 'qr_hash is required' });
  }

  const table = await Table.findOne({ qr_hash });
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }

  // Update table status to dining
  table.status = 'dining';
  await table.save();

  // Generate JWT session token
  const token = jwt.sign(
    { table_id: table._id, name: table.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    message: 'Table session started',
    token,
    table
  });
});

export { scanTable };