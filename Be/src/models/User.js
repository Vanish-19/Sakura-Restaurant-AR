import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'Guest' }, // Guest, Pro Member, Platinum Member
  status: { type: String, default: 'Pending' }, // Pending, Verified, Inactive
  last_login: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
