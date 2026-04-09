import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qr_hash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['empty', 'dining'], default: 'empty' },
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
