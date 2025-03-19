// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  verifyTechnician,
  getAllGigs,
  getAllUsersAndTechnicians, // Removed getAllUsers since it’s not in controller
  getUnverifiedTechnicians,
  updateAccountStatus
} = require('../controllers/admin.controller');

// Technician Verification
router.put('/verify-technician/:technicianId', adminAuth, verifyTechnician);

// Get unverified Technicians
router.get('/unverified-technicians', adminAuth, getUnverifiedTechnicians);

// View All Gigs
router.get('/gigs', adminAuth, getAllGigs);

// View All Users and Technicians
router.get('/users', adminAuth, getAllUsersAndTechnicians);

// Block or Approve User or Technician
router.put('/account/:id', adminAuth, updateAccountStatus);

module.exports = router;