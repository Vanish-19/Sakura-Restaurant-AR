import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createFoodCategorySchema, updateFoodCategorySchema, deleteFoodCategorySchema } from '../validations/adminFoodCategoryValidation.js';
import * as adminFoodCategoryController from '../controllers/adminFoodCategoryController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/', adminFoodCategoryController.getAll);
router.get('/:id', adminFoodCategoryController.getById);
router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createFoodCategorySchema), adminFoodCategoryController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateFoodCategorySchema), adminFoodCategoryController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(deleteFoodCategorySchema), adminFoodCategoryController.remove);

export default router;