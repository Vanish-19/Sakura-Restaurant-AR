import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menu_item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price_at_order: { type: Number, required: true }, // Chốt giá tại thời điểm đặt
  note: { type: String }
});

const orderSchema = new mongoose.Schema({
  order_type: { type: String, enum: ['dine_in', 'takeaway'], default: 'dine_in' },

  // Dine-in fields
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },

  // Takeaway/Delivery fields
  customer_name: { type: String },
  customer_phone: { type: String },
  delivery_address: { type: String },

  items: [orderItemSchema],
  total_amount: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'cooking', 'served', 'ready', 'picked_up', 'paid', 'cancelled'],
    default: 'pending'
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
