import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import { finalizeLoyaltyForPaidOrder, reserveRewardVoucherForOrder, revertLoyaltyForCancelledOrder } from './loyaltyService.js';
import { createHttpError } from '../utils/AppError.js';

function normalizeOrderItems(itemsData = [], menuItems = []) {
  const menuMap = new Map(menuItems.map((item) => [String(item._id), item]));
  let subtotalAmount = 0;

  const processedItems = itemsData.map((item) => {
    const menuItem = menuMap.get(String(item.menu_item_id));
    if (!menuItem) {
      throw createHttpError(`Menu item ${item.menu_item_id} is unavailable`, 404, 'MENU_ITEM_UNAVAILABLE');
    }

    const quantity = Number(item.quantity || 1);
    const lineTotal = menuItem.price * quantity;
    subtotalAmount += lineTotal;

    return {
      menu_item: menuItem._id,
      quantity,
      price_at_order: menuItem.price,
      note: item.note,
      status: 'pending',
    };
  });

  return { processedItems, subtotalAmount };
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
  rewardVoucherId = '',
  userPhone = '',
) => {
  const session = await mongoose.startSession();
  let savedOrderId = null;
  const effectiveCustomerPhone = String(customerPhone || userPhone || '').trim();

  try {
    await session.withTransaction(async () => {
      const table = await Table.findById(tableId).session(session);
      if (!table) {
        throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
      }

      const menuItems = await getAvailableMenuItems(itemsData, session);
      const { processedItems, subtotalAmount } = normalizeOrderItems(itemsData, menuItems);

      const [savedOrder] = await Order.create(
        [
          {
            order_type: 'dine_in',
            table: tableId,
            table_session: tableSessionId || undefined,
            user: userId || undefined,
            customer_phone: effectiveCustomerPhone || undefined,
            items: processedItems,
            subtotal_amount: subtotalAmount,
            total_amount: subtotalAmount,
            loyalty: {
              phone: effectiveCustomerPhone || undefined,
            },
          },
        ],
        { session },
      );

      if (rewardVoucherId) {
        const { profile, discountAmount, rewardRedemption } = await reserveRewardVoucherForOrder(
          {
            phone: effectiveCustomerPhone,
            voucherId: rewardVoucherId,
            subtotal: subtotalAmount,
            orderId: savedOrder._id,
            userId,
          },
          { session },
        );

        savedOrder.discount_amount = discountAmount;
        savedOrder.total_amount = Math.max(0, subtotalAmount - discountAmount);
        savedOrder.loyalty = {
          ...savedOrder.loyalty?.toObject?.(),
          phone: effectiveCustomerPhone || undefined,
          profile: profile?._id,
          reward_redemption: rewardRedemption || undefined,
        };
        await savedOrder.save({ session });
      }

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

  if (newStatus === 'paid') {
    await finalizeLoyaltyForPaidOrder(updatedOrder._id);
  } else if (newStatus === 'cancelled') {
    await revertLoyaltyForCancelledOrder(updatedOrder._id);
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
