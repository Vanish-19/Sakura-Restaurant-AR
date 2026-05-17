import User from '../models/User.js';
import { createHttpError } from '../utils/AppError.js';

export const createUser = async (data) => {
  const user = new User(data);
  return user.save();
};

export const getAllUsers = async (filter = {}) => {
  const allowedFilter = {};
  if (filter.status) allowedFilter.status = filter.status;
  if (filter.role) allowedFilter.role = filter.role;
  return User.find(allowedFilter).sort({ createdAt: -1 });
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw createHttpError('User not found', 404, 'USER_NOT_FOUND');
  return user;
};

export const updateUser = async (id, data) => {
  const updated = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) throw createHttpError('User not found', 404, 'USER_NOT_FOUND');
  return updated;
};

export const deleteUser = async (id) => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw createHttpError('User not found', 404, 'USER_NOT_FOUND');
  return deleted;
};

export const getUserStats = async () => {
  const [total, active] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'Verified' }),
  ]);
  return { total, active };
};
