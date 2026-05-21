import express from 'express';
import path from 'path';
import multer from 'multer';
import { validateParams } from '../middlewares/validateRequest.js';
import { allowAdminRoles, verifyAdmin } from '../middlewares/verifyAdmin.js';
import { createFoodSchema, updateFoodSchema } from '../validations/adminFoodValidation.js';
import * as adminFoodController from '../controllers/adminFoodController.js';

const router = express.Router();

const MODEL_UPLOAD_MAX_SIZE_MB = 10;
const MODEL_UPLOAD_MAX_SIZE_BYTES = MODEL_UPLOAD_MAX_SIZE_MB * 1024 * 1024;

const knownModelMimeTypes = new Set([
  'model/gltf-binary',
  'model/vnd.usdz+zip',
  'application/octet-stream',
  'application/zip',
  'application/x-zip-compressed',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MODEL_UPLOAD_MAX_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const hasAllowedExtension = extension === '.glb' || extension === '.usdz';
    const hasAllowedMime = !file.mimetype || knownModelMimeTypes.has(file.mimetype);

    if (!hasAllowedExtension || !hasAllowedMime) {
      const error = new Error('Only .glb or .usdz model uploads are supported');
      error.status = 400;
      return cb(error);
    }

    return cb(null, true);
  },
});

const uploadModelFile = (req, res, next) => {
  upload.single('model')(req, res, (error) => {
    if (!error) return next();

    if (error.code === 'LIMIT_FILE_SIZE') {
      error.status = 413;
      error.statusCode = 413;
      error.message = `Kích thước file model tối đa là ${MODEL_UPLOAD_MAX_SIZE_MB}MB`;
    }

    return next(error);
  });
};

router.use(verifyAdmin);

router.get('/', adminFoodController.getAll);
router.post('/upload-model', allowAdminRoles('admin', 'super_admin'), uploadModelFile, adminFoodController.uploadModel);
router.get('/:id', adminFoodController.getById);
router.post('/', allowAdminRoles('admin', 'super_admin'), validateParams(createFoodSchema), adminFoodController.create);
router.patch('/:id', allowAdminRoles('admin', 'super_admin'), validateParams(updateFoodSchema), adminFoodController.update);
router.delete('/:id', allowAdminRoles('admin', 'super_admin'), adminFoodController.remove);

export default router;
