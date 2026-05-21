import mongoose from 'mongoose';

const loyaltyProfileSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    display_name: { type: String, trim: true, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    total_points_earned: { type: Number, default: 0, min: 0 },
    available_points: { type: Number, default: 0, min: 0 },
    total_points_redeemed: { type: Number, default: 0, min: 0 },
    total_orders_paid: { type: Number, default: 0, min: 0 },
    lifetime_spend: { type: Number, default: 0, min: 0 },
    last_rewarded_at: { type: Date },
  },
  { timestamps: true },
);

loyaltyProfileSchema.index({ available_points: -1, updatedAt: -1 });
loyaltyProfileSchema.index({ display_name: 1, phone: 1 });

export default mongoose.model('LoyaltyProfile', loyaltyProfileSchema);
