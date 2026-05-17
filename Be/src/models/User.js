import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  refreshToken: { type: String, default: '', select: false },
  role: { type: String, default: 'Guest' }, // Guest, Pro Member, Platinum Member
  status: { type: String, default: 'Pending' }, // Pending, Verified, Inactive
  last_login: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model('User', userSchema);
