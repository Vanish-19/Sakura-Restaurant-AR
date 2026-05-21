import express from 'express';
import { createReservation } from '../controllers/reservationController.js';
import { validateParams } from '../middlewares/validateRequest.js';
import { createReservationSchema } from '../validations/reservationValidation.js';

const router = express.Router();

router.post('/', validateParams(createReservationSchema), createReservation);

export default router;
