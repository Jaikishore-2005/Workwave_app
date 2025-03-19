// controllers/review.controller.js
const Review = require('../models/review.model');
const Booking = require('../models/booking.model');

// Submit a Review (User Only)
const submitReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized action' });
    }
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) return res.status(400).json({ msg: 'Review already submitted' });
    const newReview = new Review({
      bookingId,
      userId: req.user.userId,
      technicianId: booking.technicianId,
      rating,
      comment
    });
    await newReview.save();
    if (booking.status !== 'Completed') {
      booking.status = 'Completed';
      await booking.save();
    }
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Reviews for a Technician
const getReviewsForTechnician = async (req, res) => {
  try {
    const reviews = await Review.find({ technicianId: req.params.technicianId })
      .populate('userId', 'name')
      .sort('-createdAt');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Reviews (Admin Only)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('technicianId', 'name')
      .sort('-createdAt');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitReview,
  getReviewsForTechnician,
  getAllReviews
};