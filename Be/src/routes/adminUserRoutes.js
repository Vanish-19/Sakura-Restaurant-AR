import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createUserSchema, updateUserSchema } from '../validations/userValidation.js';
import * as adminUserController from '../controllers/adminUserController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/stats', adminUserController.getStats);
router.get('/', adminUserController.getAll);
router.get('/:id', adminUserController.getById);
router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createUserSchema), adminUserController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateUserSchema), adminUserController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), adminUserController.remove);

export default router;
