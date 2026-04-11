import asyncHandler from 'express-async-handler';
import * as adminDashboardService from '../services/adminDashboardService.js';

export const getStats = asyncHandler(async (req, res) => {
  const data = await adminDashboardService.getDashboardStats();
  res.status(200).json({ success: true, data });
});
