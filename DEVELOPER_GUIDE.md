# Vie Web - Developer Guide

**Architecture, code structure, and development guide for Vie Web.**

This guide covers the technical implementation, how to add features, and code organization.

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
│                 │
│  Frontend (JS)  │  ← index.html, app.js, voice.js, avatar.js
└────────┬────────┘
         │ HTTP/HTTPS
         │ (Port 3000)
         ↓
┌─────────────────┐
│  Backend Proxy  │
│   (Express.js)  │  ← auth, rate-limit, CORS, routing
└────────┬────────┘
         │ HTTP (localhost only)
         │ (Port 18789)
         ↓
┌─────────────────┐
│ OpenClaw Gateway│
│  (Main Agent)   │  ← Clawd AI, sessions, tools
└─────────────────┘
```

**Why this architecture?**

1. **Security:** Gateway never exposed to internet
2. **Flexibility:** Backend handles auth, caching, rate limiting
3. **Isolation:** Web app separate from core AI system
4. **Simplicity:** Clean separation of concerns

### Data Flow

**Text message:**
```
User types → Frontend → Backend → Gateway → Agent → Gateway → Backend → Frontend → User sees reply
```

**Voice message:**
```
User speaks → Browser STT → Frontend → Backend → Gateway → Agent → Gateway → Backend → Frontend → Browser TTS → User hears reply
```

---

## 📁 Project Structure

```
vie-web/
├── backend/                      # Express.js server
│   ├── src/
│   │   ├── server.js            # Main Express app, entry point
│   │   ├── services/
│   │   │   └── openclaw.js      # OpenClaw gateway proxy service
│   │   ├── middleware/
│   │   │   ├── auth.js          # Token authentication
│   │   │   └── rateLimit.js     # Rate limiting config
│   │   └── routes/
│   │       ├── health.js        # Health check endpoints
│   │       ├── chat.js          # Chat API endpoints
│   │       └── tts.js           # ElevenLabs TTS endpoints
│   ├── package.json             # Dependencies
│   ├── .env                     # Configuration (DO NOT COMMIT)
│   └── start.sh                 # Startup script
│
├── frontend/                     # Static web app (vanilla JS)
│   └── public/
│       ├── index.html           # Main HTML structure
│       ├── app.js               # Main app logic, chat interface
│       ├── avatar.js            # Psychedelic fractal avatar
│       ├── voice.js             # Voice input/output (STT/TTS)
│       └── styles.css           # Dark theme, animations
│
├── .audio-cache/                # ElevenLabs TTS audio cache (auto-created)
│
├── README.md                    # Project overview
├── USER_GUIDE.md               # End-user documentation
├── DEPLOYMENT.md               # Deployment instructions
├── DEVELOPER_GUIDE.md          # This file
├── TROUBLESHOOTING.md          # Common issues
├── API_REFERENCE.md            # API documentation
└── FEATURE_ROADMAP.md          # Future plans
```

---

## 🔧 Backend (Express.js)

### server.js - Main Entry Point

**Purpose:** Initialize Express app, configure middleware, define routes.

**Key sections:**
```javascript
// 1. Load environment config
require('dotenv').config();

// 2. Initialize services
const openclawService = new OpenClawService({...});

// 3. Configure middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(createRateLimiter());

// 4. Define routes
app.use('/health', healthRoutes);           // No auth
app.use('/api/chat', authMiddleware, chatRoutes);  // Auth required
app.use('/api/tts', authMiddleware, ttsRoutes);

// 5. Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// 6. Start server
app.listen(PORT, () => { ... });
```

**Startup checks:**
- Tests gateway connection on boot
- Logs available endpoints
- Shows config warnings

### services/openclaw.js - Gateway Proxy

**Purpose:** Abstracts OpenClaw gateway API calls.

**Key methods:**

```javascript
class OpenClawService {
  // Test connection to gateway
  async testConnection()

  // Send message, get full response
  async sendMessage(message)

