import asyncHandler from 'express-async-handler';
import * as adminFoodCategoryService from '../services/adminFoodCategoryService.js';

export const getAll = asyncHandler(async (_req, res) => {
  const categories = await adminFoodCategoryService.getAllFoodCategories();
  res.status(200).json({ success: true, data: categories });
});

export const getById = asyncHandler(async (req, res) => {
  const category = await adminFoodCategoryService.getFoodCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

export const create = asyncHandler(async (req, res) => {
  const category = await adminFoodCategoryService.createFoodCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

export const update = asyncHandler(async (req, res) => {
  const category = await adminFoodCategoryService.updateFoodCategory(req.params.id, req.body);
  res.status(200).json({ success: true, data: category });
});

export const remove = asyncHandler(async (req, res) => {
  await adminFoodCategoryService.deleteFoodCategory(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
});