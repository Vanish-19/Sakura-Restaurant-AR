import asyncHandler from 'express-async-handler';
import * as adminFoodService from '../services/adminFoodService.js';

export const getAll = asyncHandler(async (req, res) => {
  const items = await adminFoodService.getAllFoods(req.query);
  res.status(200).json({ success: true, count: items.length, data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await adminFoodService.getFoodById(req.params.id);
  res.status(200).json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const item = await adminFoodService.createFood(req.body);
  if (req.io) req.io.to('admin').emit('food_added', item);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await adminFoodService.updateFood(req.params.id, req.body);
  if (req.io) req.io.to('admin').emit('food_updated', item);
  res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  await adminFoodService.deleteFood(req.params.id);
  if (req.io) req.io.to('admin').emit('food_deleted', req.params.id);
  res.status(200).json({ success: true, message: 'Xóa thành công' });
});

export const uploadModel = asyncHandler(async (req, res) => {
  const result = await adminFoodService.uploadFoodModel({
    file: req.file,
    modelType: req.body?.modelType,
  });

  res.status(200).json({ success: true, data: result });
});
