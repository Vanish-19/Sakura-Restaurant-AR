import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Table 01'
  qr_hash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['empty', 'dining', 'reserved'], default: 'empty' },
  zone: { type: String, default: 'Main Hall' },
  capacity: { type: Number, default: 4 },
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
