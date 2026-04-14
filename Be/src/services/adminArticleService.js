import Article from '../models/Article.js';

export const createArticle = async (data) => {
  const article = new Article(data);
  return await article.save();
};

export const getAllArticles = async (filter = {}) => {
  return await Article.find(filter).sort({ createdAt: -1 });
};

export const getArticleById = async (id) => {
  const article = await Article.findById(id);
  if (!article) throw new Error('Không tìm thấy bài viết');
  return article;
};

export const updateArticle = async (id, data) => {
  const updated = await Article.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('Không tìm thấy bài viết');
  return updated;
};

export const deleteArticle = async (id) => {
  const deleted = await Article.findByIdAndDelete(id);
  if (!deleted) throw new Error('Không tìm thấy bài viết');
  return deleted;
};

export const getArticleStats = async () => {
  const [published, drafts] = await Promise.all([
    Article.countDocuments({ is_published: true }),
    Article.countDocuments({ is_published: false })
  ]);
  return { published, drafts };
};
