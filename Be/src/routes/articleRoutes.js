import express from 'express';
import * as articleController from '../controllers/articleController.js';

const router = express.Router();

router.get('/', articleController.getAllPublished);
router.get('/:id', articleController.getById);

export default router;
