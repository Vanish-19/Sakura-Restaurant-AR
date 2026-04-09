import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { createTakeawaySchema, getTakeawayByPhoneSchema, getTakeawayByIdSchema } from '../validations/takeawayValidation.js';
import {
  createTakeawayOrder,
  getTakeawayOrdersByPhone,
  getTakeawayOrderById
} from '../controllers/takeawayController.js';

const router = express.Router();

// Public routes — khách hàng không cần đăng nhập
router.post('/orders', validateParams(createTakeawaySchema), createTakeawayOrder);
router.get('/orders', validateParams(getTakeawayByPhoneSchema), getTakeawayOrdersByPhone);
router.get('/orders/:id', validateParams(getTakeawayByIdSchema), getTakeawayOrderById);

export default router;
