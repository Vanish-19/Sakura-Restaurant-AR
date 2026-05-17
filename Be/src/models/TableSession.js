import mongoose from 'mongoose';

const tableSessionSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
      index: true,
    },
    started_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true, index: true },
    revoked_at: { type: Date },
    last_seen_at: { type: Date },
    qr_hash: { type: String },
  },
  { timestamps: true },
);

tableSessionSchema.index({ table: 1, status: 1, expires_at: 1 });

export default mongoose.model('TableSession', tableSessionSchema);
