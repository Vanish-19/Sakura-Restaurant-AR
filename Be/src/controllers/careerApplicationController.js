import asyncHandler from 'express-async-handler';
import { createCareerApplication } from '../services/careerApplicationService.js';

export const submitCareerApplication = asyncHandler(async (req, res) => {
  const application = await createCareerApplication({
    body: req.body,
    files: req.files,
  });

  return res.status(201).json({
    success: true,
    message: 'Đã ứng tuyển thành công',
    data: {
      id: application._id,
      position: application.position,
      status: application.status,
      createdAt: application.createdAt,
    },
  });
});
