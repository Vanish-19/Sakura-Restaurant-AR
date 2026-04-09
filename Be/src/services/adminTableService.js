import Table from '../models/Table.js';
import Order from '../models/Order.js';

const getAllTables = async () => {
  return await Table.find().sort({ name: 1 });
};

const createTable = async (data) => {
  const existing = await Table.findOne({ qr_hash: data.qr_hash });
  if (existing) throw new Error('QR hash already exists');

  const table = new Table(data);
  return await table.save();
};

const updateTable = async (id, data) => {
  const updated = await Table.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('Table not found');
  return updated;
};

const deleteTable = async (id) => {
  const table = await Table.findById(id);
  if (!table) throw new Error('Table not found');

  if (table.status === 'dining') {
    throw new Error('Cannot delete table that is currently in use');
  }

  // Kiểm tra có đơn hàng chưa thanh toán không
  const activeOrders = await Order.countDocuments({
    table: id,
    status: { $nin: ['paid', 'cancelled'] }
  });
  if (activeOrders > 0) {
    throw new Error('Cannot delete table with active orders');
  }

  return await Table.findByIdAndDelete(id);
};

const resetTable = async (id) => {
  const table = await Table.findById(id);
  if (!table) throw new Error('Table not found');

  table.status = 'empty';
  return await table.save();
};

export { getAllTables, createTable, updateTable, deleteTable, resetTable };
