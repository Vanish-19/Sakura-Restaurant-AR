import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

const createTakeawayOrder = async ({ customer_name, customer_phone, delivery_address, items }) => {
  let total_amount = 0;
  const processedItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menu_item_id);
    if (!menuItem || !menuItem.is_available) {
      throw new Error(`Menu item ${item.menu_item_id} is unavailable or does not exist`);
    }

    total_amount += menuItem.price * item.quantity;
    processedItems.push({
      menu_item: menuItem._id,
      quantity: item.quantity,
      price_at_order: menuItem.price,
      note: item.note,
    });
  }

  const order = new Order({
    order_type: 'takeaway',
    customer_name,
    customer_phone,
    delivery_address,
    items: processedItems,
    total_amount,
  });

  const saved = await order.save();
  return await Order.findById(saved._id)
    .populate('items.menu_item', 'name image_url category');
};

const getTakeawayOrdersByPhone = async (phone) => {
  return await Order.find({ order_type: 'takeaway', customer_phone: phone })
    .populate('items.menu_item', 'name image_url price')
    .sort({ createdAt: -1 });
};

const getTakeawayOrderById = async (id) => {
  const order = await Order.findOne({ _id: id, order_type: 'takeaway' })
    .populate('items.menu_item', 'name image_url price category');
  if (!order) throw new Error('Takeaway order not found');
  return order;
};

export { createTakeawayOrder, getTakeawayOrdersByPhone, getTakeawayOrderById };
