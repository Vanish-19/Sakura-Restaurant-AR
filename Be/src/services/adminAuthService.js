import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

const login = async (username, password) => {
  const admin = await Admin.findOne({ username });
  if (!admin) throw new Error('Invalid credentials');

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  const { _id: id, role } = admin;

  const token = jwt.sign(
    { id, username, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  return {
    token,
    admin: {
      id,
      username,
      role,
      name: admin.name || '',
      email: admin.email || '',
    },
  };
};

const register = async (username, password, name, email, role = 'staff') => {
  const existing = await Admin.findOne({ $or: [{ username }, { email }] });
  if (existing) throw new Error('Username or email already exists');

  const admin = new Admin({ username, password, name, email, role });
  const saved = await admin.save();
  
  const { _id: id } = saved;
  return { id, username, role, name, email };
};

// ======= MODULE EXPORTS =======
export { login, register };
