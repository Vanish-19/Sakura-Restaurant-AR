import mongoose from 'mongoose';

const tableReservationSchema = new mongoose.Schema(
  {
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    customer_name: { type: String, required: true, trim: true },
    customer_phone: { type: String, required: true, trim: true, index: true },
    customer_email: { type: String, trim: true },
    party_size: { type: Number, required: true, min: 1 },
    reservation_time: { type: Date, required: true, index: true },
    expected_duration_minutes: { type: Number, default: 120, min: 30 },
    source: { type: String, enum: ['contact', 'ai', 'admin'], default: 'contact', index: true },
    status: {
      type: String,
      enum: ['confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
      index: true,
    },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

tableReservationSchema.index({ table: 1, reservation_time: 1, status: 1 });
tableReservationSchema.index({ reservation_time: 1, status: 1 });

export default mongoose.model('TableReservation', tableReservationSchema);
