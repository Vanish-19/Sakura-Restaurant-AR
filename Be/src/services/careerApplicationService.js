import CareerApplication from '../models/CareerApplication.js';
import { uploadRawBufferToCloudinary } from './cloudinaryService.js';
import { createCareerApplicationSchema } from '../validations/careerApplicationValidation.js';

const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function createBadRequestError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeDate(value) {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

function assertApplicationFile(file, label, required = false) {
  if (!file) {
    if (required) throw createBadRequestError(`${label} là bắt buộc`);
    return;
  }

  if (!ALLOWED_FILE_MIME_TYPES.has(file.mimetype)) {
    throw createBadRequestError(`${label} chỉ hỗ trợ PDF, DOC hoặc DOCX`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw createBadRequestError(`${label} tối đa 5MB`);
  }
}

async function uploadApplicationFile(file, fieldName) {
  if (!file) return undefined;

  const uploadResult = await uploadRawBufferToCloudinary({
    buffer: file.buffer,
    originalFilename: file.originalname,
    folder: `sakura-careers/${fieldName}`,
  });

  return {
    originalName: file.originalname,
    url: uploadResult.delivery_url || uploadResult.secure_url,
    signedUrl: uploadResult.signed_url,
    publicId: uploadResult.public_id,
    mimeType: file.mimetype,
    size: file.size,
    format: uploadResult.format,
  };
}

export async function createCareerApplication({ body, files }) {
  const parsed = createCareerApplicationSchema.safeParse(body || {});

  if (!parsed.success) {
    const message = parsed.error.issues?.[0]?.message || 'Dữ liệu ứng tuyển không hợp lệ';
    throw createBadRequestError(message);
  }

  const resumeFile = files?.resume?.[0];
  const introductionFile = files?.introductionLetter?.[0];

  assertApplicationFile(resumeFile, 'CV / Resume', true);
  assertApplicationFile(introductionFile, 'Thư giới thiệu');

  const [resume, introductionLetter] = await Promise.all([
    uploadApplicationFile(resumeFile, 'resume'),
    uploadApplicationFile(introductionFile, 'introduction-letter'),
  ]);

  const payload = parsed.data;

  return CareerApplication.create({
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    birthDate: normalizeDate(payload.birthDate),
    address: payload.address,
    nationality: payload.nationality,
    linkedIn: payload.linkedIn,
    position: payload.position,
    workType: payload.workType,
    experience: payload.experience,
    expectedSalary: payload.expectedSalary,
    availableStartDate: normalizeDate(payload.availableStartDate),
    referralSource: payload.referralSource,
    coverLetter: payload.coverLetter || undefined,
    resume,
    introductionLetter,
  });
}
