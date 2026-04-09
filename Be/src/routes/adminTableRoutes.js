import express from 'express';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { createTableSchema, updateTableSchema, tableIdSchema } from '../validations/adminTableValidation.js';
import {
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
  resetTable
} from '../controllers/adminTableController.js';

const router = express.Router();

router.use(verifyAdmin);

router.get('/', getAllTables);
router.post('/', validateParams(createTableSchema), createTable);
router.patch('/:id', validateParams(updateTableSchema), updateTable);
router.delete('/:id', validateParams(tableIdSchema), deleteTable);
router.post('/:id/reset', validateParams(tableIdSchema), resetTable);

export default router;
