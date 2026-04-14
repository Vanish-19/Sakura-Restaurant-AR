import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createFoodSchema, updateFoodSchema } from '../validations/adminFoodValidation.js';
import * as adminFoodController from '../controllers/adminFoodController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/', adminFoodController.getAll);
router.get('/:id', adminFoodController.getById);
router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createFoodSchema), adminFoodController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateFoodSchema), adminFoodController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), adminFoodController.remove);

export default router;
