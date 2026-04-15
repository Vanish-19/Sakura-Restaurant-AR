import express from 'express';
import path from 'path';
import multer from 'multer';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createFoodSchema, updateFoodSchema } from '../validations/adminFoodValidation.js';
import * as adminFoodController from '../controllers/adminFoodController.js';

const router = express.Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 25 * 1024 * 1024,
	},
	fileFilter: (_req, file, cb) => {
		const extension = path.extname(file.originalname || '').toLowerCase();
		const isAllowed = extension === '.glb' || extension === '.usdz';

		if (!isAllowed) {
			const error = new Error('Chỉ hỗ trợ upload file .glb hoặc .usdz');
			error.status = 400;
			return cb(error);
		}

		return cb(null, true);
	},
});

router.use(verifyAdmin);

router.get('/', adminFoodController.getAll);
router.post('/upload-model', allowAdminRoles('admin', 'super_admin'), upload.single('model'), adminFoodController.uploadModel);
router.get('/:id', adminFoodController.getById);
router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createFoodSchema), adminFoodController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateFoodSchema), adminFoodController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), adminFoodController.remove);

export default router;
