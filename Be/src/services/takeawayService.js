import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Payment from '../models/Payment.js';
import { createSepayPaymentLinkForOrder } from './sepayPaymentService.js';

const createTakeawayOrder = async ({ customer_name, customer_phone, delivery_address, payment_method = 'cod', items }) => {
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

const getTakeawayOrdersByPhone = async (phone) => {
  return await Order.find({ order_type: 'takeaway', customer_phone: phone })
    .populate('items.menu_item', 'name image_url price')
    .sort({ createdAt: -1 });
};

const getTakeawayOrderById = async (id) => {
  const order = await Order.findOne({ _id: id, order_type: 'takeaway' })
    .populate('items.menu_item', 'name image_url price category');
  if (!order) throw new Error('Takeaway order not found');

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

const cancelTakeawayOrder = async (id) => {
  const order = await Order.findOne({ _id: id, order_type: 'takeaway' });
  if (!order) throw new Error('Takeaway order not found');

  if (order.status === 'paid') {
    throw new Error('Cannot cancel a paid order');
  }

  order.status = 'cancelled';
  const cancelledOrder = await order.save();

  return await Order.findById(cancelledOrder._id)
    .populate('items.menu_item', 'name image_url price category');
};

export { createTakeawayOrder, getTakeawayOrdersByPhone, getTakeawayOrderById, cancelTakeawayOrder };
