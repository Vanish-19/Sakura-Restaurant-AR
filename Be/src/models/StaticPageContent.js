import mongoose from 'mongoose';

const staticPageContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['about', 'contact', 'privacy-policy', 'terms-of-service', 'career', 'press-kit', 'site-layout'],
    },
    label: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true, collection: 'static_page_contents' }
);

export default mongoose.model('StaticPageContent', staticPageContentSchema);
