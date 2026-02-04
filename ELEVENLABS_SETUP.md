# ElevenLabs TTS Integration - Setup Guide

**Date:** Feb 3, 2026  
**Feature:** Premium voice synthesis for Vie Web interface  
**Status:** ✅ IMPLEMENTED

---

## Overview

Vie Web now supports **ElevenLabs TTS** as a premium alternative to browser-based speech synthesis. This provides:

- **Higher quality** voice output with natural prosody
- **Consistent voices** across all browsers and platforms
- **Professional-grade** speech synthesis
- **Multiple voice options** (male/female, different styles)
- **Automatic fallback** to browser TTS if unavailable

---

## Quick Start

### 1. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Click **"Create API Key"**
5. Copy the generated key

### 2. Configure Backend

Add your API key to the backend `.env` file:

```bash
# Edit /home/opc/.openclaw/vie-web/backend/.env
ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Restart Backend

```bash
cd /home/opc/.openclaw/vie-web/backend
npm start
```

### 4. Use in Frontend

1. Open Vie Web in your browser
2. Enable TTS (click 🔊 button)
3. Select **"ElevenLabs"** from the voice dropdown
4. Choose your preferred voice (Rachel, Adam, or Bella)
5. Speak to Vie - responses will use ElevenLabs TTS!

---

## Available Voices

### Rachel (Default)
- **Type:** Female
- **Style:** Calm, professional
- **Accent:** American
- **Best for:** General conversation, explanations

### Adam
- **Type:** Male
- **Style:** Deep, confident
- **Accent:** American
- **Best for:** Authoritative responses, storytelling

### Bella
- **Type:** Female
- **Style:** Warm, expressive
- **Accent:** American
- **Best for:** Friendly conversation, emotional content

---

## How It Works

### Backend (Node.js)

**New Endpoint:** `POST /api/tts/elevenlabs`

```javascript
// Request
{
  "text": "Hello! How can I help you today?",
  "voice_key": "rachel"  // or "adam", "bella"
}

// Response: MP3 audio file (binary)
```

**Features:**
- ✅ Audio file caching (same text = instant playback)
- ✅ Error handling with fallback to browser TTS
- ✅ Rate limit handling
- ✅ API key validation
- ✅ Character limit (5000 max)

**Cache Location:** `/home/opc/.openclaw/vie-web/.audio-cache/`

### Frontend (JavaScript)

**Updated:** `voice.js`

```javascript
// New properties
this.ttsMode = 'browser';        // or 'elevenlabs'
this.elevenLabsVoice = 'rachel'; // voice selection
this.elevenLabsAvailable = false; // API key configured?

// New methods
async speakElevenLabs(text)      // Generate and play ElevenLabs audio
setTTSMode(mode)                 // Switch between browser/ElevenLabs
setElevenLabsVoice(voiceKey)     // Select ElevenLabs voice
```

**Fallback Logic:**
1. Try ElevenLabs API
2. If API fails → browser TTS
3. If browser TTS unavailable → silent (error shown)

---

## UI Changes

### Voice Selection Panel

New dropdown appears when TTS is enabled:

```
[🔊 TTS On]

Voice: [Browser TTS ▼]
       [ElevenLabs  ▼]

       [Rachel - Calm, professional ▼]
       [Adam - Deep, confident     ▼]
       [Bella - Warm, expressive   ▼]
