export const dashboardStats = [
  { key: 'revenue', label: 'TOTAL REVENUE', value: '$14,280.00', delta: '+8.1%' },
  { key: 'orders', label: 'TOTAL ORDERS', value: '342', delta: '+6.2%' },
  { key: 'newCustomers', label: 'NEW CUSTOMERS', value: '28', delta: '+2.3%' },
  { key: 'topDish', label: 'TOP SELLING DISH', value: 'Black Truffle Ramen', delta: '+14.7%' },
]

export const recentOrders = [
  { key: '1', orderId: '#SK-981', customer: 'Elena Atsume', table: 'A-02', amount: '$124.50', status: 'Preparing' },
  { key: '2', orderId: '#SK-919', customer: 'Kangi Watanabe', table: 'B-11', amount: '$58.00', status: 'Completed' },
  { key: '3', orderId: '#SK-918', customer: 'Yun Tanaka', table: 'C-04', amount: '$38.00', status: 'Pending' },
]

export const foodStats = [
  { key: 'dishes', label: 'TOTAL DISHES', value: '124' },
  { key: 'categories', label: 'CATEGORIES', value: '8' },
  { key: 'arEnabled', label: 'AR ENABLED', value: '92' },
  { key: 'avgPrice', label: 'AVG PRICE', value: '¥1,850' },
]

export const dishes = [
  { key: '1', dish: 'Tonkotsu Ramen', sku: 'RAM-001', category: 'Main Course', price: '¥1,450', arStatus: 'Available' },
  { key: '2', dish: 'Dragon Roll', sku: 'SUS-042', category: 'Speciality Rolls', price: '¥2,100', arStatus: 'Available' },
  { key: '3', dish: 'Sakura Mochi', sku: 'DES-014', category: 'Dessert', price: '¥780', arStatus: 'Preview' },
]

export const orderStats = [
  { key: 'live', label: 'LIVE ORDERS', value: '24', note: '+12% from last hour' },
  { key: 'wait', label: 'WAIT TIME', value: '18 min', note: 'Target: 15 min' },
  { key: 'revenue', label: 'REVENUE TODAY', value: '¥84.2k', note: 'Peak period active' },
]

export const activeOrders = [
  { key: '1', orderId: '#SK-9421', customer: 'Yuki Sato', table: 'B-12', amount: '¥12,400', status: 'Preparing', action: 'Process' },
  { key: '2', orderId: '#SK-9425', customer: 'Hiroshi Kondo', table: 'A-04', amount: '¥4,200', status: 'Pending', action: 'Accept' },
  { key: '3', orderId: '#SK-9430', customer: 'Maki Asakawa', table: 'C-01', amount: '¥21,800', status: 'Served', action: 'Details' },
]

export const articleStats = [
  { key: 'published', label: 'PUBLISHED ARTICLES', value: '124' },
  { key: 'drafts', label: 'DRAFTS PENDING', value: '12' },
]

export const articles = [
  { key: '1', title: 'Seasonal Sakura Festival Menu Preview', category: 'Promotion', date: 'Oct 24, 2023', author: 'Chef Hiroshi Sato' },
  { key: '2', title: 'Sakura Expands to the Ginza District', category: 'News', date: 'Oct 21, 2023', author: 'Akari Tanaka' },
  { key: '3', title: 'Exclusive Wagyu Tasting Night: Limited Seats', category: 'Promotion', date: 'Oct 18, 2023', author: 'Chef Hiroshi Sato' },
]

export const userStats = [
  { key: 'users', label: 'TOTAL USERS', value: '12,842', note: '+14% this month' },
  { key: 'active', label: 'ACTIVE NOW', value: '842', note: 'Real-time tracking' },
]

export const users = [
  { key: '1', name: 'Yumi Tanaka', email: 'y.tanaka@modernink.com', role: 'Platinum Member', status: 'Verified', lastLogin: '2 hours ago' },
  { key: '2', name: 'Kenji Yamamoto', email: 'k.yamamoto@creative.net', role: 'Guest', status: 'Verified', lastLogin: '1 day ago' },
  { key: '3', name: 'Emi Sato', email: 'emi.sato@globalink.co', role: 'Pro Member', status: 'Pending', lastLogin: '4 days ago' },
  { key: '4', name: 'Hiroshi Nakamura', email: 'h.nakamura@logi.jp', role: 'Platinum Member', status: 'Inactive', lastLogin: '2 months ago' },
]

export const adminStats = [
  { key: 'admins', label: 'TOTAL ADMINS', value: '24', note: '+2 since last month' },
  { key: 'sessions', label: 'ACTIVE SESSIONS', value: '08', note: 'Real-time activity' },
  { key: 'alerts', label: 'SECURITY ALERTS', value: '00', note: 'System secure & verified' },
]

export const adminAccounts = [
  { key: '1', name: 'Kaito Sato', email: 'k.sato@zenithcrimson.jp', role: 'Super Admin', status: 'Active', lastLogin: '2 mins ago' },
  { key: '2', name: 'Ami Tanaka', email: 'a.tanaka@zenithcrimson.jp', role: 'Floor Manager', status: 'Active', lastLogin: '5 hours ago' },
  { key: '3', name: 'Kenji Watanabe', email: 'k.watanabe@zenithcrimson.jp', role: 'Chef', status: 'Inactive', lastLogin: '3 days ago' },
]
