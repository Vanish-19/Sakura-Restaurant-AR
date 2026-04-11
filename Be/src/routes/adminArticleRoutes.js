import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { createArticleSchema, updateArticleSchema } from '../validations/articleValidation.js';
import * as adminArticleController from '../controllers/adminArticleController.js';

const router = express.Router();

router.get('/stats', adminArticleController.getStats);
router.get('/', adminArticleController.getAll);
router.get('/:id', adminArticleController.getById);
router.post('/', validateParams(createArticleSchema), adminArticleController.create);
router.patch('/:id', validateParams(updateArticleSchema), adminArticleController.update);
router.delete('/:id', adminArticleController.remove);

export default router;
