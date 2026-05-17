import { z } from 'zod';

const optionalTrimmedString = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? undefined : String(value).trim()),
  z.string().optional()
);

const optionalDateString = z.preprocess(
  (value) => (value === '' || value === undefined || value === null ? undefined : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ').optional()
);

export const createCareerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ và tên'),
  email: z.string().trim().email('Email không hợp lệ'),
  phone: z.string().trim().min(8, 'Số điện thoại không hợp lệ'),
  birthDate: optionalDateString,
  address: optionalTrimmedString,
  nationality: optionalTrimmedString,
  linkedIn: optionalTrimmedString,
  position: z.string().trim().min(1, 'Vui lòng chọn vị trí ứng tuyển'),
  workType: z.enum(['full-time', 'part-time'], {
    error: 'Vui lòng chọn loại hình công việc',
  }),
  experience: z.string().trim().min(1, 'Vui lòng chọn kinh nghiệm làm việc'),
  expectedSalary: optionalTrimmedString,
  availableStartDate: optionalDateString,
  referralSource: z.string().trim().min(1, 'Vui lòng chọn nguồn biết tin tuyển dụng'),
  coverLetter: z.string().trim().max(1000, 'Thư ngỏ tối đa 1000 ký tự').optional().or(z.literal('')),
});
