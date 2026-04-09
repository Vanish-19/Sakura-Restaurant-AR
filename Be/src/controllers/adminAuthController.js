import asyncHandler from 'express-async-handler';
import { 
  login as serviceLogin, 
  register as serviceRegister 
} from '../services/adminAuthService.js';

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await serviceLogin(username, password);
  res.status(200).json({ message: 'Login successful', data: result });
});

const register = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;
  const admin = await serviceRegister(username, password, role);
  res.status(201).json({ message: 'Admin created', data: admin });
});

export { login, register };
