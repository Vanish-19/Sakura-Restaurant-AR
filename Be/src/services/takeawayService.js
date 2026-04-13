import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Payment from '../models/Payment.js';
import { createSepayPaymentLinkForOrder } from './sepayPaymentService.js';

const createTakeawayOrder = async ({ customer_name, customer_phone, delivery_address, payment_method = 'cod', items }, userId) => {
  if (!userId) {
    throw new Error('Cần đăng nhập để đặt đơn giao tận nơi');
  }

  let total_amount = 0;
  const processedItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menu_item_id);
    if (!menuItem || !menuItem.is_available) {
      throw new Error(`Món ${item.menu_item_id} không tồn tại hoặc đang tạm hết`);
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
    user: userId,
    customer_name,
    customer_phone,
    delivery_address,
    items: processedItems,
    total_amount,
  });

  const saved = await order.save();
  const createdOrder = await Order.findById(saved._id)
    .populate('items.menu_item', 'name image_url category');

  if (payment_method === 'online') {
    try {
      const { checkoutUrl } = await createSepayPaymentLinkForOrder(createdOrder);
      const result = createdOrder.toObject();
      result.checkout_url = checkoutUrl;
      result.payment_method = 'online';
      result.payment = {
        checkout_url: checkoutUrl,
        status: 'pending',
      };
      return result;
    } catch (error) {
      await Order.findByIdAndDelete(saved._id);
      throw error;
    }
  }

  return createdOrder;
};

const getTakeawayOrdersByPhone = async (phone, userId) => {
  const query = userId
    ? { order_type: 'takeaway', user: userId }
    : { order_type: 'takeaway', customer_phone: phone };

  return await Order.find(query)
    .populate('items.menu_item', 'name image_url price')
    .sort({ createdAt: -1 });
};

const getTakeawayOrderById = async (id) => {
  const order = await Order.findOne({ _id: id, order_type: 'takeaway' })
    .populate('items.menu_item', 'name image_url price category');
  if (!order) throw new Error('Không tìm thấy đơn giao tận nơi');

  const payment = await Payment.findOne({ order: order._id, method: 'online' });
  const orderObject = order.toObject();

  return {
    ...orderObject,
    payment: payment
      ? {
          id: payment._id,
          status: payment.status,
          checkout_url: payment.checkout_url,
          provider: payment.provider,
          amount: payment.amount,
          currency: payment.currency,
          paid_at: payment.paid_at,
          provider_ref: payment.provider_ref,
        }
      : null,
    checkout_url: payment?.checkout_url || '',
  };
};

const cancelTakeawayOrder = async (id, userId) => {
  const orderQuery = { _id: id, order_type: 'takeaway' };
  if (userId) orderQuery.user = userId;

  const order = await Order.findOne(orderQuery);
  if (!order) throw new Error('Không tìm thấy đơn giao tận nơi');

  if (order.status === 'paid') {
    throw new Error('Không thể hủy đơn đã thanh toán');
  }

  order.status = 'cancelled';
  const cancelledOrder = await order.save();

  return await Order.findById(cancelledOrder._id)
    .populate('items.menu_item', 'name image_url price category');
};

export { createTakeawayOrder, getTakeawayOrdersByPhone, getTakeawayOrderById, cancelTakeawayOrder };
