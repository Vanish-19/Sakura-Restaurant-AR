import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { createFoodSchema, updateFoodSchema } from '../validations/adminFoodValidation.js';
import * as adminFoodController from '../controllers/adminFoodController.js';

const router = express.Router();

router.get('/', adminFoodController.getAll);
router.get('/:id', adminFoodController.getById);
router.post('/', validateParams(createFoodSchema), adminFoodController.create);
router.patch('/:id', validateParams(updateFoodSchema), adminFoodController.update);
router.delete('/:id', adminFoodController.remove);

export default router;
