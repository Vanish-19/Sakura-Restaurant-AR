import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { chatSchema } from '../validations/chatValidation.js';

const router = express.Router();

router.post('/', validateParams(chatSchema), chatController.handleChat);

export default router;
