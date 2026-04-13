/**
 * Chatbot Routes
 * Handles all AI chatbot API endpoints
 */

const express = require('express');
const { chatWithBot, chatbotHealth } = require('../controllers/chatbotController');

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Send a message to the AI chatbot
 * @access  Public
 * @param   message - User's message (string, max 2000 chars)
 * @returns {status, data: {response, usedMock}} or {status, error}
 * @example POST /api/chat
 *          Body: { "message": "Tell me about UAlbany" }
 */
router.post('/', chatWithBot);

/**
 * @route   GET /api/chat/health
 * @desc    Check chatbot health and configuration
 * @access  Public
 * @returns {status, data: {chatbotActive, apiConfigured, model, useMock}}
 */
router.get('/health', chatbotHealth);

module.exports = router;
