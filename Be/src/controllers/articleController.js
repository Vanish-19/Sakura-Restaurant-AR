import asyncHandler from 'express-async-handler';
import Article from '../models/Article.js';

export const getAllPublished = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = { is_published: true };
  
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const items = await Article.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: items.length, data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await Article.findOne({ _id: req.params.id, is_published: true });
  if (!item) {
    res.status(404);
    throw new Error('Bài viết không tồn tại hoặc chưa được xuất bản');
  }

  // Increment view count
  item.views = (item.views || 0) + 1;
  await item.save();

  res.status(200).json({ success: true, data: item });
});
