import Order from '../models/Order.js';

const getAllOrders = async ({ status, order_type, page = 1, limit = 20 }) => {
  const query = {};
  if (status) query.status = status;
  if (order_type) query.order_type = order_type;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('table', 'name')
      .populate('items.menu_item', 'name image_url price category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    }
  };
};

const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url price category');
  if (!order) throw new Error('Order not found');
  return order;
};

const updateOrderStatus = async (id, newStatus) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found');

  // Validate trạng thái hợp lệ theo luồng
  const validTransitions = {
    dine_in: {
      pending: ['cooking', 'cancelled'],
      cooking: ['served', 'cancelled'],
      served: ['paid'],
    },
    takeaway: {
      pending: ['cooking', 'cancelled'],
      cooking: ['ready', 'cancelled'],
      ready: ['picked_up'],
      picked_up: ['paid'],
    }
  };

  const allowed = validTransitions[order.order_type]?.[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot change status from '${order.status}' to '${newStatus}' for ${order.order_type} order`);
  }

  order.status = newStatus;
  const updated = await order.save();
  return await Order.findById(updated._id)
    .populate('table', 'name')
    .populate('items.menu_item', 'name image_url');
};

const cancelOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) throw new Error('Order not found');

  if (['paid', 'cancelled', 'picked_up'].includes(order.status)) {
    throw new Error(`Cannot cancel order with status '${order.status}'`);
  }

  order.status = 'cancelled';
  return await order.save();
};

const getOrderStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOptions, todayRevenue, statusCounts] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  return {
    today_orders: todayOptions,
    today_revenue: todayRevenue[0]?.total || 0,
    by_status: Object.fromEntries(statusCounts.map(s => [s._id, s.count])),
  };
};

export { getAllOrders, getOrderById, updateOrderStatus, cancelOrder, getOrderStats };
