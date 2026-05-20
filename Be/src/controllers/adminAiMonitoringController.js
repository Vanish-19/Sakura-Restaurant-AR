import asyncHandler from 'express-async-handler';
import { getAiMonitoringOverview } from '../services/aiMonitoringService.js';

export const getOverview = asyncHandler(async (req, res) => {
  const days = Number(req.query.days || 30);
  const data = await getAiMonitoringOverview({ days });
  res.status(200).json({ success: true, data });
});
