// controllers/notification.controller.js
const Notification = require('../models/notification.model');

// Create a New Notification
const createNotification = async (req, res) => {
  const { userId, technicianId, message } = req.body;
  try {
    const newNotification = new Notification({
      userId,
      technicianId,
      message
    });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Notifications for User or Technician
const getNotifications = async (req, res) => {
  try {
    let notifications;
    if (req.user.role === 'user') {
      notifications = await Notification.find({ userId: req.user.userId }).sort('-createdAt');
    } else if (req.user.role === 'technician') {
      notifications = await Notification.find({ technicianId: req.user.userId }).sort('-createdAt');
    } else {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};