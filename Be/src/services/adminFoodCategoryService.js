import FoodCategory from '../models/FoodCategory.js';
import MenuItem from '../models/MenuItem.js';

function createBadRequestError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeCategoryName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

function canonicalCategoryName(name) {
  return normalizeCategoryName(name).toLowerCase();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findCategoryByName(name) {
  const normalizedName = normalizeCategoryName(name);
  if (!normalizedName) return null;

  return await FoodCategory.findOne({
    name: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i'),
  });
}

async function syncCategoriesFromMenuItems() {
  const menuCategories = await MenuItem.distinct('category', {
    category: { $type: 'string', $ne: '' },
  });

  const normalizedMenuCategories = [...new Set(menuCategories.map(normalizeCategoryName).filter(Boolean))];
  if (!normalizedMenuCategories.length) {
    return await FoodCategory.find().sort({ name: 1 });
  }

  const existingCategories = await FoodCategory.find({}, { name: 1 }).lean();
  const existingKeys = new Set(existingCategories.map((category) => canonicalCategoryName(category.name)));
  const missingCategories = normalizedMenuCategories.filter((name) => !existingKeys.has(canonicalCategoryName(name)));

  if (missingCategories.length) {
    await FoodCategory.insertMany(
      missingCategories.map((name) => ({ name })),
      { ordered: false },
    );
  }

  return await FoodCategory.find().sort({ name: 1 });
}

export const getAllFoodCategories = async () => {
  return await syncCategoriesFromMenuItems();
};

export const getFoodCategoryById = async (id) => {
  const category = await FoodCategory.findById(id);
  if (!category) throw createBadRequestError('Không tìm thấy danh mục', 404);
  return category;
};

export const createFoodCategory = async (data) => {
  const name = normalizeCategoryName(data.name);
  if (!name) {
    throw createBadRequestError('Tên danh mục không hợp lệ');
  }

  const existingCategory = await findCategoryByName(name);
  if (existingCategory) {
    throw createBadRequestError('Danh mục này đã tồn tại', 409);
  }

  const category = new FoodCategory({ name });
  return await category.save();
};

export const updateFoodCategory = async (id, data) => {
  const category = await FoodCategory.findById(id);
  if (!category) {
    throw createBadRequestError('Không tìm thấy danh mục', 404);
  }

  const nextName = normalizeCategoryName(data.name);
  if (!nextName) {
    throw createBadRequestError('Tên danh mục không hợp lệ');
  }

  const duplicateCategory = await FoodCategory.findOne({
    _id: { $ne: id },
    name: new RegExp(`^${escapeRegex(nextName)}$`, 'i'),
  });

  if (duplicateCategory) {
    throw createBadRequestError('Danh mục này đã tồn tại', 409);
  }

  const previousName = category.name;
  category.name = nextName;
  const updatedCategory = await category.save();

  if (previousName !== nextName) {
    await MenuItem.updateMany(
      { category: previousName },
      { $set: { category: nextName } },
    );
  }

  return updatedCategory;
};

export const deleteFoodCategory = async (id, { replacementName } = {}) => {
  const category = await FoodCategory.findById(id);
  if (!category) {
    throw createBadRequestError('Không tìm thấy danh mục', 404);
  }

  const normalizedReplacementName = normalizeCategoryName(replacementName);
  const foodsUsingCategory = await MenuItem.countDocuments({ category: category.name });

  if (foodsUsingCategory > 0) {
    if (!normalizedReplacementName) {
      throw createBadRequestError('Danh mục đang được dùng bởi món ăn. Hãy chọn danh mục thay thế.', 409);
    }

    if (canonicalCategoryName(normalizedReplacementName) === canonicalCategoryName(category.name)) {
      throw createBadRequestError('Danh mục thay thế phải khác danh mục đang xóa');
    }

    const replacementCategory = await findCategoryByName(normalizedReplacementName);
    if (!replacementCategory) {
      throw createBadRequestError('Danh mục thay thế không tồn tại', 404);
    }

    await MenuItem.updateMany(
      { category: category.name },
      { $set: { category: replacementCategory.name } },
    );
  }

  await category.deleteOne();
  return category;
};