import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menu_item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price_at_order: { type: Number, required: true },
  note: { type: String },
  status: {
    type: String,
    enum: ['pending', 'cooking', 'ready', 'served', 'cancelled'],
    default: 'pending',
  },
});

const orderSchema = new mongoose.Schema(
  {
    order_type: { type: String, enum: ['dine_in', 'takeaway'], default: 'dine_in', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    table_session: { type: mongoose.Schema.Types.ObjectId, ref: 'TableSession' },

    customer_name: { type: String },
    customer_phone: { type: String },
    delivery_address: { type: String },

    items: [orderItemSchema],
    total_amount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'cooking', 'served', 'ready', 'picked_up', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ order_type: 1, status: 1, createdAt: -1 });
orderSchema.index({ table: 1, createdAt: -1 });
orderSchema.index({ table_session: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
