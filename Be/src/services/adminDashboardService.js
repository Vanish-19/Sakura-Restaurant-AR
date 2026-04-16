import Order from '../models/Order.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Payment from '../models/Payment.js';

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDayKey = (date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const pick = (type) => parts.find((p) => p.type === type)?.value || '';
    return `${pick('year')}-${pick('month')}-${pick('day')}`;
  };

  const buildLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      days.push(day);
    }
    return days;
  };

  const completedOnlineOrderIds = await Payment.distinct('order', { status: 'completed' });
  const revenueOrConditions = [{ status: 'paid' }];
  if (completedOnlineOrderIds.length > 0) {
    revenueOrConditions.push({ _id: { $in: completedOnlineOrderIds } });
  }

  const [
    revenueData,
    totalOrders,
    newCustomers,
    topDishData,
    recentOrders,
    revenueTrendRaw
  ] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          $or: revenueOrConditions,
        },
      },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]),
    Order.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.menu_item', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' }
    ]),
    Order.find({})
      .populate('table', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) },
          $or: revenueOrConditions,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
          },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const topDish = topDishData[0]?.menuItem?.name || 'N/A';
  const topDishCount = topDishData[0]?.count || 0;
  const revenueMap = new Map((revenueTrendRaw || []).map((row) => [row._id, Number(row.revenue || 0)]));
  const revenueTrend = buildLast7Days().map((day) => {
    const dayKey = formatDayKey(day);
    return {
      date: dayKey,
      label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: revenueMap.get(dayKey) || 0,
    };
  });

  return {
    stats: {
      revenue: totalRevenue,
      totalOrders,
      newCustomers,
      topDish: {
        name: topDish,
        count: topDishCount
      }
    },
    revenueTrend,
    recentOrders: recentOrders.map(o => ({
        id: o._id,
        customer: o.customer_name || 'Dine-in Guest',
        items_count: o.items.length,
        time: o.createdAt,
        amount: o.total_amount,
        status: o.status
    }))
  };
};
