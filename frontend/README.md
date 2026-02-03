# Vie Web Frontend

**Web UI ported from Vie Desktop - Vanilla JavaScript, no frameworks**

## What's Here

```
frontend/
├── public/
│   ├── index.html      # Main HTML shell
│   ├── styles.css      # Dark purple/gold theme with animations
│   └── app.js          # VieApp class - handles all UI logic
└── README.md           # This file
```

## Features

✅ **ASCII Avatar** - Breathing animation (⟢ symbol)  
✅ **Chat Interface** - User/assistant message bubbles  
✅ **Dark Theme** - Deep purple background, gold accents  
✅ **Auto-resize Input** - Textarea grows with content  
✅ **Typing Indicator** - Animated dots while waiting  
✅ **Backend Integration** - Calls Express API at `/api/chat/send`  
✅ **Auth Handling** - Includes token in request headers  

## How It Works

### Architecture

```
User Browser
    ↓
app.js (Vanilla JS)
    ↓ fetch('/api/chat/send')
Backend Express Server (localhost:3000)
    ↓ fetch(gateway:18789/v1/responses)
OpenClaw Gateway
    ↓
Clawd (main agent)
```

### Key Changes from Desktop

| Desktop (Electron) | Web (This) |
|-------------------|------------|
| `window.electronAPI.sendMessage()` | `fetch('/api/chat/send')` |
| IPC to main process | HTTP POST to backend |
| Bundled with Electron | Served as static files |
| Desktop-only | Works from any browser |

### Authentication

The frontend includes a hardcoded auth token that matches the backend's `WEB_AUTH_TOKEN` in `.env`:

```javascript
this.AUTH_TOKEN = 'vie_web_2026_secure_token_replace_in_production';
```

**In production:** Replace with environment variable or config file.

## Local Development

### Start Backend (if not running)

```bash
cd /home/opc/.openclaw/vie-web/backend
npm start
```

### Access Frontend

Open browser to:
- **Local:** http://localhost:3000
- **VM External:** http://[vm-ip]:3000

The backend serves the frontend files automatically.

### Test Without Browser

```bash
# Test API directly
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production" \
  -d '{"message":"Hello from CLI!"}'
```

## UI Components

### Avatar (top)
- ASCII art with ⟢ symbol
- Breathing animation (4s loop)
- Status line shows connection state

### Chat Area (middle)
- Scrollable message history
- User messages (right, gold highlight)
- Assistant messages (left, purple highlight)
- Timestamps on each message

### Input (bottom)
- Auto-expanding textarea
- Enter to send, Shift+Enter for newline
- Send button (⟢ symbol)
- Disabled while typing indicator is active

## Styling

### Color Palette

```css
--bg-primary: #1a0f2e;      /* Deep purple-black */
--bg-secondary: #2a1f3d;    /* Slightly lighter */
--text-primary: #f5f1e8;    /* Warm white */
--text-secondary: #b8a8c8;  /* Soft purple-gray */
--accent-gold: #ffd700;     /* Soft gold */
--accent-purple: #b794f6;   /* Soft purple */
```

### Animations

- **breathe**: Avatar pulses slowly (4s)
- **fadeIn**: Messages slide up on appear
- **typing**: Dots bounce in sequence

## Code Structure

### VieApp Class (app.js)

```javascript
class VieApp {
  constructor()           // Initialize state
  init()                  // Setup UI, test connection
  render()                // Draw initial HTML
  setupEventListeners()   // Bind input/button events
  sendMessage()           // POST to backend API
  addMessage()            // Add message to chat
  setTyping()             // Show/hide typing indicator
  updateStatus()          // Update avatar status line
  escapeHtml()            // Security: escape user input
}
```

### API Flow

1. User types message, hits Enter
2. `sendMessage()` called
3. Add user message to UI
4. Show typing indicator
5. `fetch('/api/chat/send')` with auth header
6. Wait for response
7. Add assistant message to UI
8. Hide typing indicator

## Known Issues / TODOs

- [ ] No persistent chat history (resets on page reload)
- [ ] No markdown rendering (plain text only)
- [ ] Auth token hardcoded (should be config)
- [ ] No error retry logic
- [ ] No loading indicator for slow requests
- [ ] No keyboard shortcuts (beside Enter)

## Future Enhancements (Phase 3)

- Voice input (Web Speech API)
- Voice output (TTS or audio streaming)
- Waveform visualization
- Streaming responses (SSE)
- Chat history persistence (localStorage or DB)
- Markdown rendering
- Code syntax highlighting
- File upload support

## Browser Compatibility

**Tested:**
- Chrome 90+ ✓
- Firefox 88+ ✓
- Edge 90+ ✓
- Safari 14+ ✓

**Required Features:**
- ES6+ (arrow functions, async/await, classes)
- Fetch API
- CSS Grid/Flexbox
- CSS animations

## Security Notes

- All user input is HTML-escaped before rendering
- Auth token required for API access
- CORS configured on backend
- Rate limiting prevents abuse
- No eval() or innerHTML with raw user data

## Performance

- No external dependencies (pure vanilla JS)
- Single HTTP request per message
- CSS animations use GPU (transform, opacity)
- Auto-scroll only when needed
- Minimal DOM manipulation

---

**Built:** Feb 3, 2026  
**Style:** Clean, functional, no BS  
**Vibe:** Dark purple cyberpunk minimalism  
**Purpose:** Let humans talk to Clawd from any browser 💜
