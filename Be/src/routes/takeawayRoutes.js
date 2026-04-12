import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { createTakeawaySchema, getTakeawayByPhoneSchema, getTakeawayByIdSchema } from '../validations/takeawayValidation.js';
import {
  createTakeawayOrder,
  getTakeawayOrdersByPhone,
  getTakeawayOrderById,
  cancelTakeawayOrder
} from '../controllers/takeawayController.js';

const router = express.Router();

// Public routes — khách hàng không cần đăng nhập
router.post('/orders', validateParams(createTakeawaySchema), createTakeawayOrder);
router.get('/orders', validateParams(getTakeawayByPhoneSchema), getTakeawayOrdersByPhone);
router.get('/orders/:id', validateParams(getTakeawayByIdSchema), getTakeawayOrderById);
router.patch('/orders/:id/cancel', validateParams(getTakeawayByIdSchema), cancelTakeawayOrder);

export default router;
