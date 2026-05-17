import express from 'express';
import multer from 'multer';
import { submitCareerApplication } from '../controllers/careerApplicationController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);

    if (!allowed.has(file.mimetype)) {
      const error = new Error('Only PDF, DOC, or DOCX files are supported');
      error.status = 400;
      return cb(error);
    }

    return cb(null, true);
  },
});

router.post(
  '/applications',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'introductionLetter', maxCount: 1 },
  ]),
  submitCareerApplication
);

export default router;
