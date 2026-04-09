import express from 'express';
import { scanTable } from '../controllers/tableController.js';

const router = express.Router();

// POST /api/v1/tables/scan
// Public route to scan QR code and start a session
router.post('/scan', scanTable);

export default router;
