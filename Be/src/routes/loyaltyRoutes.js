import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { verifyUser } from '../middlewares/verifyUser.js';
import { previewLoyaltySchema } from '../validations/loyaltyValidation.js';
import * as loyaltyController from '../controllers/loyaltyController.js';

const router = express.Router();

router.post('/preview', validateParams(previewLoyaltySchema), loyaltyController.preview);
router.get('/me', verifyUser, loyaltyController.me);

export default router;
