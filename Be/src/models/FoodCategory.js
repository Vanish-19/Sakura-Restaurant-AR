import mongoose from 'mongoose';

const foodCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
}, { timestamps: true });

foodCategorySchema.index({ name: 1 }, { unique: true });

export default mongoose.model('FoodCategory', foodCategorySchema);
