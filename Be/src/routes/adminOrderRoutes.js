import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { validateParams } from '../middlewares/validateRequest.js';
import {
  getOrdersSchema,
  getOrderByIdSchema,
  updateAdminOrderStatusSchema,
  updateOrderItemStatusSchema,
  cancelOrderSchema,
  hardDeleteOrderSchema,
} from '../validations/adminOrderValidation.js';
import {
  getOrderStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  cancelOrder,
  hardDeleteOrder,
} from '../controllers/adminOrderController.js';

const router = express.Router();

// Tất cả routes đều yêu cầu admin auth
router.use(verifyAdmin);

router.get('/stats', getOrderStats);
router.get('/', validateParams(getOrdersSchema), getAllOrders);
router.get('/:id', validateParams(getOrderByIdSchema), getOrderById);
router.patch('/:id', validateParams(updateAdminOrderStatusSchema), updateOrderStatus);
router.patch('/:id/items/:itemId/status', validateParams(updateOrderItemStatusSchema), updateOrderItemStatus);
router.patch('/:id/cancel', validateParams(cancelOrderSchema), cancelOrder);
router.delete('/:id', validateParams(hardDeleteOrderSchema), hardDeleteOrder);

export default router;
