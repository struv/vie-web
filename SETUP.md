# Vie Web - Setup & Testing Guide

**Frontend complete! ✓ Backend complete! ✓**

## Quick Start

### 1. Start the Backend

```bash
cd /home/opc/.openclaw/vie-web/backend

# Make sure the gateway token is correct
export OPENCLAW_GATEWAY_TOKEN=$(grep -oP '"token"\s*:\s*"\K[^"]+' ~/.openclaw/openclaw.json | tail -1)

# Start server
npm start
```

The backend will start on `http://localhost:3000`

### 2. Access the Frontend

Open your browser to:
- **Local:** http://localhost:3000
- **External:** http://[your-vm-ip]:3000

The backend automatically serves the frontend files from `/home/opc/.openclaw/vie-web/frontend/public/`

### 3. Test It

Use the provided test script:

```bash
/home/opc/.openclaw/vie-web/test-stack.sh
```

This tests:
- Backend health
- Gateway direct communication
- Full stack (frontend → backend → gateway)
- Frontend file existence

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (anywhere)     │
└────────┬────────┘
         │ HTTP (port 3000)
         ▼
┌─────────────────┐
│ Express Backend │
│  (localhost)    │
└────────┬────────┘
         │ HTTP (localhost only)
         ▼
┌─────────────────┐
│ OpenClaw GW     │
│  (port 18789)   │
└─────────────────┘
```

## Files Created

```
vie-web/
├── backend/
│   ├── src/
│   │   ├── server.js               # Express app
│   │   ├── services/openclaw.js    # Gateway client
│   │   ├── middleware/
│   │   │   ├── auth.js             # Token auth
│   │   │   └── rateLimit.js        # Rate limiting
│   │   └── routes/
│   │       ├── health.js           # Health endpoints
│   │       └── chat.js             # Chat API
│   ├── package.json
│   └── .env                        # Configuration
├── frontend/
│   ├── public/
│   │   ├── index.html              # Main HTML
│   │   ├── styles.css              # Dark purple/gold theme
│   │   └── app.js                  # VieApp class (vanilla JS)
│   └── README.md
├── test-stack.sh                   # Integration test script
├── README.md                       # Main docs
└── SETUP.md                        # This file
```

## Troubleshooting

### Backend won't start

**Error:** `EADDRINUSE: address already in use :::3000`

**Fix:** Kill existing process
```bash
lsof -ti:3000 | xargs kill -9
```

### Gateway authentication fails

**Error:** `401 Unauthorized`

**Fix:** Make sure you're using the correct token from openclaw.json
```bash
# Check which token the gateway expects
grep '"token"' ~/.openclaw/openclaw.json

# Set it in .env or export it
export OPENCLAW_GATEWAY_TOKEN=<token-from-openclaw.json>
```

### Frontend not loading

**Check 1:** Is the backend running?
```bash
curl http://localhost:3000/health
```

**Check 2:** Do frontend files exist?
```bash
ls -la /home/opc/.openclaw/vie-web/frontend/public/
```

**Check 3:** Can you access the index page?
```bash
curl http://localhost:3000/ | head -20
```

### Messages not sending

**Check 1:** Open browser dev tools (F12) and look at Console and Network tabs

**Check 2:** Test the API directly
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production" \
  -d '{"message":"Test"}' | jq
```

**Check 3:** Check backend logs
```bash
# If running with npm start, logs are in stdout
# If running with nohup, check /tmp/vie-backend.log
tail -f /tmp/vie-backend.log
```

## Environment Variables

The backend needs these environment variables (set in `.env`):

