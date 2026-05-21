import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const previewLoyaltySchema = z.object({
  body: z.object({
    phone: z.string().min(8, 'Số điện thoại phải có ít nhất 8 ký tự'),
    subtotal: z.number().min(0).default(0),
  }),
});

export const getLoyaltyProfilesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});

export const rewardVoucherBodySchema = z.object({
  code: z.string().min(2, 'Mã voucher là bắt buộc'),
  title: z.string().min(1, 'Tên voucher là bắt buộc'),
  description: z.string().optional().default(''),
  points_cost: z.number().int().min(1, 'Điểm đổi phải lớn hơn 0'),
  discount_type: z.enum(['fixed_amount', 'percentage']),
  discount_value: z.number().min(1, 'Giá trị giảm phải lớn hơn 0'),
  min_order_amount: z.number().min(0).default(0),
  max_discount_amount: z.number().min(0).default(0),
  quantity: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  expires_at: z.union([z.string().datetime(), z.null()]).optional(),
});

export const createRewardVoucherSchema = z.object({
  body: rewardVoucherBodySchema,
});

export const updateRewardVoucherSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'ID voucher không hợp lệ'),
  }),
  body: rewardVoucherBodySchema.partial().refine(
    (value) => Object.values(value).some((entry) => entry !== undefined),
    'Cần ít nhất một trường để cập nhật',
  ),
});

export const rewardVoucherIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'ID voucher không hợp lệ'),
  }),
});
