import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

function normalizeRole(role) {
  if (role === 'superAdmin') return 'super_admin';
  if (role === 'super_admin') return 'super_admin';
  return 'admin';
}

export const getAllAdmins = async () => {
  const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
  return admins.map((item) => ({
    ...item.toObject(),
    role: normalizeRole(item.role),
  }));
};

export const getAdminStats = async () => {
  const [total, active] = await Promise.all([
    Admin.countDocuments({}),
    Admin.countDocuments({ status: 'Active' })
  ]);
  return { total, active, alerts: 0 }; // alerts as placeholders for now
};

export const getAdminById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID tài khoản không hợp lệ');
  }

  const admin = await Admin.findById(id).select('-password');
  if (!admin) throw new Error('Không tìm thấy admin');

  return {
    ...admin.toObject(),
    role: normalizeRole(admin.role),
  };
};

export const toggleAdminStatus = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID tài khoản không hợp lệ');
  }

  const admin = await Admin.findById(id);
  if (!admin) throw new Error('Không tìm thấy admin');
  admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
  return await admin.save();
};

export const resetAdminPassword = async (id, password) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('ID tài khoản không hợp lệ');
  }

  const nextPassword = String(password || '').trim();
  if (!nextPassword || nextPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  const admin = await Admin.findById(id).select('+password');
  if (!admin) throw new Error('Không tìm thấy admin');

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
