import express from 'express';
import { login, logout, refresh, register } from '../controllers/adminAuthController.js';
import { verifyAdmin, superAdminOnly } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// POST /api/v1/admin/auth/login — Public
router.post('/login', login);

// POST /api/v1/admin/auth/register — Chỉ super admin mới tạo được account mới
// Lần đầu tiên có thể tạo admin đầu tiên trực tiếp trong database hoặc qua script riêng có kiểm soát.
router.post('/register', verifyAdmin, superAdminOnly, register);
router.post('/refresh', refresh);
router.post('/logout', verifyAdmin, logout);

export default router;
