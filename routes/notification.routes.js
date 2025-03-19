// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createNotification,
  getNotifications,
  markAsRead
} = require('../controllers/notification.controller');

router.post('/', auth, createNotification);        // Create notification
router.get('/', auth, getNotifications);           // Get notifications for user/technician
router.put('/:notificationId/read', auth, markAsRead); // Assumed for markAsRead

module.exports = router;