import express from 'express';
import { verifyUser } from '../middlewares/verifyUser.js';
import { getMyOrderHistory } from '../controllers/userOrderController.js';

const router = express.Router();

router.use(verifyUser);
router.get('/history', getMyOrderHistory);

export default router;
