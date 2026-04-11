import express from 'express';
import * as adminAccountController from '../controllers/adminAccountController.js';

const router = express.Router();

router.get('/', adminAccountController.getAll);
router.get('/stats', adminAccountController.getStats);
router.patch('/:id/toggle-status', adminAccountController.toggleStatus);

export default router;
