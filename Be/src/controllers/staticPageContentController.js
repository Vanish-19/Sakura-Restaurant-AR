import asyncHandler from 'express-async-handler';
import {
  getStaticPageBySlug,
  getStaticPages,
  updateStaticPage,
} from '../services/staticPageContentService.js';

export const getPublicStaticPage = asyncHandler(async (req, res) => {
  const page = await getStaticPageBySlug(req.params.slug);
  res.json({ success: true, data: page });
});

export const getAdminStaticPages = asyncHandler(async (_req, res) => {
  const pages = await getStaticPages();
  res.json({ success: true, data: pages });
});

export const updateAdminStaticPage = asyncHandler(async (req, res) => {
  const page = await updateStaticPage(req.params.slug, {
    label: req.body?.label,
    content: req.body?.content,
    adminId: req.admin?.id,
  });

  res.json({
    success: true,
    message: 'Đã cập nhật nội dung trang static',
    data: page,
  });
});
