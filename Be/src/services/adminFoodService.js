import MenuItem from '../models/MenuItem.js';

export const createFood = async (data) => {
  const food = new MenuItem(data);
  return await food.save();
};

export const getAllFoods = async (filter = {}) => {
  return await MenuItem.find(filter).sort({ category: 1, name: 1 });
};

export const getFoodById = async (id) => {
  const food = await MenuItem.findById(id);
  if (!food) throw new Error('Không tìm thấy món ăn');
  return food;
};

export const updateFood = async (id, data) => {
  const updated = await MenuItem.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('Không tìm thấy món ăn');
  return updated;
};

export const deleteFood = async (id) => {
  const deleted = await MenuItem.findByIdAndDelete(id);
  if (!deleted) throw new Error('Không tìm thấy món ăn');
  return deleted;
};
