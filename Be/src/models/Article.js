import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'News' },
  author: { type: String, default: 'Admin' },
  image_url: { type: String },
  views: { type: Number, default: 0 },
  is_published: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Article', articleSchema);
