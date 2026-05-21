import express from 'express';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import {
  createRewardVoucherSchema,
  getLoyaltyProfilesSchema,
  rewardVoucherIdParamSchema,
  updateRewardVoucherSchema,
} from '../validations/loyaltyValidation.js';
import * as adminLoyaltyController from '../controllers/adminLoyaltyController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/overview', adminLoyaltyController.getOverview);
router.get('/profiles', validateParams(getLoyaltyProfilesSchema), adminLoyaltyController.getProfiles);
router.get('/vouchers', adminLoyaltyController.getVouchers);
router.post('/vouchers', allowAdminRoles('admin', 'super_admin'), validateParams(createRewardVoucherSchema), adminLoyaltyController.createVoucher);
router.patch('/vouchers/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateRewardVoucherSchema), adminLoyaltyController.updateVoucher);
router.delete('/vouchers/:id', allowAdminRoles('admin', 'super_admin'), validateParams(rewardVoucherIdParamSchema), adminLoyaltyController.deleteVoucher);

export default router;