  // Stream response (SSE) - for future use
  async streamMessage(message, onChunk)
}
```

**API format (OpenClaw Gateway):**

**Request:**
```json
{
  "model": "openclaw",
  "input": "User message text"
}
```

**Response:**
```json
{
  "output": [
    {
      "content": [
        {
          "type": "output_text",
          "text": "Agent response text"
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 123,
    "output_tokens": 456
  }
}
```

**Headers:**
```
Authorization: Bearer <gateway-token>
x-openclaw-agent-id: main
```

### middleware/auth.js - Authentication

**Purpose:** Verify web auth token on API requests.

**Flow:**
1. Check for token in header or query param
2. Compare with `WEB_AUTH_TOKEN` from .env
3. Allow or reject request

**Token sources (priority order):**
1. `x-web-auth-token` header
2. `Authorization: Bearer <token>` header
3. `?token=<token>` query param

### middleware/rateLimit.js - Rate Limiting

**Purpose:** Prevent API abuse.

**Config:**
```javascript
const rateLimit = require('express-rate-limit');

module.exports = () => rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,  // 1 minute
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,      // 100 requests
  message: { error: 'Too many requests...' }
});
```

### routes/chat.js - Chat Endpoints

**POST /api/chat/send** - Standard message
```javascript
{
  message: "User's message"
}
→
{
  success: true,
  reply: "Agent's response",
  usage: {...},
  timestamp: "2026-02-03T12:00:00.000Z"
}
```

**POST /api/chat/stream** - SSE streaming (future)
- Server-Sent Events for real-time streaming
- Not yet fully implemented

### routes/tts.js - Text-to-Speech

**GET /api/tts/voices** - List available voices
```javascript
{
  success: true,
  voices: [
    { key: "rachel", name: "Rachel", ... }
  ],
  apiKeyConfigured: true/false
}
```

**POST /api/tts/elevenlabs** - Generate speech
```javascript
{
  text: "Text to speak",
  voice_key: "rachel"  // or voice_id directly
}
→
Binary audio/mpeg data
```

**Caching:**
- MD5 hash of `voice_id:text` = cache key
- Cached in `.audio-cache/` directory
- 24-hour browser cache headers
- Reduces API calls and latency

---

## 🎨 Frontend (Vanilla JavaScript)

### index.html - Structure

**Minimal HTML:**
```html
<div id="root"></div>
<script src="avatar.js"></script>
<script src="voice.js"></script>
<script src="app.js"></script>
```

Everything else is rendered dynamically by `app.js`.

### app.js - Main Application

**Class structure:**
```javascript
class VieApp {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.avatar = null;
    this.voice = null;
    this.API_BASE = '/api';
    this.AUTH_TOKEN = '...';
  }

  // Lifecycle
  async init()          // Initialize app
  render()              // Render UI structure
  setupEventListeners() // Attach events

  // Messaging
  async sendMessage()   // Send message to backend
  addMessage(role, content)  // Add to UI
  setTyping(bool)       // Show/hide typing indicator

  // UI updates
  updateStatus(state)   // Update status line
  initAvatar()          // Create avatar
  initVoice()           // Create voice interface
}
```

**Message flow:**
1. User types/speaks → `sendMessage()`
2. `addMessage('user', text)` → add to UI
3. `setTyping(true)` → show typing indicator
4. `fetch('/api/chat/send')` → send to backend
5. `addMessage('assistant', reply)` → show response
6. `voice.speak(reply)` → TTS if enabled
7. `setTyping(false)` → hide indicator

### avatar.js - Psychedelic Avatar

**Class structure:**
```javascript
class VieAvatar {
  constructor(container) {
    this.canvas = ...;
    this.particles = [];  // Swarm particles
    this.fractalArms = [];  // Spiral arms
    this.time = 0;
  }

  // Core loop
  animate()             // RAF loop
  updateParticles()     // Update positions
  render()              // Draw to canvas

  // Effects
  getBreath()           // Breathing scale
  getBreathColor()      // Color cycling
  noise(x, y)           // Organic movement
  fractalSpiralValue()  // Field effects
}
```

**Visual effects:**
- **Particles:** Lissajous orbits + noise field
- **Spiral arms:** Recursive fractal patterns
- **Breathing:** Sin-wave scaling
- **Colors:** HSL cycling (purple → pink)
- **Trails:** Particle history with decay
- **Kaleidoscope:** Symmetrical folding

**Performance:**
- Canvas 2D (no WebGL needed)
- ~60 particles, 8 arms
- Optimized for mobile

### voice.js - Voice Interface

**Class structure:**
```javascript
class VieVoice {
  constructor(app) {
    this.app = app;
    this.recognition = null;      // Web Speech Recognition
    this.synthesis = window.speechSynthesis;  // TTS
    this.ttsMode = 'browser';     // or 'elevenlabs'
    this.ttsEnabled = false;
  }

  // Speech recognition (input)
  initRecognition()     // Setup Web Speech API
  startListening()      // Start capture
  stopListening()       // Stop capture
  sendTranscript()      // Send recognized text

