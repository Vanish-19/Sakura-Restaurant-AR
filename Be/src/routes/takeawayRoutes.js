import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { verifyUser } from '../middlewares/verifyUser.js';
import { createTakeawaySchema, getTakeawayByPhoneSchema, getTakeawayByIdSchema } from '../validations/takeawayValidation.js';
import {
  createTakeawayOrder,
  getTakeawayOrdersByPhone,
  getTakeawayOrderById,
  cancelTakeawayOrder
} from '../controllers/takeawayController.js';

const router = express.Router();

// Delivery checkout requires user login
router.post('/orders', verifyUser, validateParams(createTakeawaySchema), createTakeawayOrder);
router.get('/orders', verifyUser, validateParams(getTakeawayByPhoneSchema), getTakeawayOrdersByPhone);
router.get('/orders/:id', verifyUser, validateParams(getTakeawayByIdSchema), getTakeawayOrderById);
router.patch('/orders/:id/cancel', verifyUser, validateParams(getTakeawayByIdSchema), cancelTakeawayOrder);

export default router;
