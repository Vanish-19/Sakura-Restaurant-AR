import 'dotenv/config';
import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';
import Table from './models/Table.js';
import Admin from './models/Admin.js';
import Order from './models/Order.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sakura_restaurant';

const menuItems = [
  { name: 'Salmon Nigiri', description: 'Fresh salmon over sushi rice', price: 12.99, category: 'sushi', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80', is_available: true },
  { name: 'Tuna Nigiri', description: 'Premium bluefin tuna', price: 15.99, category: 'sushi', image_url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80', is_available: true },
  { name: 'California Roll', description: 'Crab, avocado, and cucumber', price: 10.99, category: 'sushi', image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80', is_available: true },
  { name: 'Dragon Roll', description: 'Eel and avocado roll', price: 16.99, category: 'sushi', image_url: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=800&q=80', is_available: true },
  { name: 'Shoyu Ramen', description: 'Soy-based broth with chashu', price: 13.50, category: 'ramen', image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80', is_available: true },
  { name: 'Tonkotsu Ramen', description: 'Rich pork-bone broth', price: 14.50, category: 'ramen', image_url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80', is_available: true },
  { name: 'Shrimp Tempura', description: 'Crispy shrimp with dipping sauce', price: 11.25, category: 'tempura', image_url: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80', is_available: true },
  { name: 'Katsu Don', description: 'Pork cutlet over rice and egg', price: 12.75, category: 'donburi', image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80', is_available: true },
  { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 5.50, category: 'appetizers', image_url: 'https://images.unsplash.com/photo-1564093497595-593b96d80571?w=800&q=80', is_available: true },
];

const tables = [
  { name: 'T01', qr_hash: 't-001', status: 'dining', zone: 'Main Hall', capacity: 4 },
  { name: 'T02', qr_hash: 't-002', status: 'empty', zone: 'Window', capacity: 2 },
  { name: 'T03', qr_hash: 't-003', status: 'reserved', zone: 'Terrace', capacity: 6 },
  { name: 'T04', qr_hash: 't-004', status: 'dining', zone: 'Main Hall', capacity: 4 },
  { name: 'T05', qr_hash: 't-005', status: 'empty', zone: 'Terrace', capacity: 4 },
  { name: 'T06', qr_hash: 't-006', status: 'empty', zone: 'Main Hall', capacity: 8 },
  { name: 'T07', qr_hash: 't-007', status: 'dining', zone: 'Main Hall', capacity: 4 },
  { name: 'T08', qr_hash: 't-008', status: 'empty', zone: 'Window', capacity: 2 },
  { name: 'T09', qr_hash: 't-009', status: 'empty', zone: 'VIP Lounge', capacity: 6 },
  { name: 'T10', qr_hash: 't-010', status: 'empty', zone: 'VIP Lounge', capacity: 10 },
];

const admins = [
  { username: 'admin', password: 'admin123', role: 'admin' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);

    // Clear existing data
    await Order.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Admin.deleteMany({});
    console.log('Cleared existing data.');

    // Seed Menu Items
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${createdItems.length} menu items.`);

    // Seed Tables
    const createdTables = await Table.insertMany(tables);
    console.log(`Seeded ${createdTables.length} tables.`);

    // Seed Admins
    for (const adminData of admins) {
      const admin = new Admin(adminData);
      await admin.save();
    }
    console.log('Seeded admins.');

    // Seed Orders
    const diningTables = createdTables.filter(t => t.status === 'dining');
    
    for (const table of diningTables) {
      const randomItem1 = createdItems[Math.floor(Math.random() * createdItems.length)];
      const randomItem2 = createdItems[Math.floor(Math.random() * createdItems.length)];

      await Order.create({
        order_type: 'dine_in',
        table: table._id,
        status: ['pending', 'cooking', 'served'][Math.floor(Math.random() * 3)],
        items: [
          { menu_item: randomItem1._id, quantity: 2, price_at_order: randomItem1.price },
          { menu_item: randomItem2._id, quantity: 1, price_at_order: randomItem2.price }
        ],
        total_amount: (randomItem1.price * 2) + randomItem2.price
      });
    }

    // Add some takeaway orders
    for (let i = 1; i <= 3; i++) {
        const randomItem1 = createdItems[Math.floor(Math.random() * createdItems.length)];
        await Order.create({
            order_type: 'takeaway',
            customer_name: `Customer ${i}`,
            customer_phone: `090123456${i}`,
            status: ['pending', 'cooking', 'ready', 'picked_up'][Math.floor(Math.random() * 4)],
            items: [
                { menu_item: randomItem1._id, quantity: 1, price_at_order: randomItem1.price }
            ],
            total_amount: randomItem1.price
        });
    }

    console.log('Seeded some sample orders.');

    console.log('\n=== SEED COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
