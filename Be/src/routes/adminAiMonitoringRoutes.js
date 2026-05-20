import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import * as adminAiMonitoringController from '../controllers/adminAiMonitoringController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/overview', adminAiMonitoringController.getOverview);

export default router;
