import Admin from '../models/Admin.js';

export const getAllAdmins = async () => {
  return await Admin.find({}).select('-password').sort({ createdAt: -1 });
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
  if (!admin) throw new Error('Admin not found');
  admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
  return await admin.save();
};
