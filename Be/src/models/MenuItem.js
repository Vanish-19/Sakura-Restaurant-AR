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
  ingredients: [{ type: String, trim: true }],
  allergens: [{ type: String, trim: true }],
  recommended_for: [{ type: String, trim: true }],
  is_best_seller: { type: Boolean, default: false },
  is_available: { type: Boolean, default: true },
}, { timestamps: true });

menuItemSchema.index({ category: 1, is_available: 1, name: 1 });
menuItemSchema.index({ is_available: 1, is_best_seller: -1 });

export default mongoose.model('MenuItem', menuItemSchema);
