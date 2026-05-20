import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { ensureStaticPages } from './services/staticPageContentService.js';

async function main() {
  await connectDB();
  await ensureStaticPages();
  console.log('Seed completed: static page defaults are synchronized.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
