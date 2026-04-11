import User from '../models/User.js';

export const createUser = async (data) => {
  const user = new User(data);
  return await user.save();
};

export const getAllUsers = async (filter = {}) => {
  return await User.find(filter).sort({ createdAt: -1 });
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUser = async (id, data) => {
  const updated = await User.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('User not found');
  return updated;
};

export const deleteUser = async (id) => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new Error('User not found');
  return deleted;
};

export const getUserStats = async () => {
  const total = await User.countDocuments();
  const active = await User.countDocuments({ status: 'Verified' });
  return { total, active };
};
