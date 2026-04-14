import express from 'express';
import {
  login,
  loginWithPhone,
  logout,
  me,
  refresh,
  register,
} from '../controllers/userAuthController.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { verifyUser } from '../middlewares/verifyUser.js';
import {
  loginUserSchema,
  phoneTokenSchema,
  refreshTokenSchema,
  registerUserSchema,
} from '../validations/userAuthValidation.js';

const router = express.Router();

router.post('/register', validateParams(registerUserSchema), register);
router.post('/login', validateParams(loginUserSchema), login);
router.post('/phone-token', validateParams(phoneTokenSchema), loginWithPhone);
router.post('/refresh', validateParams(refreshTokenSchema), refresh);
router.get('/me', verifyUser, me);
router.post('/logout', verifyUser, logout);

export default router;