  // Speech synthesis (output)
  speak(text)           // Speak using selected mode
  speakBrowser(text)    // Browser TTS
  speakElevenLabs(text) // ElevenLabs API
  stopSpeaking()        // Cancel speech

  // UI
  renderControls()      // HTML for controls
  attachEventListeners() // Button events
  updateVoiceUI()       // Visual feedback
}
```

**Browser support detection:**
```javascript
checkSupport() {
  const hasRecognition = 'webkitSpeechRecognition' in window;
  const hasSynthesis = 'speechSynthesis' in window;
  return hasRecognition && hasSynthesis;
}
```

**Push-to-talk implementation:**
```javascript
// Mouse: hold to speak, release to send
micBtn.addEventListener('mousedown', () => this.startListening());
micBtn.addEventListener('mouseup', () => this.stopListening());
micBtn.addEventListener('mouseleave', () => this.stopListening());

// Touch: same behavior for mobile
micBtn.addEventListener('touchstart', () => this.startListening());
micBtn.addEventListener('touchend', () => this.stopListening());
```

**ElevenLabs integration:**
```javascript
async speakElevenLabs(text) {
  // 1. Call backend /api/tts/elevenlabs
  const response = await fetch('/api/tts/elevenlabs', {
    method: 'POST',
    body: JSON.stringify({ text, voice_key: this.elevenLabsVoice })
  });

  // 2. Get audio blob
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  // 3. Play audio
  this.currentAudio = new Audio(audioUrl);
  await this.currentAudio.play();

  // 4. Cleanup
  this.currentAudio.onended = () => URL.revokeObjectURL(audioUrl);
}
```

---

## 🛠️ Adding New Features

### Adding a New API Endpoint

**1. Create route handler** (backend/src/routes/newfeature.js):
```javascript
const express = require('express');
const router = express.Router();

router.post('/action', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, result: ... });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**2. Register in server.js:**
```javascript
const newfeatureRoutes = require('./routes/newfeature');
app.use('/api/newfeature', authMiddleware, newfeatureRoutes);
```

**3. Call from frontend:**
```javascript
async callNewFeature() {
  const response = await fetch('/api/newfeature/action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-web-auth-token': this.AUTH_TOKEN
    },
    body: JSON.stringify({ data: ... })
  });
  const result = await response.json();
  return result;
}
```

### Adding a New Frontend Feature

**1. Add UI in app.js render():**
```javascript
render() {
  // ...existing UI...
  <button id="new-feature-btn">New Feature</button>
}
```

**2. Add event listener:**
```javascript
setupEventListeners() {
  // ...existing listeners...
  document.getElementById('new-feature-btn')
    .addEventListener('click', () => this.handleNewFeature());
}
```

**3. Implement handler:**
```javascript
async handleNewFeature() {
  // Your logic here
}
```

### Modifying the Avatar

**avatar.js is fully self-contained.**

**To change colors:**
```javascript
getBreathColor(alpha = 1, hueShift = 0) {
  const hue = (270 + hueShift + ...) % 360;  // Change base hue (270 = purple)
  // ...
}
```

**To add new particle behaviors:**
```javascript
updateParticles() {
  this.particles.forEach((p) => {
    // Add your custom movement logic
    p.x += Math.sin(this.time + p.phase) * 2;
    p.y += Math.cos(this.time + p.phase) * 2;
  });
}
```

**To change particle count:**
```javascript
this.config = {
  particleCount: 60,  // Change this
  breathCycle: 4,
  armCount: 8
};
```

---

## 🧪 Testing

### Manual Testing

**Backend:**
```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:3000/health/gateway

# Chat
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: your-token" \
  -d '{"message": "test"}'

# TTS
curl http://localhost:3000/api/tts/voices
```

**Frontend:**
- Open browser console (F12)
- Check for errors
- Test voice permissions
- Test on mobile

### Automated Testing (Future)

**Backend tests** (Jest or Mocha):
```javascript
describe('Chat API', () => {
  it('should send message and get reply', async () => {
    const response = await request(app)
      .post('/api/chat/send')
      .set('x-web-auth-token', TOKEN)
      .send({ message: 'test' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

**Frontend tests** (Playwright or Cypress):
```javascript
test('should send message', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('#message-input', 'Hello');
  await page.click('#send-button');
  await page.waitForSelector('.message.assistant');
});
```

---

## 🎯 Code Style Guidelines

### JavaScript

**Style:**
- Use modern ES6+ syntax
- Async/await over promises
- Clear variable names
- Comment complex logic

**Example:**
```javascript
// Good
async function getUserMessage(userId) {
  const user = await db.getUser(userId);
  return user.lastMessage;
}

