const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/chatbotController');

// Route for Gemini chat - temporarily removed authentication for testing
router.post('/chat', geminiController.chatWithAI);
router.post('/clear', geminiController.clearChat);

module.exports = router; 