```

### Visual Indicators

- **"Generating..."** - ElevenLabs is creating audio
- **"Speaking..."** - Audio is playing
- **Animated speaker icon** - Pulses during playback

---

## Cost Considerations

### ElevenLabs Pricing

- **Free Tier:** 10,000 characters/month
- **Starter:** $5/month - 30,000 characters
- **Creator:** $22/month - 100,000 characters
- **Pro:** $99/month - 500,000 characters

### Usage Estimates

| Scenario | Characters | Free Tier |
|----------|------------|-----------|
| Short response (50 words) | ~300 | 33 responses |
| Medium response (150 words) | ~900 | 11 responses |
| Long response (500 words) | ~3000 | 3 responses |

**Tip:** Use browser TTS for short responses, ElevenLabs for important/long ones.

### Monitoring Usage

Check your usage at: https://elevenlabs.io/app/usage

---

## Error Handling

### Common Errors & Solutions

#### "ElevenLabs API key not configured"
- **Cause:** `ELEVENLABS_API_KEY` not set in `.env`
- **Solution:** Add API key and restart backend
- **Fallback:** Automatically uses browser TTS

#### "Invalid API key"
- **Cause:** Wrong or expired API key
- **Solution:** Generate new key from ElevenLabs dashboard
- **Fallback:** Automatically uses browser TTS

#### "Rate limit exceeded"
- **Cause:** Too many requests in short time
- **Solution:** Wait 60 seconds
- **Fallback:** Automatically uses browser TTS

#### "Text too long (max 5000 characters)"
- **Cause:** Response exceeds 5000 characters
- **Solution:** Backend should chunk responses
- **Fallback:** Truncates or uses browser TTS

---

## API Reference

### GET /api/tts/voices

List available voices and check API configuration.

**Headers:**
```
x-web-auth-token: <web_auth_token>
```

**Response:**
```json
{
  "success": true,
  "voices": [
    {
      "key": "rachel",
      "id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "description": "Calm, professional female voice",
      "gender": "female",
      "accent": "American"
    },
    // ... more voices
  ],
  "apiKeyConfigured": true
}
```

### POST /api/tts/elevenlabs

Generate speech audio from text.

**Headers:**
```
Content-Type: application/json
x-web-auth-token: <web_auth_token>
```

**Body:**
```json
{
  "text": "Text to synthesize",
  "voice_key": "rachel"  // optional, defaults to rachel
}
```

**Response:**
- Success: `audio/mpeg` (binary MP3 file)
- Error: JSON with `{ success: false, error: "message", fallback: true }`

### DELETE /api/tts/cache

Clear cached audio files (admin only).

**Headers:**
```
x-web-auth-token: <web_auth_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 42 cached audio files"
}
```

---

## Testing

### Manual Testing

1. **Check API availability:**
   ```bash
   curl http://localhost:3000/api/tts/voices \
     -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production"
   ```

2. **Generate test audio:**
   ```bash
   curl -X POST http://localhost:3000/api/tts/elevenlabs \
     -H "Content-Type: application/json" \
     -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production" \
     -d '{"text":"Hello, this is a test.","voice_key":"rachel"}' \
     --output test.mp3
   
   # Play the audio
   mpv test.mp3  # or vlc, ffplay, etc.
   ```

3. **Test in browser:**
   - Open Vie Web
   - Enable TTS
   - Switch to ElevenLabs mode
   - Send a message
   - Verify audio plays with high quality

### Fallback Testing

1. **Disable API key:**
   - Comment out `ELEVENLABS_API_KEY` in `.env`
   - Restart backend
   - Verify browser TTS is used automatically

2. **Invalid API key:**
   - Set `ELEVENLABS_API_KEY=invalid_key`
   - Verify error message appears
   - Verify browser TTS is used

3. **Network failure:**
   - Disconnect internet
   - Verify browser TTS is used

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (Browser)              │
│                                             │
│  User enables TTS → Selects ElevenLabs     │
│                                             │
│  Response arrives → VieVoice.speak(text)    │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  if (mode === 'elevenlabs')          │  │
│  │    POST /api/tts/elevenlabs          │  │
│  │  else                                │  │
│  │    Use browser TTS                   │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────┐
│           Backend (Express Server)          │
│                                             │
│  POST /api/tts/elevenlabs                   │
│                                             │
│  1. Validate request (auth, text length)    │
│  2. Check cache (MD5 hash of voice+text)    │
│  3. If cached: return cached MP3            │
│  4. If not cached:                          │
│     - Call ElevenLabs API                   │
│     - Save MP3 to cache                     │
│     - Return MP3 to client                  │
│                                             │
│  Error? → Return JSON with fallback flag    │
└─────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────┐
│         ElevenLabs API (Cloud)              │
│                                             │
│  POST /v1/text-to-speech/{voice_id}         │
│                                             │
│  Returns: MP3 audio stream                  │
└─────────────────────────────────────────────┘
```

