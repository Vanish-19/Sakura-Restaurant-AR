import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import { createHttpError } from '../utils/AppError.js';

function normalizeOrderItems(itemsData = [], menuItems = []) {
  const menuMap = new Map(menuItems.map((item) => [String(item._id), item]));
  let totalAmount = 0;

  const processedItems = itemsData.map((item) => {
    const menuItem = menuMap.get(String(item.menu_item_id));
    if (!menuItem) {
      throw createHttpError(`Menu item ${item.menu_item_id} is unavailable`, 404, 'MENU_ITEM_UNAVAILABLE');
    }

    const quantity = Number(item.quantity || 1);
    const lineTotal = menuItem.price * quantity;
    totalAmount += lineTotal;

    return {
      menu_item: menuItem._id,
      quantity,
      price_at_order: menuItem.price,
      note: item.note,
      status: 'pending',
    };
  });

  return { processedItems, totalAmount };
}

async function getAvailableMenuItems(itemsData, session) {
  const menuItemIds = [...new Set(itemsData.map((item) => item.menu_item_id))];
  return MenuItem.find({
    _id: { $in: menuItemIds },
    is_available: true,
  }).session(session);
}

const createNewOrder = async (
  tableId,
  itemsData,
  userId = null,
  customerPhone = '',
  tableSessionId = null,
) => {
  const session = await mongoose.startSession();
  let savedOrderId = null;

  try {
    await session.withTransaction(async () => {
      const table = await Table.findById(tableId).session(session);
      if (!table) {
        throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
      }

      const menuItems = await getAvailableMenuItems(itemsData, session);
      const { processedItems, totalAmount } = normalizeOrderItems(itemsData, menuItems);

      const [savedOrder] = await Order.create(
        [
          {
            order_type: 'dine_in',
            table: tableId,
            table_session: tableSessionId || undefined,
            user: userId || undefined,
            customer_phone: customerPhone || undefined,
            items: processedItems,
            total_amount: totalAmount,
          },
        ],
        { session },
      );

      savedOrderId = savedOrder._id;
    });
  } finally {
    await session.endSession();
  }

  return Order.findById(savedOrderId)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url category');
};

const getKitchenOrders = async (statusFilter) => {
  const query = statusFilter ? { status: statusFilter } : { status: { $ne: 'paid' } };
  return Order.find(query)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url')
    .sort({ createdAt: 1 })
    .lean();
};

const updateOrderStatus = async (orderId, newStatus) => {
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true, runValidators: true },
  ).populate('table', 'name');

  if (!updatedOrder) {
    throw createHttpError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  return updatedOrder;
};

const getOrdersByTableSession = async (tableId, tableSessionId = null) => {
  const query = { table: tableId };
  if (tableSessionId) query.table_session = tableSessionId;

  return Order.find(query)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category')
    .sort({ createdAt: -1 });
};

export { createNewOrder, getKitchenOrders, updateOrderStatus, getOrdersByTableSession };
