import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';
import { createHttpError } from '../utils/AppError.js';

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatMenuItem(item) {
  return {
    id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image_url: item.image_url,
    is_best_seller: Boolean(item.is_best_seller),
    ingredients: item.ingredients || [],
    allergens: item.allergens || [],
    recommended_for: item.recommended_for || [],
    ar_models: {
      glb_url: item.ar_models?.glb_url,
      usdz_url: item.ar_models?.usdz_url,
    },
    assets: {
      image_url: item.image_url,
      ar_models: item.ar_models
        ? {
            glb: item.ar_models?.glb_url,
            usdz: item.ar_models?.usdz_url,
          }
        : null
    }
  };
}

/**
 * Fetch all available menu items with an optional category filter.
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { is_available: true };
  if (category) query.category = new RegExp(`^${escapeRegex(category)}$`, 'i');

  const items = await MenuItem.find(query).sort({ category: 1 });

  res.status(200).json({
    message: 'Menu items fetched successfully',
    data: items.map(formatMenuItem)
  });
});

const getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findOne({ _id: req.params.id, is_available: true });

  if (!item) {
    throw createHttpError('Không tìm thấy món ăn', 404, 'MENU_ITEM_NOT_FOUND');
  }

  res.status(200).json({
    message: 'Menu item fetched successfully',
    data: formatMenuItem(item),
  });
});

export { getMenuItems, getMenuItemById };
