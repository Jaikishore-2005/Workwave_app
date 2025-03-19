// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { verifiedTechnician } = require('../middleware/verifiedTechnician');
const {
  createBooking,
  getScheduledTasksForUser,
  getCompletedTasksForUser,
  getScheduledTasksForTechnician,
  getCompletedTasksForTechnician,
  updateBookingStatus,
  cancelBooking,
  rateBooking
} = require('../controllers/booking.controller');

router.post('/', auth, createBooking);
router.get('/user/scheduled', auth, getScheduledTasksForUser);
router.get('/user/completed', auth, getCompletedTasksForUser);
router.get('/technician/scheduled', auth, getScheduledTasksForTechnician);
router.get('/technician/completed', auth, getCompletedTasksForTechnician);
router.put('/:bookingId', auth, updateBookingStatus);       // Fixed for technician update
router.put('/:bookingId/cancel', auth, cancelBooking);
router.put('/:bookingId/rate', auth, rateBooking);         // Added for user rating

module.exports = router;