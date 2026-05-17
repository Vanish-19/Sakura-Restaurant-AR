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
