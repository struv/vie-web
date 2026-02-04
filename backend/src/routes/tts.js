/**
 * TTS Routes - ElevenLabs Text-to-Speech API
 * Provides premium voice synthesis as alternative to browser TTS
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Cache directory for generated audio files
const CACHE_DIR = path.join(__dirname, '../../../.audio-cache');

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Recommended voices (curated selection)
const RECOMMENDED_VOICES = {
  'rachel': {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Calm, professional female voice',
    gender: 'female',
    accent: 'American'
  },
  'adam': {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Deep, confident male voice',
    gender: 'male',
    accent: 'American'
  },
  'bella': {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Warm, expressive female voice',
    gender: 'female',
    accent: 'American'
  }
};

/**
 * GET /api/tts/voices
 * List available voices
 */
router.get('/voices', (req, res) => {
  res.json({
    success: true,
    voices: Object.entries(RECOMMENDED_VOICES).map(([key, voice]) => ({
      key,
      ...voice
    })),
    apiKeyConfigured: !!ELEVENLABS_API_KEY
  });
});

/**
 * POST /api/tts/elevenlabs
 * Generate speech using ElevenLabs API
 * Body: { text: string, voice_id?: string, voice_key?: string }
 */
router.post('/elevenlabs', async (req, res) => {
  try {
    // Check API key
    if (!ELEVENLABS_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'ElevenLabs API key not configured',
        fallback: true
      });
    }

    const { text, voice_id, voice_key } = req.body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long (max 5000 characters)'
      });
    }

    // Determine voice ID
    let voiceId = voice_id;
    if (voice_key && RECOMMENDED_VOICES[voice_key]) {
      voiceId = RECOMMENDED_VOICES[voice_key].id;
    }
    if (!voiceId) {
      voiceId = RECOMMENDED_VOICES.rachel.id; // Default to Rachel
    }

    // Generate cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(`${voiceId}:${text}`)
      .digest('hex');
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    // Check cache
    if (fs.existsSync(cacheFile)) {
      console.log('Serving cached audio:', cacheKey);
      return res.sendFile(cacheFile);
    }

    // Call ElevenLabs API
    console.log('Generating audio with ElevenLabs:', {
      voiceId,
      textLength: text.length,
      cacheKey
    });

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 401) {
        return res.status(503).json({
          success: false,
          error: 'Invalid API key',
          fallback: true
        });
      }
      
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Try again in a moment.',
          fallback: true
        });
      }

      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio buffer
    const audioBuffer = await response.buffer();

    // Cache the audio file
    fs.writeFileSync(cacheFile, audioBuffer);
    console.log('Audio cached:', cacheKey);

    // Send audio file
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400' // 24 hours
    });
    res.send(audioBuffer);

  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: true
    });
  }
});

/**
 * DELETE /api/tts/cache
 * Clear audio cache
 */
router.delete('/cache', (req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let deleted = 0;

    files.forEach(file => {
      if (file.endsWith('.mp3')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
        deleted++;
      }
    });

    res.json({
      success: true,
      message: `Cleared ${deleted} cached audio files`
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
