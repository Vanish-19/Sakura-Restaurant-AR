import Order from '../models/Order.js';

export async function getUserOrderHistory(userId) {
  return Order.find({ user: userId })
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category')
    .sort({ createdAt: -1 });
}
