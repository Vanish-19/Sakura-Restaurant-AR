import express from 'express';
import * as adminDashboardController from '../controllers/adminDashboardController.js';

const router = express.Router();

router.get('/stats', adminDashboardController.getStats);

export default router;
