import express from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createArticleSchema, updateArticleSchema } from '../validations/articleValidation.js';
import * as adminArticleController from '../controllers/adminArticleController.js';
import { uploadImageBufferToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

router.use(verifyAdmin);

router.get('/stats', adminArticleController.getStats);
router.get('/', adminArticleController.getAll);
router.get('/:id', adminArticleController.getById);
router.post('/upload-image', allowAdminRoles('admin', 'super_admin'), upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Vui lòng chọn file ảnh để tải lên');
  }
  const result = await uploadImageBufferToCloudinary({
    buffer: req.file.buffer,
    originalFilename: req.file.originalname,
    folder: 'articles'
  });
  res.status(200).json({
    success: true,
    url: result.secure_url || result.url
  });
}));

router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createArticleSchema), adminArticleController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateArticleSchema), adminArticleController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), adminArticleController.remove);

export default router;
