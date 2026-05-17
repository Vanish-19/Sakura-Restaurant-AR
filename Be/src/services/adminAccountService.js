import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import { createHttpError } from '../utils/AppError.js';

function normalizeRole(role) {
  if (role === 'superAdmin') return 'super_admin';
  if (role === 'super_admin') return 'super_admin';
  return 'admin';
}

function assertValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError('Invalid admin account id', 400, 'INVALID_ADMIN_ID');
  }
}

export const getAllAdmins = async () => {
  const admins = await Admin.find({}).select('-password -refreshToken').sort({ createdAt: -1 });
  return admins.map((item) => ({
    ...item.toObject(),
    role: normalizeRole(item.role),
  }));
};

export const getAdminStats = async () => {
  const [total, active] = await Promise.all([
    Admin.countDocuments({}),
    Admin.countDocuments({ status: 'Active' }),
  ]);
  return { total, active, alerts: 0 };
};

export const getAdminById = async (id) => {
  assertValidObjectId(id);

  const admin = await Admin.findById(id).select('-password -refreshToken');
  if (!admin) throw createHttpError('Admin account not found', 404, 'ADMIN_NOT_FOUND');

  return {
    ...admin.toObject(),
    role: normalizeRole(admin.role),
  };
};

export const toggleAdminStatus = async (id) => {
  assertValidObjectId(id);

  const admin = await Admin.findById(id);
  if (!admin) throw createHttpError('Admin account not found', 404, 'ADMIN_NOT_FOUND');

  admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
  if (admin.status === 'Inactive') admin.refreshToken = '';
  return admin.save();
};

export const resetAdminPassword = async (id, password) => {
  assertValidObjectId(id);

  const nextPassword = String(password || '').trim();
  if (!nextPassword || nextPassword.length < 6) {
    throw createHttpError('New password must be at least 6 characters', 400, 'PASSWORD_TOO_SHORT');
  }

  const admin = await Admin.findById(id).select('+password');
  if (!admin) throw createHttpError('Admin account not found', 404, 'ADMIN_NOT_FOUND');

  admin.password = nextPassword;
  admin.refreshToken = '';
  await admin.save();

  return {
    _id: admin._id,
    username: admin.username,
    role: normalizeRole(admin.role),
    name: admin.name,
    email: admin.email,
    status: admin.status,
    updatedAt: admin.updatedAt,
  };
};
