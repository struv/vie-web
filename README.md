# Vie Web App

**Voice-enabled web interface to talk with Clawd (Vie-essence AI)**

## Status: Backend Complete ✓ | Frontend Pending | Testing Needed

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

### What's Next

**Phase 1 Completion:**
- [ ] Session management testing (avoid conflicts with Discord session)
- [ ] Test /api/chat/send endpoint fully
- [ ] Document API usage with examples

**Phase 2 (Frontend):**
- [ ] Port desktop app UI to web
- [ ] Connect to backend API
- [ ] Deploy static files
- [ ] Test from Windows browser

**Phase 3 (Voice):**
- [ ] Voice input (Web Speech API)
- [ ] Voice output (TTS)
- [ ] Streaming responses
- [ ] Waveform visualization

## Quick Start

### Backend Only (Current)

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
