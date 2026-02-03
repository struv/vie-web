// Chat Routes
// Handles sending messages to Clawd

const express = require('express');
const router = express.Router();

/**
 * POST /chat/send
 * Send a message to Clawd and get response
 * 
 * Body: { message: string }
 * Returns: { success: boolean, reply: string, usage?: object }
 */
router.post('/send', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must include "message" field (string)'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty message',
        message: 'Message cannot be empty'
      });
    }

    // Get OpenClaw service from app context
    const openclawService = req.app.get('openclawService');

    // Send message to gateway
    const result = await openclawService.sendMessage(message);

    if (result.success) {
      res.json({
        success: true,
        reply: result.reply,
        usage: result.usage,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        reply: result.reply,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error in /chat/send:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /chat/stream
 * Stream a message response using Server-Sent Events
 * For Phase 3 - real-time voice responses
 * 
 * Body: { message: string }
 * Returns: SSE stream
 */
router.post('/stream', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must include "message" field (string)'
      });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const openclawService = req.app.get('openclawService');

    // Stream response
    await openclawService.streamMessage(message, (chunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error in /chat/stream:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
