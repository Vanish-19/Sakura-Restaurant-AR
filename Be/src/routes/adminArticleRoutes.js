import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createArticleSchema, updateArticleSchema } from '../validations/articleValidation.js';
import * as adminArticleController from '../controllers/adminArticleController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/stats', adminArticleController.getStats);
router.get('/', adminArticleController.getAll);
router.get('/:id', adminArticleController.getById);
router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createArticleSchema), adminArticleController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateArticleSchema), adminArticleController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), adminArticleController.remove);

export default router;
