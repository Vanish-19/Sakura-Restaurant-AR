import mongoose from 'mongoose';

const applicationFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    signedUrl: { type: String },
    publicId: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    format: { type: String },
  },
  { _id: false }
);

const careerApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    birthDate: { type: Date },
    address: { type: String, trim: true },
    nationality: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    position: { type: String, required: true, trim: true },
    workType: { type: String, enum: ['full-time', 'part-time'], required: true },
    experience: { type: String, required: true, trim: true },
    expectedSalary: { type: String, trim: true },
    availableStartDate: { type: Date },
    referralSource: { type: String, required: true, trim: true },
    coverLetter: { type: String, trim: true, maxlength: 1000 },
    resume: { type: applicationFileSchema, required: true },
    introductionLetter: { type: applicationFileSchema },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'interviewing', 'accepted', 'rejected'],
      default: 'new',
    },
  },
  { timestamps: true }
);

careerApplicationSchema.index({ email: 1, position: 1, createdAt: -1 });

export default mongoose.model('CareerApplication', careerApplicationSchema);