// Avoid
function getUserMessage(userId, callback) {
  db.getUser(userId, (err, user) => {
    if (err) return callback(err);
    callback(null, user.lastMessage);
  });
}
```

### Error Handling

**Backend:**
```javascript
try {
  const result = await someOperation();
  res.json({ success: true, result });
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
}
```

**Frontend:**
```javascript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error('Request failed');
  const data = await response.json();
  // Handle data
} catch (error) {
  console.error('Error:', error);
  this.addMessage('assistant', `Error: ${error.message}`);
}
```

### Comments

**Document:**
- Complex algorithms
- API contracts
- Workarounds/hacks
- TODOs

**Example:**
```javascript
/**
 * Send message to OpenClaw gateway
 * @param {string} message - User's message text
 * @returns {Promise<Object>} Response object with reply and usage
 */
async sendMessage(message) {
  // Parse OpenResponses format (gateway returns nested structure)
  const replyText = data.output[0].content.find(p => p.type === 'output_text')?.text;
  return { reply: replyText, ... };
}
```

---

## 🐛 Debugging

### Backend Debugging

**Console logging:**
```javascript
console.log('Message received:', message);
console.error('Error:', error);
console.warn('Warning:', warning);
```

**Inspect requests:**
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Node debugger:**
```bash
node --inspect src/server.js
# Open chrome://inspect in Chrome
```

### Frontend Debugging

**Browser console:**
```javascript
console.log('App state:', this);
console.table(this.messages);
```

**Network tab:**
- Check API requests/responses
- Verify headers, payload
- Check timing

**Breakpoints:**
- Open DevTools → Sources
- Set breakpoints in code
- Step through execution

---

## 📦 Dependencies

### Backend

- **express** - Web framework
- **cors** - Cross-origin support
- **dotenv** - Environment config
- **express-rate-limit** - Rate limiting
- **node-fetch** - HTTP client (for gateway)

### Frontend

**Zero dependencies!** Pure vanilla JavaScript.

- Uses native Web APIs:
  - Fetch API
  - Web Speech API
  - Canvas API
  - Audio API

---

## 🔐 Security Considerations

### Token Authentication

**Current:** Simple token comparison
**Better:** JWT with expiration
**Production:** OAuth2 or session-based auth

### HTTPS

**Required for:**
- Voice input (Web Speech API)
- Secure cookie auth
- Production deployment

### Environment Variables

**Never commit .env to git!**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

### Input Validation

**Always validate:**
- Message length
- Content type
- Token format
- File uploads (if added)

---

## 🚀 Performance Optimization

### Backend

**Caching:**
- ElevenLabs audio cached locally
- Add Redis for session caching
- HTTP cache headers

**Rate limiting:**
- Prevents abuse
- Protects gateway

**Connection pooling:**
- Reuse HTTP connections
- Consider keep-alive

### Frontend

**Avatar performance:**
- 60 particles (not 1000)
- Canvas 2D (not WebGL)
- Limited trail history

**Voice optimization:**
- Cache transcriptions
- Reuse audio elements
- Clear old blob URLs

---

## 📚 Useful Resources

**Web Speech API:**
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

**ElevenLabs API:**
- https://docs.elevenlabs.io/api-reference

**Express.js:**
- https://expressjs.com/

**Canvas API:**
- https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

## 🤝 Contributing

**To contribute:**
1. Fork the project
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

**Code review checklist:**
- [ ] Code follows style guide
- [ ] No sensitive data in code
- [ ] Error handling added
- [ ] Comments for complex logic
- [ ] Tested manually
- [ ] No console.logs in production code

---

## 🎓 Learning Path

**New to the project?**

1. ✅ Read README.md - Overview
2. ✅ Read USER_GUIDE.md - How it works
3. ✅ Read this DEVELOPER_GUIDE.md - Architecture
4. ✅ Read API_REFERENCE.md - API details
5. ✅ Explore code in order:
   - backend/src/server.js
   - backend/src/services/openclaw.js
   - backend/src/routes/chat.js
   - frontend/public/app.js
   - frontend/public/voice.js
   - frontend/public/avatar.js
6. ✅ Make a small change
7. ✅ Test it
8. ✅ Understand the flow

---

*Happy coding! Build something beautiful. 💜*
