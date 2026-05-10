import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';

/**
 * Fetch all available menu items with an optional category filter.
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { is_available: true };
  if (category) query.category = category;

  const items = await MenuItem.find(query).sort({ category: 1 });

  const formattedItems = items.map(item => ({
    id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    is_best_seller: Boolean(item.is_best_seller),
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
  }));

  res.status(200).json({
    message: 'Menu items fetched successfully',
    data: formattedItems
  });
});

export { getMenuItems };