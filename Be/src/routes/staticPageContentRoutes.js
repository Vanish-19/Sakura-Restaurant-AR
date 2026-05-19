import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import {
  getAdminStaticPages,
  getPublicStaticPage,
  updateAdminStaticPage,
} from '../controllers/staticPageContentController.js';

const router = express.Router();

router.get('/public/:slug', getPublicStaticPage);
router.get('/admin', verifyAdmin, getAdminStaticPages);
router.patch('/admin/:slug', verifyAdmin, updateAdminStaticPage);

export default router;
