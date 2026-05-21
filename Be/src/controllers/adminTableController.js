import asyncHandler from 'express-async-handler';
import {
  getAllTables as svcGetAllTables,
  createTable as svcCreateTable,
  updateTable as svcUpdateTable,
  deleteTable as svcDeleteTable,
  resetTable as svcResetTable,
  getTableReservations as svcGetTableReservations,
  updateTableReservationStatus as svcUpdateTableReservationStatus,
} from '../services/adminTableService.js';

const getAllTables = asyncHandler(async (req, res) => {
  const tables = await svcGetAllTables();
  res.status(200).json({ success: true, count: tables.length, data: tables });
});

const createTable = asyncHandler(async (req, res) => {
  const table = await svcCreateTable(req.body);
  res.status(201).json({ success: true, data: table });
});

const updateTable = asyncHandler(async (req, res) => {
  const table = await svcUpdateTable(req.params.id, req.body);
  res.status(200).json({ success: true, data: table });
});

const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await svcDeleteTable(id);
  res.status(200).json({ success: true, message: 'Đã xóa bàn' });
});

const resetTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await svcResetTable(id);
  if (req.io) req.io.to('admin').emit('table_reset', table);
  res.status(200).json({ success: true, data: table });
});

const getTableReservations = asyncHandler(async (req, res) => {
  const reservations = await svcGetTableReservations(req.params.id);
  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

const updateTableReservationStatus = asyncHandler(async (req, res) => {
  const reservation = await svcUpdateTableReservationStatus(req.params.id, req.params.reservationId, req.body.status);
  if (req.io) req.io.to('admin').emit('reservation_updated', reservation);
  res.status(200).json({ success: true, data: reservation });
});

export { getAllTables, createTable, updateTable, deleteTable, resetTable, getTableReservations, updateTableReservationStatus };
