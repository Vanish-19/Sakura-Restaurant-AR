import 'dotenv/config';
import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';
import Table from './models/Table.js';
import Admin from './models/Admin.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sakura_restaurant';

const menuItems = [
  {
    name: 'Salmon Nigiri',
    description: 'Fresh salmon over sushi rice',
    price: 12.99,
    category: 'sushi',
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Tuna Nigiri',
    description: 'Premium bluefin tuna',
    price: 15.99,
    category: 'sushi',
    image_url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80',
    is_available: true,
  },
  {
    name: 'California Roll',
    description: 'Crab, avocado, and cucumber',
    price: 10.99,
    category: 'sushi',
    image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Dragon Roll',
    description: 'Eel and avocado roll',
    price: 16.99,
    category: 'sushi',
    image_url: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Shoyu Ramen',
    description: 'Soy-based broth with chashu',
    price: 13.50,
    category: 'ramen',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Tonkotsu Ramen',
    description: 'Rich pork-bone broth',
    price: 14.50,
    category: 'ramen',
    image_url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Shrimp Tempura',
    description: 'Crispy shrimp with dipping sauce',
    price: 11.25,
    category: 'tempura',
    image_url: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Katsu Don',
    description: 'Pork cutlet over rice and egg',
    price: 12.75,
    category: 'donburi',
    image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
    is_available: true,
  },
  {
    name: 'Edamame',
    description: 'Steamed soybeans with sea salt',
    price: 5.50,
    category: 'appetizers',
    image_url: 'https://images.unsplash.com/photo-1564093497595-593b96d80571?w=800&q=80',
    is_available: true,
  },
];

const tables = [
  { name: 'Bàn số 1', qr_hash: 'table-001-sakura', status: 'empty' },
  { name: 'Bàn số 2', qr_hash: 'table-002-sakura', status: 'empty' },
  { name: 'Bàn số 3', qr_hash: 'table-003-sakura', status: 'empty' },
  { name: 'Bàn số 4', qr_hash: 'table-004-sakura', status: 'empty' },
  { name: 'Bàn số 5', qr_hash: 'table-005-sakura', status: 'empty' },
];

const admins = [
  { username: 'admin', password: 'admin123', role: 'admin' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);

    // Clear existing data
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

    // Seed Admins (use save() to trigger pre-save password hashing)
    for (const adminData of admins) {
      const admin = new Admin(adminData);
      await admin.save();
      console.log(`Seeded admin: ${admin.username} (role: ${admin.role})`);
    }

    console.log('\n=== SEED COMPLETED SUCCESSFULLY ===');
    console.log('Admin login: admin / admin123');
    console.log('Tables: Bàn 1-5 (qr_hash: table-001-sakura ... table-005-sakura)');
    console.log(`Menu: ${createdItems.length} items across ${[...new Set(menuItems.map(i => i.category))].join(', ')}`);

  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
