import express from 'express';
import * as adminAccountController from '../controllers/adminAccountController.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/', adminAccountController.getAll);
router.get('/stats', adminAccountController.getStats);
router.patch('/:id/toggle-status', allowAdminRoles('super_admin'), adminAccountController.toggleStatus);

export default router;
