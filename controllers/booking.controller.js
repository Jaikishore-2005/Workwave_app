// controllers/booking.controller.js
const Booking = require('../models/booking.model');
const Quote = require('../models/quote.model');
const Notification = require('../models/notification.model');
const Gig = require('../models/gig.model');
const Technician = require('../models/technician.model'); // Add for rating

// Create a Booking (User Only)
const createBooking = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Only users can create bookings' });
  }
  const { quoteId, date, time } = req.body;
  try {
    const quote = await Quote.findById(quoteId)
      .populate('gigId')
      .populate('technicianId');
    if (!quote) return res.status(404).json({ msg: 'Quote not found' });

    if (quote.status !== 'Accepted') {
      return res.status(400).json({ msg: 'Quote is not accepted' });
    }

    const existingBooking = await Booking.findOne({ quoteId });
    if (existingBooking) {
      return res.status(400).json({ msg: 'Booking already exists for this quote' });
    }

    const newBooking = new Booking({
      quoteId,
      gigId: quote.gigId._id,
      userId: req.user.userId,
      technicianId: quote.technicianId._id,
      date,
      time,
      status: 'Scheduled'
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Scheduled Tasks for User
const getScheduledTasksForUser = async (req, res) => {
  try {
    const tasks = await Booking.find({ userId: req.user.userId, status: 'Scheduled' })
      .populate('gigId', 'title')
      .populate('technicianId', 'name');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Completed Tasks for User
const getCompletedTasksForUser = async (req, res) => {
  try {
    const tasks = await Booking.find({ userId: req.user.userId, status: 'Completed' })
      .populate('gigId', 'title')
      .populate('technicianId', 'name');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Scheduled Tasks for Technician
const getScheduledTasksForTechnician = async (req, res) => {
  try {
    const tasks = await Booking.find({ technicianId: req.user.userId, status: 'Scheduled' })
      .populate('gigId', 'title')
      .populate('userId', 'name');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Completed Tasks for Technician
const getCompletedTasksForTechnician = async (req, res) => {
  try {
    const tasks = await Booking.find({ technicianId: req.user.userId, status: 'Completed' })
      .populate('gigId', 'title')
      .populate('userId', 'name');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Booking Status (Technician Only)
const updateBookingStatus = async (req, res) => {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ msg: 'Access denied: Only technicians can update booking status' });
  }
  const { status } = req.body;
  if (!['Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, technicianId: req.user.userId },
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel Booking (User Only)
const cancelBooking = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Only users can cancel bookings' });
  }
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.bookingId, userId: req.user.userId },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const quote = await Quote.findById(booking.quoteId);
    const gig = await Gig.findById(booking.gigId);
    const notification = new Notification({
      userId: req.user.userId,
      technicianId: booking.technicianId,
      message: `The booking for "${gig.title}" has been cancelled by the user.`
    });
    await notification.save();

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rate Booking and Complete (User Only)
const rateBooking = async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Access denied: Only users can rate bookings' });
  }
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
  }

  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.user.userId });
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (booking.status !== 'Completed') {
      booking.status = 'Completed';
      await booking.save();
    }

    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) return res.status(400).json({ msg: 'Review already submitted' });

    const newReview = new Review({
      bookingId: booking._id,
      userId: req.user.userId,
      technicianId: booking.technicianId,
      rating,
      comment: comment || ''
    });
    await newReview.save();

    // Update technician rating
    const technician = await Technician.findById(booking.technicianId);
    const currentRating = technician.rating || 0;
    const ratingCount = technician.ratingCount || 0;
    const newRatingCount = ratingCount + 1;
    const newAverageRating = ((currentRating * ratingCount) + rating) / newRatingCount;

    technician.rating = newAverageRating;
    technician.ratingCount = newRatingCount;
    await technician.save();

    res.status(200).json({ msg: 'Rating submitted and booking completed', review: newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBooking,
  getScheduledTasksForUser,
  getCompletedTasksForUser,
  getScheduledTasksForTechnician,
  getCompletedTasksForTechnician,
  updateBookingStatus,
  cancelBooking,
  rateBooking
};