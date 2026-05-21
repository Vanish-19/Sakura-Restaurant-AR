import asyncHandler from 'express-async-handler';
import { createReservation as svcCreateReservation } from '../services/tableReservationService.js';

const createReservation = asyncHandler(async (req, res) => {
  const reservation = await svcCreateReservation({
    ...req.body,
    source: req.body.source || 'contact',
  });

  if (req.io) {
    req.io.to('admin').emit('reservation_created', reservation);
  }

  res.status(201).json({
    success: true,
    message: 'Reservation created successfully',
    data: reservation,
  });
});

export { createReservation };
