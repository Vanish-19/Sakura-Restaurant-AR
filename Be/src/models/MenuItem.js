import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image_url: { type: String },
  ar_models: {
    glb_url: { type: String },
    usdz_url: { type: String }
  },
  is_best_seller: { type: Boolean, default: false },
  is_available: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
