import express from 'express';
import * as adminAccountController from '../controllers/adminAccountController.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/', adminAccountController.getAll);
router.get('/stats', adminAccountController.getStats);
router.get('/:id', adminAccountController.getOne);
router.patch('/:id/toggle-status', allowAdminRoles('super_admin'), adminAccountController.toggleStatus);
router.patch('/:id/password', allowAdminRoles('super_admin'), adminAccountController.resetPassword);

export default router;
