import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'LoyaltyProfile', required: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'RewardVoucher' },
    type: {
      type: String,
      enum: ['earn', 'earn_reversal', 'redeem', 'redeem_refund'],
      required: true,
      index: true,
    },
    points: { type: Number, required: true, min: 0 },
    amount: { type: Number, default: 0, min: 0 },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

loyaltyTransactionSchema.index({ createdAt: -1, type: 1 });

export default mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
