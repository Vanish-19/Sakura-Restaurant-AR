import Table from '../models/Table.js';
import TableReservation from '../models/TableReservation.js';
import { createHttpError } from '../utils/AppError.js';

const RESERVATION_HOLD_MINUTES = 90;
const MIN_ADVANCE_MINUTES = 120;
const DEFAULT_DURATION_MINUTES = 120;

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getReservationWindow(reservation) {
  const reservationTime = new Date(reservation.reservation_time);
  const duration = Number(reservation.expected_duration_minutes || DEFAULT_DURATION_MINUTES);
  return {
    startsAt: addMinutes(reservationTime, -RESERVATION_HOLD_MINUTES),
    endsAt: addMinutes(reservationTime, duration),
  };
}

function getRequestedWindow(reservationTime, expectedDurationMinutes = DEFAULT_DURATION_MINUTES) {
  const time = new Date(reservationTime);
  return {
    startsAt: addMinutes(time, -RESERVATION_HOLD_MINUTES),
    endsAt: addMinutes(time, Number(expectedDurationMinutes || DEFAULT_DURATION_MINUTES)),
  };
}

function windowsOverlap(left, right) {
  return left.startsAt < right.endsAt && right.startsAt < left.endsAt;
}

function assertReservationLeadTime(reservationTime) {
  const requestedAt = new Date(reservationTime);
  if (Number.isNaN(requestedAt.getTime())) {
    throw createHttpError('Reservation time is invalid', 400, 'RESERVATION_TIME_INVALID');
  }

  const minTime = addMinutes(new Date(), MIN_ADVANCE_MINUTES);
  if (requestedAt < minTime) {
    throw createHttpError('Reservations must be made at least 2 hours in advance', 409, 'RESERVATION_TOO_SOON');
  }
}

async function findConflictingReservation(tableId, reservationTime, expectedDurationMinutes = DEFAULT_DURATION_MINUTES) {
  const requestedWindow = getRequestedWindow(reservationTime, expectedDurationMinutes);
  const lookupStart = addMinutes(requestedWindow.startsAt, -DEFAULT_DURATION_MINUTES);
  const lookupEnd = addMinutes(requestedWindow.endsAt, RESERVATION_HOLD_MINUTES);
  const candidates = await TableReservation.find({
    table: tableId,
    status: { $in: ['confirmed', 'seated'] },
    reservation_time: { $gte: lookupStart, $lte: lookupEnd },
  }).lean();

  return candidates.find((reservation) => windowsOverlap(requestedWindow, getReservationWindow(reservation)));
}

async function pickAvailableTable({ partySize, reservationTime, expectedDurationMinutes = DEFAULT_DURATION_MINUTES, preferredTableId }) {
  const tableQuery = {
    capacity: { $gte: Number(partySize || 0) },
  };

  if (preferredTableId) {
    tableQuery._id = preferredTableId;
  }

  const tables = await Table.find(tableQuery).sort({ capacity: 1, name: 1 });
  if (tables.length === 0) {
    throw createHttpError('No table has enough capacity for this party size', 409, 'NO_TABLE_CAPACITY');
  }

  for (const table of tables) {
    const conflict = await findConflictingReservation(table._id, reservationTime, expectedDurationMinutes);
    if (!conflict) return table;
  }

  throw createHttpError('Selected time conflicts with an existing reservation', 409, 'RESERVATION_CONFLICT');
}

async function refreshReservedTableStatuses(now = new Date()) {
  const holdStart = now;
  const holdEnd = addMinutes(now, RESERVATION_HOLD_MINUTES);
  const reservations = await TableReservation.find({
    status: 'confirmed',
    reservation_time: { $gte: holdStart, $lte: holdEnd },
  }).select('table').lean();

  const tableIds = [...new Set(reservations.map((item) => String(item.table)))];
  if (tableIds.length > 0) {
    await Table.updateMany(
      { _id: { $in: tableIds }, status: { $ne: 'dining' } },
      { $set: { status: 'reserved' } },
    );
  }

  await Table.updateMany(
    { status: 'reserved', _id: { $nin: tableIds } },
    { $set: { status: 'empty' } },
  );
}

async function createReservation(payload) {
  assertReservationLeadTime(payload.reservation_time);

  const partySize = Number(payload.party_size || payload.guests || 0);
  if (!Number.isFinite(partySize) || partySize < 1) {
    throw createHttpError('Party size must be at least 1', 400, 'PARTY_SIZE_INVALID');
  }

  const expectedDurationMinutes = Number(payload.expected_duration_minutes || DEFAULT_DURATION_MINUTES);
  const table = await pickAvailableTable({
    partySize,
    reservationTime: payload.reservation_time,
    expectedDurationMinutes,
    preferredTableId: payload.table,
  });

  const reservation = await TableReservation.create({
    table: table._id,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email,
    party_size: partySize,
    reservation_time: payload.reservation_time,
    expected_duration_minutes: expectedDurationMinutes,
    source: payload.source || 'contact',
    note: payload.note,
  });

  await refreshReservedTableStatuses();
  return reservation.populate('table', 'name zone capacity status');
}

async function getReservationsByTable(tableId) {
  return TableReservation.find({ table: tableId })
    .sort({ reservation_time: -1 })
    .populate('table', 'name zone capacity status')
    .lean();
}

async function getUpcomingReservations(limit = 20) {
  return TableReservation.find({
    status: { $in: ['confirmed', 'seated'] },
    reservation_time: { $gte: addMinutes(new Date(), -RESERVATION_HOLD_MINUTES) },
  })
    .sort({ reservation_time: 1 })
    .limit(limit)
    .populate('table', 'name zone capacity status')
    .lean();
}

async function getReservationBlockingTableUse(tableId, now = new Date()) {
  return TableReservation.findOne({
    table: tableId,
    status: 'confirmed',
    reservation_time: {
      $gte: now,
      $lte: addMinutes(now, RESERVATION_HOLD_MINUTES),
    },
  })
    .sort({ reservation_time: 1 })
    .lean();
}

function getReservationPolicy() {
  return {
    holdMinutesBeforeArrival: RESERVATION_HOLD_MINUTES,
    minimumAdvanceMinutes: MIN_ADVANCE_MINUTES,
    defaultDurationMinutes: DEFAULT_DURATION_MINUTES,
  };
}

export {
  createReservation,
  findConflictingReservation,
  getReservationsByTable,
  getReservationPolicy,
  getReservationBlockingTableUse,
  getUpcomingReservations,
  refreshReservedTableStatuses,
};
