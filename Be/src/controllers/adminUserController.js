import asyncHandler from 'express-async-handler';
import * as adminUserService from '../services/adminUserService.js';

export const getAll = asyncHandler(async (req, res) => {
  const items = await adminUserService.getAllUsers(req.query);
  res.status(200).json({ success: true, count: items.length, data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await adminUserService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const item = await adminUserService.createUser(req.body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await adminUserService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  await adminUserService.deleteUser(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminUserService.getUserStats();
  res.status(200).json({ success: true, data: stats });
});
