import express from 'express';
import * as adminDashboardController from '../controllers/adminDashboardController.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/stats', adminDashboardController.getStats);

export default router;
