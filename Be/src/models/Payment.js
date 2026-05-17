import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['online', 'cod'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  paid_at: { type: Date },
  provider: { type: String, enum: ['sepay'] },
  provider_ref: { type: String },
  checkout_url: { type: String },
  order_code: { type: Number },
  currency: { type: String, default: 'vnd' },
}, { timestamps: true });

paymentSchema.index({ order: 1, method: 1 }, { unique: true });
paymentSchema.index(
  { provider: 1, provider_ref: 1 },
  {
    unique: true,
    partialFilterExpression: {
      provider: { $exists: true },
      provider_ref: { $exists: true, $type: 'string' },
    },
  },
);
paymentSchema.index({ order_code: 1 }, { unique: true, sparse: true });
paymentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
