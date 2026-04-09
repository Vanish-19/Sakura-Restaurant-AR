import express from 'express';
import { createOrder, getActiveOrders, updateOrderStatus } from '../controllers/orderController.js';
import { verifyTableSession } from '../middlewares/verifyTableSession.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { createOrderSchema, updateOrderSchema } from '../validations/orderValidation.js';

const router = express.Router();
router.post('/', verifyTableSession, validateParams(createOrderSchema), createOrder);
router.get('/', getActiveOrders);
router.patch('/:id/status', validateParams(updateOrderSchema), updateOrderStatus);

export default router;
