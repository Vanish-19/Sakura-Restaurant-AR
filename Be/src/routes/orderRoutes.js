import express from 'express';
import { createOrder, getActiveOrders, getMyTableOrders, updateOrderStatus } from '../controllers/orderController.js';
import { verifyTableSession } from '../middlewares/verifyTableSession.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { attachOptionalUser } from '../middlewares/verifyUser.js';
import { createOrderSchema, updateOrderSchema } from '../validations/orderValidation.js';

const router = express.Router();
router.post('/', verifyTableSession, attachOptionalUser(), validateParams(createOrderSchema), createOrder);
router.get('/my', verifyTableSession, getMyTableOrders);
router.get('/', verifyAdmin, getActiveOrders);
router.patch('/:id/status', verifyAdmin, validateParams(updateOrderSchema), updateOrderStatus);

export default router;
