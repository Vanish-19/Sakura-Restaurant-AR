import express from 'express';
import { verifyUser } from '../middlewares/verifyUser.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { cancelMyOrder, getMyOrderHistory } from '../controllers/userOrderController.js';
import { cancelUserOrderSchema } from '../validations/userOrderValidation.js';

const router = express.Router();

router.use(verifyUser);
router.get('/history', getMyOrderHistory);
router.patch('/:id/cancel', validateParams(cancelUserOrderSchema), cancelMyOrder);

export default router;