---

## Files Modified

### Backend

- ✅ `backend/src/routes/tts.js` (NEW) - ElevenLabs API integration
- ✅ `backend/src/server.js` - Added TTS routes
- ✅ `backend/.env` - Added `ELEVENLABS_API_KEY`

### Frontend

- ✅ `frontend/public/voice.js` - Added ElevenLabs support
- ✅ `frontend/public/styles.css` - Added voice selection UI styles

### Documentation

- ✅ `ELEVENLABS_SETUP.md` (this file)

---

## Troubleshooting

### Audio doesn't play

**Check:**
1. Is TTS enabled? (green 🔊 button)
2. Is ElevenLabs selected in dropdown?
3. Is API key configured? (`ELEVENLABS_API_KEY` in `.env`)
4. Check browser console for errors
5. Check backend logs for API errors

**Common causes:**
- API key not set → falls back to browser TTS silently
- Invalid API key → error message shown, falls back to browser TTS
- Network issue → error message shown, falls back to browser TTS

### Audio quality is poor

**Check:**
- Are you using ElevenLabs or browser TTS?
- Browser TTS = lower quality (expected)
- ElevenLabs = high quality

**Solution:**
- Ensure "ElevenLabs" is selected in dropdown
- Try different voice (Rachel, Adam, Bella)

### Cache fills up disk

**Solution:**
```bash
# Clear cache manually
rm -rf /home/opc/.openclaw/vie-web/.audio-cache/*.mp3

# Or via API
curl -X DELETE http://localhost:3000/api/tts/cache \
  -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production"
```

**Prevent:**
- Implement cache size limit (future enhancement)
- Implement cache expiration (future enhancement)

---

## Future Enhancements

### Planned

- [ ] **Voice cloning** - Custom voices from samples
- [ ] **Emotion control** - Adjust voice emotion/style
- [ ] **Streaming audio** - Start playing before full generation
- [ ] **Cache management** - Auto-clean old files, size limits
- [ ] **More voices** - Expand beyond Rachel/Adam/Bella
- [ ] **Speed control** - Adjust playback speed
- [ ] **Language support** - Non-English voices

### Nice-to-Have

- [ ] **Voice preview** - Hear samples before selecting
- [ ] **Usage stats** - Track character usage in UI
- [ ] **Batch generation** - Pre-generate common responses
- [ ] **Voice mixing** - Combine multiple voices for character variety

---

## Security Notes

### API Key Protection

- ✅ API key stored in `.env` (not committed to git)
- ✅ Backend-only access (frontend never sees key)
- ✅ Auth required for all TTS endpoints
- ✅ Rate limiting prevents abuse

### Recommendations

1. **Rotate API keys** periodically
2. **Monitor usage** to detect anomalies
3. **Set spending limits** in ElevenLabs dashboard
4. **Use environment variables** (never hardcode keys)

---

## Support

### Resources

- **ElevenLabs Docs:** https://docs.elevenlabs.io/
- **Voice Library:** https://elevenlabs.io/voice-library
- **API Reference:** https://docs.elevenlabs.io/api-reference/

### Getting Help

**Frontend issues:**
- Check browser console
- Verify TTS mode selection
- Test with browser TTS first

**Backend issues:**
- Check backend logs
- Verify API key in `.env`
- Test API directly with curl

**API issues:**
- Check ElevenLabs dashboard
- Verify API key is valid
- Check usage limits

---

## Summary

✅ **ElevenLabs TTS integration complete!**

- Premium voice quality available
- Seamless fallback to browser TTS
- Simple UI for voice selection
- Automatic audio caching
- Comprehensive error handling

**William can now enjoy Vie with professional-grade voices!** 🎙️💜

---

*Implementation by Devon (via Clawd) - Feb 3, 2026*
