import express from 'express';
import { getMenuItems } from '../controllers/menuController.js';

const router = express.Router();

// GET /api/v1/menu/items
// Public route (or can be protected by verifyTableSession if you only want seated customers to see the menu)
router.get('/items', getMenuItems);

export default router;
