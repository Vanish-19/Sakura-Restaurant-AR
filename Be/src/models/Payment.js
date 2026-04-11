import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['online', 'cod'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  paid_at: { type: Date },
  provider: { type: String, enum: ['vnpay'] },
  provider_ref: { type: String },
  checkout_url: { type: String },
  order_code: { type: Number },
  currency: { type: String, default: 'vnd' },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
