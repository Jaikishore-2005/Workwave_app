// controllers/chat.controller.js
const Chat = require('../models/chat.model');
const Booking = require('../models/booking.model');

// Start a Chat Session
const startChat = async (req, res) => {
  const { bookingId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    res.status(200).json({ room: bookingId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a Message
const sendMessage = async (req, res) => {
  const { bookingId, message } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    const chatMessage = new Chat({
      bookingId,
      sender: req.user.userId,
      receiver: req.body.receiver,
      message
    });
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Chat History
const getChatHistory = async (req, res) => {
  try {
    const messages = await Chat.find({ bookingId: req.params.bookingId })
      .sort('timestamp')
      .populate('sender', 'name')
      .populate('receiver', 'name');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  startChat,
  sendMessage,
  getChatHistory
};