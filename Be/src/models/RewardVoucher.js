import mongoose from 'mongoose';

const rewardVoucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    points_cost: { type: Number, required: true, min: 1 },
    discount_type: { type: String, enum: ['fixed_amount', 'percentage'], default: 'fixed_amount' },
    discount_value: { type: Number, required: true, min: 1 },
    min_order_amount: { type: Number, default: 0, min: 0 },
    max_discount_amount: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    used_count: { type: Number, default: 0, min: 0 },
    is_active: { type: Boolean, default: true },
    expires_at: { type: Date },
  },
  { timestamps: true },
);

rewardVoucherSchema.index({ is_active: 1, expires_at: 1, points_cost: 1 });

export default mongoose.model('RewardVoucher', rewardVoucherSchema);
