import asyncHandler from 'express-async-handler';
import * as adminArticleService from '../services/adminArticleService.js';

export const getAll = asyncHandler(async (req, res) => {
  const items = await adminArticleService.getAllArticles(req.query);
  res.status(200).json({ success: true, count: items.length, data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await adminArticleService.getArticleById(req.params.id);
  res.status(200).json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const item = await adminArticleService.createArticle(req.body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await adminArticleService.updateArticle(req.params.id, req.body);
  res.status(200).json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  await adminArticleService.deleteArticle(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminArticleService.getArticleStats();
  res.status(200).json({ success: true, data: stats });
});
