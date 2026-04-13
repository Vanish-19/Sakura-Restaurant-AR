import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';

const createNewOrder = async (tableId, itemsData, userId = null, customerPhone = '') => {
  // 1. Kiểm tra Table tồn tại
  const table = await Table.findById(tableId);
  if (!table) throw new Error('Không tìm thấy bàn');

  // 2. Map dữ liệu món ăn và kiểm tra giá trị thực từ DB
  let total_amount = 0;
  const processedItems = [];

  for (const item of itemsData) {
    const menuItem = await MenuItem.findById(item.menu_item_id);
    if (!menuItem || !menuItem.is_available) {
      throw new Error(`Món ${item.menu_item_id} không tồn tại hoặc đang tạm hết`);
    }

    const price = menuItem.price;
    total_amount += price * item.quantity;

    processedItems.push({
      menu_item: menuItem._id,
      quantity: item.quantity,
      price_at_order: price,
      note: item.note
    });
  }

  // 3. Tạo order mới trong MongoDB
  const newOrder = new Order({
    order_type: 'dine_in',
    table: tableId,
    user: userId || undefined,
    customer_phone: customerPhone || undefined,
    items: processedItems,
    total_amount
  });

  const savedOrder = await newOrder.save();

  // 4. Trả về Order đầy đủ thông tin để Controller có thể emit Socket
  return await Order.findById(savedOrder._id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url category');
};

const getKitchenOrders = async (statusFilter) => {
  const query = statusFilter ? { status: statusFilter } : { status: { $ne: 'paid' } };
  return await Order.find(query)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url')
    .sort({ createdAt: 1 });
};

const updateOrderStatus = async (orderId, newStatus) => {
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true }
  ).populate('table', 'name');

  if (!updatedOrder) throw new Error('Không tìm thấy đơn hàng');
  return updatedOrder;
};

const getOrdersByTableSession = async (tableId) => {
  return await Order.find({ table: tableId })
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category')
    .sort({ createdAt: -1 });
};

export { createNewOrder, getKitchenOrders, updateOrderStatus, getOrdersByTableSession };
