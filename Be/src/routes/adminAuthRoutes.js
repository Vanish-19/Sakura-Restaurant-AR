import express from 'express';
import { login, register } from '../controllers/adminAuthController.js';
import { verifyAdmin, adminOnly } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// POST /api/v1/admin/auth/login — Public
router.post('/login', login);

// POST /api/v1/admin/auth/register — Chỉ admin hiện tại mới tạo được account mới
// Lần đầu tiên có thể tạm bỏ middleware để seed admin đầu tiên
router.post('/register', verifyAdmin, adminOnly, register);

export default router;
