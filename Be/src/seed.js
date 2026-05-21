import 'dotenv/config';
import { connectDB } from './config/db.js';
import RewardVoucher from './models/RewardVoucher.js';

const SAMPLE_VOUCHERS = [
  {
    code: 'SAKURA30',
    title: 'Giảm 30.000đ cho đơn từ 199.000đ',
    description: 'Voucher nhẹ để khách mới đổi nhanh ngay từ những lần ăn đầu tiên.',
    points_cost: 30,
    discount_type: 'fixed_amount',
    discount_value: 30000,
    min_order_amount: 199000,
    max_discount_amount: 0,
    quantity: 0,
    is_active: true,
  },
  {
    code: 'ARLOVER50',
    title: 'Giảm 50.000đ cho đơn trải nghiệm AR',
    description: 'Phù hợp cho khách muốn thử thực đơn AR và đổi điểm ở mức vừa phải.',
    points_cost: 50,
    discount_type: 'fixed_amount',
    discount_value: 50000,
    min_order_amount: 299000,
    max_discount_amount: 0,
    quantity: 0,
    is_active: true,
  },
  {
    code: 'OMAKASE10',
    title: 'Giảm 10% tối đa 120.000đ',
    description: 'Voucher dành cho đơn lớn, giúp nhóm khách đổi điểm tiết kiệm hơn.',
    points_cost: 120,
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 600000,
    max_discount_amount: 120000,
    quantity: 200,
    is_active: true,
  },
  {
    code: 'FAMILY80',
    title: 'Giảm 80.000đ cho nhóm gia đình',
    description: 'Áp dụng tốt cho các đơn takeaway hoặc nhóm 4 người trở lên.',
    points_cost: 80,
    discount_type: 'fixed_amount',
    discount_value: 80000,
    min_order_amount: 450000,
    max_discount_amount: 0,
    quantity: 150,
    is_active: true,
  },
  {
    code: 'VIP15',
    title: 'Giảm 15% tối đa 180.000đ',
    description: 'Mốc đổi điểm cao hơn cho khách tích lũy lâu dài.',
    points_cost: 180,
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 800000,
    max_discount_amount: 180000,
    quantity: 80,
    is_active: true,
  },
];

async function seedRewardVouchers() {
  const results = [];

  for (const voucher of SAMPLE_VOUCHERS) {
    const saved = await RewardVoucher.findOneAndUpdate(
      { code: voucher.code },
      { $set: voucher },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    );
    results.push(saved);
  }

  return results;
}

async function main() {
  await connectDB();
  const vouchers = await seedRewardVouchers();
  console.log(`Seeded ${vouchers.length} reward vouchers.`);
  vouchers.forEach((voucher) => {
    console.log(`- ${voucher.code}: ${voucher.title}`);
  });
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error?.message || error);
  process.exit(1);
});
