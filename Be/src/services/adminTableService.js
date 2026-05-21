import Order from '../models/Order.js';
import Table from '../models/Table.js';
import TableReservation from '../models/TableReservation.js';
import { createHttpError } from '../utils/AppError.js';
import { revokeActiveTableSessions } from './tableSessionService.js';
import { getReservationsByTable, refreshReservedTableStatuses, updateReservationStatus as svcUpdateReservationStatus } from './tableReservationService.js';

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

const getAllTables = async () => {
  await refreshReservedTableStatuses();
  const now = new Date();
  const [tables, activeReservations] = await Promise.all([
    Table.find().sort({ name: 1 }).lean(),
    TableReservation.find({
      status: { $in: ['confirmed', 'seated'] },
      reservation_time: {
        $gte: addMinutes(now, -90),
      },
    })
      .sort({ reservation_time: 1 })
      .lean(),
  ]);

  const reservationByTableId = new Map();
  for (const reservation of activeReservations) {
    const tableId = String(reservation.table);
    if (!reservationByTableId.has(tableId)) {
      reservationByTableId.set(tableId, reservation);
    }
  }

  return tables.map((table) => ({
    ...table,
    active_reservation: reservationByTableId.get(String(table._id)) || null,
  }));
};

const createTable = async (data) => {
  const existing = await Table.findOne({ qr_hash: data.qr_hash }).lean();
  if (existing) {
    throw createHttpError('QR code already exists', 409, 'TABLE_QR_DUPLICATE');
  }

  const table = new Table(data);
  return table.save();
};

const updateTable = async (id, data) => {
  const updated = await Table.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) {
    throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
  }
  return updated;
};

const deleteTable = async (id) => {
  const table = await Table.findById(id);
  if (!table) {
    throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
  }

  if (table.status === 'dining') {
    throw createHttpError('Cannot delete a table that is in use', 409, 'TABLE_IN_USE');
  }

  const activeOrders = await Order.countDocuments({
    table: id,
    status: { $nin: ['paid', 'cancelled'] },
  });

  if (activeOrders > 0) {
    throw createHttpError('Cannot delete a table with active orders', 409, 'TABLE_HAS_ACTIVE_ORDERS');
  }

  return Table.findByIdAndDelete(id);
};

const resetTable = async (id) => {
  const table = await Table.findById(id);
  if (!table) {
    throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
  }

  const activeOrders = await Order.countDocuments({
    table: id,
    status: { $nin: ['paid', 'cancelled'] },
  });

  if (activeOrders > 0) {
    throw createHttpError('Cannot reset a table with active unpaid orders', 409, 'TABLE_HAS_ACTIVE_ORDERS');
  }

  table.status = 'empty';
  const saved = await table.save();
  await revokeActiveTableSessions(id);
  await TableReservation.updateMany(
    { table: id, status: 'seated' },
    { $set: { status: 'completed' } },
  );
  return saved;
};

const getTableReservations = async (id) => {
  const table = await Table.findById(id).lean();
  if (!table) {
    throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
  }

  return getReservationsByTable(id);
};

const updateTableReservationStatus = async (tableId, reservationId, status) => {
  const table = await Table.findById(tableId).lean();
  if (!table) {
    throw createHttpError('Table not found', 404, 'TABLE_NOT_FOUND');
  }

  return svcUpdateReservationStatus({ tableId, reservationId, status });
};

export { getAllTables, createTable, updateTable, deleteTable, resetTable, getTableReservations, updateTableReservationStatus };
