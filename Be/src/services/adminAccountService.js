import Admin from '../models/Admin.js';

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

export const toggleAdminStatus = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) throw new Error('Không tìm thấy admin');
  admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
  return await admin.save();
};
