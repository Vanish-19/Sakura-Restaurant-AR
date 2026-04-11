import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { createUserSchema, updateUserSchema } from '../validations/userValidation.js';
import * as adminUserController from '../controllers/adminUserController.js';

const router = express.Router();

router.get('/stats', adminUserController.getStats);
router.get('/', adminUserController.getAll);
router.get('/:id', adminUserController.getById);
router.post('/', validateParams(createUserSchema), adminUserController.create);
router.patch('/:id', validateParams(updateUserSchema), adminUserController.update);
router.delete('/:id', adminUserController.remove);

export default router;
