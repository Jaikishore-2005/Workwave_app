// routes/chat.routes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  startChat,
  sendMessage,
  getChatHistory
} = require('../controllers/chat.controller');

router.post('/start', auth, startChat);         // Added for starting a chat
router.post('/send', auth, sendMessage);        // Existing route
router.get('/:bookingId', auth, getChatHistory); // Assuming this for getChatHistory

module.exports = router;