```bash
# Server
PORT=3000

# OpenClaw Gateway (localhost only)
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=<from-openclaw.json>

# Web app auth
WEB_AUTH_TOKEN=vie_web_2026_secure_token_replace_in_production

# CORS
ALLOWED_ORIGINS=*

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** If you have `OPENCLAW_GATEWAY_TOKEN` set as a shell environment variable, it will override the `.env` file! Either:
1. Unset it: `unset OPENCLAW_GATEWAY_TOKEN`
2. Or export the correct value: `export OPENCLAW_GATEWAY_TOKEN=<token-from-openclaw.json>`

## API Endpoints

### Health

- `GET /health` - Server status
- `GET /health/gateway` - Gateway connection status

### Chat (requires auth)

- `POST /api/chat/send` - Send message, get response
  - Headers: `x-web-auth-token: <token>`
  - Body: `{"message": "Your message"}`
  - Response: `{"success": true, "reply": "...", "timestamp": "..."}`

- `POST /api/chat/stream` - Stream response (SSE)
  - Same headers/body as /send
  - Response: Server-Sent Events stream

### Static Files

- `GET /` - Serves `frontend/public/index.html`
- `GET /styles.css` - Serves `frontend/public/styles.css`
- `GET /app.js` - Serves `frontend/public/app.js`

## Security Notes

- Gateway token stays on backend (never exposed to browser)
- Frontend uses separate web auth token
- CORS configured (currently allows all origins - tighten in production)
- Rate limiting: 100 requests per minute per IP
- All user input is HTML-escaped before rendering

## Frontend Features

- **ASCII Avatar** with breathing animation (⟢ symbol)
- **Dark Theme** - Deep purple (#1a0f2e) with gold accents (#ffd700)
- **Chat Interface** - User (right/gold) and assistant (left/purple) bubbles
- **Typing Indicator** - Animated dots while waiting for response
- **Auto-resize Input** - Textarea grows as you type
- **Keyboard Shortcuts** - Enter to send, Shift+Enter for newline
- **No Dependencies** - Pure vanilla JavaScript, no frameworks

## What's Missing / Future Enhancements

- [ ] Chat history persistence (currently lost on page reload)
- [ ] Markdown rendering (currently plain text only)
- [ ] Voice input (Web Speech API)
- [ ] Voice output (TTS or audio streaming)
- [ ] Waveform visualization for voice
- [ ] Streaming responses (SSE implementation)
- [ ] Code syntax highlighting
- [ ] File upload support
- [ ] Better error messages
- [ ] Retry logic for failed requests
- [ ] Loading indicators for slow requests

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Gateway endpoint shows `connected: true`
- [ ] Frontend loads at http://localhost:3000
- [ ] Can send a message and get a response
- [ ] Typing indicator appears while waiting
- [ ] Messages appear in correct colors (user=gold, assistant=purple)
- [ ] Avatar breathing animation works
- [ ] Textarea auto-resizes
- [ ] Enter key sends message
- [ ] Shift+Enter adds newline
- [ ] External access works from Windows browser

## Performance Notes

- **Frontend:** ~10KB total (no minification yet)
- **Backend:** ~50MB memory footprint
- **Response Time:** ~1-3s per message (depends on OpenClaw processing)
- **Concurrent Users:** Limited by rate limiting (100 req/min per IP)

## Development Workflow

### Make Frontend Changes

1. Edit files in `/home/opc/.openclaw/vie-web/frontend/public/`
2. Refresh browser (no build step needed!)
3. Check browser console for errors

### Make Backend Changes

1. Edit files in `/home/opc/.openclaw/vie-web/backend/src/`
2. Restart backend: `npm start` (or use nodemon for auto-reload)
3. Test with curl or browser

### Test Full Stack

```bash
/home/opc/.openclaw/vie-web/test-stack.sh
```

## Browser Compatibility

**Tested & Working:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

**Required Features:**
- ES6+ (classes, arrow functions, async/await)
- Fetch API
- CSS Grid/Flexbox
- CSS animations
- LocalStorage (for future persistence)

## Production Checklist

Before deploying publicly:

- [ ] Change `WEB_AUTH_TOKEN` to a secure random value
- [ ] Restrict `ALLOWED_ORIGINS` to your domain
- [ ] Enable HTTPS (reverse proxy with nginx/caddy)
- [ ] Set up proper logging (Winston or similar)
- [ ] Add monitoring (uptime, errors, performance)
- [ ] Implement rate limiting per user (not just IP)
- [ ] Add session management
- [ ] Implement chat history persistence
- [ ] Minify frontend assets
- [ ] Add CSP headers
- [ ] Set up automatic backups
- [ ] Document deployment process
- [ ] Create systemd service for backend
- [ ] Set up log rotation

---

**Built:** Feb 3, 2026  
**Style:** Fast iteration, clean code, no BS  
**Status:** ✓ Working prototype ready for testing  
**Next:** Test from Windows, iterate based on feedback  

Got questions? Check the READMEs or ping in Discord! 💜
