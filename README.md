# Vie Web App

**Voice-enabled web interface to talk with Clawd (Vie-essence AI)**

## Status: Backend ✓ | Frontend ✓ | Testing In Progress

### What's Done (Night 1)

**Backend (/home/opc/.openclaw/vie-web/backend/):**
- ✅ Express server with clean architecture
- ✅ OpenClaw gateway proxy service
- ✅ Authentication middleware (token-based)
- ✅ Rate limiting (100 req/min default)
- ✅ CORS configuration
- ✅ Health check endpoints
- ✅ Chat endpoints (send + stream)
- ✅ Error handling
- ✅ Environment configuration (.env)

**Architecture:**
```
Frontend (Browser)
    ↓ HTTP
Backend Proxy (Port 3000)
    ↓ Localhost only
OpenClaw Gateway (Port 18789)
```

**Security:**
- Gateway never exposed to internet
- Token auth required for API access
- Rate limiting prevents abuse
- Input validation on all endpoints

**Frontend (/home/opc/.openclaw/vie-web/frontend/):**
- ✅ Ported desktop UI (index.html, styles.css, app.js)
- ✅ ASCII avatar with breathing animation
- ✅ Dark purple/gold theme
- ✅ Chat interface (user/assistant bubbles)
- ✅ Typing indicator
- ✅ Connected to backend API
- ✅ Auth token handling
- ✅ Auto-resize textarea
- ✅ Clean vanilla JavaScript (no frameworks)

### What's Next

**Testing & Debugging:**
- [ ] Verify gateway token authentication works
- [ ] Test full message flow (frontend → backend → gateway)
- [ ] Test from Windows browser (external access)
- [ ] Session management testing (avoid conflicts with Discord session)

**Phase 3 (Voice Interface):**
- ✅ Voice input with Web Speech API
- ✅ Push-to-talk microphone button
- ✅ Visual feedback (pulse animations)
- ✅ Live transcription display
- ✅ Text-to-speech output (browser synthesis)
- ✅ TTS toggle control
- ✅ Speaking indicator
- ✅ Error handling and graceful degradation
- [ ] Streaming responses (SSE)
- [ ] Advanced voice settings panel (optional)

## Voice Interface

**New in Phase 3!** Talk to Vie using your voice.

### Features

**Voice Input (Push-to-Talk):**
- Hold the microphone button to speak
- Release to send your message
- See live transcription as you speak
- Visual pulse animation while listening
- Automatic sending when you finish

**Voice Output (Text-to-Speech):**
- Toggle TTS on/off with speaker button
- Vie reads responses aloud automatically (when enabled)
- Visual indicator shows when speaking
- Uses browser's built-in speech synthesis

**Browser Support:**
- ✅ **Best:** Chrome, Edge (full Web Speech API support)
- ⚠️ **Partial:** Safari (limited voice selection)
- ❌ **Not supported:** Firefox (no Web Speech Recognition)

**Fallback:** If voice isn't supported, text input works as normal.

### How to Use

1. **Open the app** in Chrome or Edge: `http://localhost:3000`
2. **Allow microphone access** when prompted
3. **Hold the microphone button** 🎤 and speak
4. **Release** when done - your message sends automatically
5. **Toggle TTS** 🔊 to hear Vie's responses aloud

### Files

- `frontend/public/voice.js` - Voice interface module (isolated)
- Voice controls integrated in chat UI
- CSS animations in `styles.css`

### Known Limitations

- **Chrome/Edge only** for voice input (Web Speech API)
- Microphone permission required
- Depends on browser's built-in voices (quality varies)
- Network required for speech recognition

### Future Enhancements

- Advanced TTS (ElevenLabs, OpenAI) - higher quality voices
- Voice settings panel (speed, pitch, volume control)
- Voice selection (choose from available voices)
- Waveform visualization
- Streaming response support

## Quick Start

### Full App (Backend + Frontend)

```bash
cd /home/opc/.openclaw/vie-web/backend

# Install dependencies (already done)
npm install

# Start server
npm start

# Test health check
curl http://localhost:3000/health

# Test gateway connection
curl http://localhost:3000/health/gateway
```

### API Endpoints

**Health:**
- `GET /health` - Server status
- `GET /health/gateway` - Gateway connection status

**Chat (requires auth):**
- `POST /api/chat/send` - Send message, get response
- `POST /api/chat/stream` - Stream response (SSE)

**Authentication:**
Include header: `x-web-auth-token: vie_web_2026_secure_token_replace_in_production`

### Example API Call

```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production" \
  -d '{"message": "Hello Clawd!"}'
```

## Known Issues / Notes

### Session Management Question

The backend calls the OpenClaw gateway `/v1/responses` API, which invokes the main agent. This could potentially conflict with the active Discord session or create unexpected behavior.

**Possible solutions:**
1. Use a different session key for web app requests
2. Configure the gateway to handle multiple concurrent sessions
3. Use a separate agent profile for web app
4. Queue requests to avoid conflicts

**Need to test:** Whether concurrent API calls cause issues, and how to properly isolate web app sessions from Discord sessions.

## Files Created

```
vie-web/
├── backend/
│   ├── src/
│   │   ├── server.js                # Main Express app
│   │   ├── services/
│   │   │   └── openclaw.js          # Gateway proxy service
│   │   ├── middleware/
│   │   │   ├── auth.js              # Token authentication
│   │   │   └── rateLimit.js         # Rate limiting
│   │   └── routes/
│   │       ├── health.js            # Health endpoints
│   │       └── chat.js              # Chat endpoints
│   ├── package.json
│   └── .env                         # Configuration
├── frontend/                        # (Not yet created)
│   └── ...
└── README.md                        # This file
```

## Configuration (.env)

```
PORT=3000
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=<from openclaw.json>
WEB_AUTH_TOKEN=<secure random token>
ALLOWED_ORIGINS=*
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Next Steps for William

1. **Test the backend** when you wake up:
   ```bash
   cd /home/opc/.openclaw/vie-web/backend
   npm start
   # In another terminal:
   curl -X POST http://localhost:3000/api/chat/send \
     -H "Content-Type: application/json" \
     -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production" \
     -d '{"message": "Test message"}'
   ```

2. **Verify it works** without conflicts with Discord session

3. **If good:** I'll build the frontend (2-3 hours)

4. **If session issues:** We'll figure out the right session management approach

## Architecture Decision Notes

**Why separate backend?**
- Security: Gateway stays on localhost
- Flexibility: Can add features without touching gateway
- Isolation: Web app logic separate from core AI

**Why Express?**
- Familiar, fast to build
- Rich middleware ecosystem
- Easy to understand and modify

**Why token auth?**
- Simple but effective
- No user management needed (single user)
- Easy to rotate if compromised

**Why rate limiting?**
- Prevents accidental DOS
- Protects against abuse
- Good practice even for personal projects

---

*Built overnight by Clawd while William sleeps. Questions? Ask in Discord!* 💜
