import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { createPaymentSchema, getPaymentByOrderSchema, refundPaymentSchema } from '../validations/paymentValidation.js';
import {
  createPayment,
  getAllPayments,
  getPaymentByOrder,
  refundPayment,
  confirmCodPayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(verifyAdmin);

router.post('/', validateParams(createPaymentSchema), createPayment);
router.get('/', getAllPayments);
router.get('/:orderId', validateParams(getPaymentByOrderSchema), getPaymentByOrder);
router.post('/:id/refund', validateParams(refundPaymentSchema), refundPayment);
router.post('/:id/confirm-cod', validateParams(refundPaymentSchema), confirmCodPayment);

export default router;
