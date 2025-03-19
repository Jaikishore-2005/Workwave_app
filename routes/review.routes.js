// routes/review.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  submitReview,
  getReviewsForTechnician,
  getAllReviews
} = require('../controllers/review.controller');

router.post('/', auth, submitReview);                         // Submit a review
router.get('/technician/:technicianId', auth, getReviewsForTechnician); // Get reviews for a technician
router.get('/all', auth, adminAuth, getAllReviews);          // Get all reviews (admin only)

module.exports = router;