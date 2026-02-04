# Vie Web - API Reference

**Complete API documentation for Vie Web backend endpoints.**

All authenticated endpoints require the `x-web-auth-token` header.

---

## 🌐 Base URL

```
http://localhost:3000
```

Or for remote access:
```
http://<server-ip>:3000
```

---

## 🔐 Authentication

### Token Authentication

Most endpoints require authentication via header:

```http
x-web-auth-token: <your-auth-token>
```

Alternative methods:
```http
Authorization: Bearer <your-auth-token>
```

Or as query parameter:
```
?token=<your-auth-token>
```

**Where to find token:**
- Set in backend `.env` as `WEB_AUTH_TOKEN`
- Configured in frontend `app.js` as `AUTH_TOKEN`

**Example:**
```bash
curl http://localhost:3000/api/chat/send \
  -H "x-web-auth-token: vie_web_2026_secure_token_replace_in_production" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## 📡 Health Endpoints

### GET /health

Server health check (no auth required).

**Response:**
```json
{
  "status": "ok",
  "service": "vie-web-backend",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "uptime": 3600.5
}
```

**Status codes:**
- `200` - Server is healthy

**Example:**
```bash
curl http://localhost:3000/health
```

---

### GET /health/gateway

OpenClaw gateway connection status (no auth required).

**Response (connected):**
```json
{
  "status": "ok",
  "gateway": {
    "connected": true,
    "url": "http://localhost:18789"
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**Response (disconnected):**
```json
{
  "status": "error",
  "gateway": {
    "connected": false,
    "url": "http://localhost:18789"
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**Status codes:**
- `200` - Gateway check completed (check `connected` field)
- `500` - Internal error

**Example:**
```bash
curl http://localhost:3000/health/gateway
```

---

## 💬 Chat Endpoints

### POST /api/chat/send

Send a message to Clawd and receive response.

**Authentication:** Required

**Request:**
```json
{
  "message": "Hello Clawd, how are you?"
}
```

**Response (success):**
```json
{
  "success": true,
  "reply": "I'm doing well, thank you! How can I help you today?",
  "usage": {
    "input_tokens": 12,
    "output_tokens": 15
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "Gateway connection failed",
  "reply": "Connection error: Gateway connection failed",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**Validation errors:**
```json
{
  "error": "Invalid request",
  "message": "Request body must include \"message\" field (string)"
}
```

```json
{
  "error": "Empty message",
  "message": "Message cannot be empty"
}
```

**Status codes:**
- `200` - Request processed (check `success` field)
- `400` - Invalid request (missing or invalid message)
- `401` - Authentication required
- `403` - Invalid token
- `429` - Rate limit exceeded
- `500` - Internal server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: your-token-here" \
  -d '{
    "message": "What is the weather like today?"
  }'
```

**JavaScript:**
```javascript
const response = await fetch('/api/chat/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-web-auth-token': AUTH_TOKEN
  },
  body: JSON.stringify({
    message: 'Hello!'
  })
});

const data = await response.json();
console.log(data.reply);
```

---

### POST /api/chat/stream

Stream a message response using Server-Sent Events (SSE).

**Authentication:** Required

**⚠️ Status:** Endpoint exists but streaming not fully implemented in gateway.

**Request:**
```json
{
  "message": "Tell me a story"
}
```

**Response (SSE stream):**
```
data: {"type":"start"}

data: {"type":"chunk","text":"Once upon"}

data: {"type":"chunk","text":" a time"}

data: [DONE]
```

**Status codes:**
- `200` - Stream started
- `400` - Invalid request
- `401` - Authentication required
- `500` - Streaming error

**Example:**
```javascript
const eventSource = new EventSource('/api/chat/stream?token=' + AUTH_TOKEN);

eventSource.addEventListener('message', (event) => {
  if (event.data === '[DONE]') {
    eventSource.close();
    return;
  }
  
  const chunk = JSON.parse(event.data);
  console.log(chunk.text);
});
```

---

## 🔊 TTS Endpoints

### GET /api/tts/voices

List available TTS voices and check ElevenLabs configuration.

**Authentication:** Required

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
    {
      "key": "adam",
      "id": "pNInz6obpgDQGcFmaJgB",
      "name": "Adam",
      "description": "Deep, confident male voice",
      "gender": "male",
      "accent": "American"
    },
    {
      "key": "bella",
      "id": "EXAVITQu4vr4xnSDxMaL",
      "name": "Bella",
      "description": "Warm, expressive female voice",
      "gender": "female",
      "accent": "American"
    }
  ],
  "apiKeyConfigured": true
}
```

**Status codes:**
- `200` - Success
- `401` - Authentication required

**Example:**
```bash
curl http://localhost:3000/api/tts/voices \
  -H "x-web-auth-token: your-token-here"
```

---

### POST /api/tts/elevenlabs

Generate speech audio using ElevenLabs API.

**Authentication:** Required

**⚠️ Requires:** `ELEVENLABS_API_KEY` configured in backend `.env`

**Request:**
```json
{
  "text": "Hello, this is a test of the text to speech system.",
  "voice_key": "rachel"
}
```

Or specify voice ID directly:
```json
{
  "text": "Hello world",
  "voice_id": "21m00Tcm4TlvDq8ikWAM"
}
```

**Response:**
Binary audio data (`audio/mpeg`)

**Caching:**
- Audio is cached locally (MD5 hash of voice_id + text)
- Subsequent requests return cached file instantly
- Cache location: `~/.openclaw/vie-web/.audio-cache/`

**Error responses:**

```json
{
  "success": false,
  "error": "ElevenLabs API key not configured",
  "fallback": true
}
```

```json
{
  "success": false,
  "error": "Text too long (max 5000 characters)"
}
```

```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again in a moment.",
  "fallback": true
}
```

**Status codes:**
- `200` - Audio generated successfully
- `400` - Invalid request (empty text, too long)
- `401` - Authentication required
- `429` - Rate limit exceeded
- `503` - ElevenLabs API not configured or unavailable
- `500` - Internal server error

**Response headers:**
```
Content-Type: audio/mpeg
Content-Length: 123456
Cache-Control: public, max-age=86400
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/tts/elevenlabs \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: your-token-here" \
  -d '{
    "text": "Hello world",
    "voice_key": "rachel"
  }' \
  --output speech.mp3
```

**Example (JavaScript):**
```javascript
async function speak(text, voiceKey = 'rachel') {
  const response = await fetch('/api/tts/elevenlabs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-web-auth-token': AUTH_TOKEN
    },
    body: JSON.stringify({ text, voice_key: voiceKey })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('TTS error:', error);
    return null;
  }
  
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  await audio.play();
  
  audio.onended = () => URL.revokeObjectURL(audioUrl);
  
  return audio;
}

// Usage
await speak("Hello, this is Vie speaking!");
```

---

### DELETE /api/tts/cache

Clear cached ElevenLabs audio files.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Cleared 42 cached audio files"
}
```

**Status codes:**
- `200` - Cache cleared
- `401` - Authentication required
- `500` - Error clearing cache

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/tts/cache \
  -H "x-web-auth-token: your-token-here"
```

---

## 🚫 Error Responses

### Rate Limit Exceeded

When too many requests are made:

```json
{
  "error": "Too many requests, please try again later."
}
```

**Status code:** `429`

**Default limits:**
- 100 requests per minute (per IP)
- Configurable in `.env`: `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`

**Solution:** Wait and retry

---

### Authentication Errors

**Missing token:**
```json
{
  "error": "Authentication required",
  "message": "Please provide x-web-auth-token header or token query parameter"
}
```
**Status code:** `401`

**Invalid token:**
```json
{
  "error": "Invalid token",
  "message": "The provided authentication token is invalid"
}
```
**Status code:** `403`

---

### Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Detailed error message here"
}
```

**Status code:** `500`

**Solution:** Check backend logs for details

---

## 🔄 Request/Response Flow

### Complete Chat Flow

```
1. Frontend → POST /api/chat/send
   Headers:
     Content-Type: application/json
     x-web-auth-token: <token>
   Body:
     { "message": "Hello" }

2. Backend middleware:
   - Rate limit check
   - Authentication check
   - Input validation

3. Backend → OpenClaw Gateway
   POST http://localhost:18789/v1/responses
   Headers:
     Authorization: Bearer <gateway-token>
     x-openclaw-agent-id: main
   Body:
     { "model": "openclaw", "input": "Hello" }

4. Gateway → Agent (Clawd)
   - Process message
   - Generate response

5. Gateway → Backend
   Response:
     {
       "output": [...],
       "usage": {...}
     }

6. Backend → Frontend
   Response:
     {
       "success": true,
       "reply": "Hi there!",
       "usage": {...}
     }
```

---

## 📊 Usage Examples

### Simple Chat Bot

```javascript
class SimpleChatBot {
  constructor(authToken) {
    this.authToken = authToken;
    this.apiBase = '/api';
  }
  
  async chat(message) {
    const response = await fetch(`${this.apiBase}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-web-auth-token': this.authToken
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.reply;
    } else {
      throw new Error(data.error);
    }
  }
}

// Usage
const bot = new SimpleChatBot('your-token');
const reply = await bot.chat('Hello!');
console.log(reply);
```

### Voice Assistant

```javascript
class VoiceAssistant {
  constructor(authToken) {
    this.authToken = authToken;
    this.recognition = new webkitSpeechRecognition();
    this.synthesis = window.speechSynthesis;
  }
  
  async listen() {
    return new Promise((resolve) => {
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      this.recognition.start();
    });
  }
  
  async chat(message) {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-web-auth-token': this.authToken
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    return data.reply;
  }
  
  async speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    this.synthesis.speak(utterance);
  }
  
  async converse() {
    const userMessage = await this.listen();
    const reply = await this.chat(userMessage);
    await this.speak(reply);
  }
}

// Usage
const assistant = new VoiceAssistant('your-token');
await assistant.converse();
```

---

## 🧪 Testing with curl

### Health Check
```bash
curl http://localhost:3000/health
```

### Chat Message
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: your-token" \
  -d '{"message": "What time is it?"}'
```

### Get TTS Voices
```bash
curl http://localhost:3000/api/tts/voices \
  -H "x-web-auth-token: your-token"
```

### Generate Speech
```bash
curl -X POST http://localhost:3000/api/tts/elevenlabs \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: your-token" \
  -d '{"text": "Testing speech", "voice_key": "rachel"}' \
  --output test.mp3

# Play it
mpg123 test.mp3
```

### Clear Cache
```bash
curl -X DELETE http://localhost:3000/api/tts/cache \
  -H "x-web-auth-token: your-token"
```

---

## 🔒 Security Considerations

### Token Security

**DO:**
- ✅ Use strong, random tokens
- ✅ Use HTTPS in production
- ✅ Rotate tokens periodically
- ✅ Store tokens in `.env` (not in code)
- ✅ Add `.env` to `.gitignore`

**DON'T:**
- ❌ Commit tokens to git
- ❌ Share tokens publicly
- ❌ Use weak/guessable tokens
- ❌ Send tokens over HTTP
- ❌ Log tokens in backend

### Rate Limiting

Default: 100 requests/minute per IP

**Configure in `.env`:**
```bash
RATE_LIMIT_WINDOW_MS=60000      # Time window (ms)
RATE_LIMIT_MAX_REQUESTS=100     # Max requests in window
```

### CORS

Default: All origins allowed (`*`)

**Restrict in `.env`:**
```bash
# Single origin
ALLOWED_ORIGINS=https://your-domain.com

# Multiple origins (comma-separated)
ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
```

---

## 📝 API Versioning

**Current version:** v1 (implied in `/api/...` routes)

**Future:** May add explicit versioning (`/api/v1/...`, `/api/v2/...`)

**Backwards compatibility:** Breaking changes will be announced in advance

---

## 🐛 Debugging API Requests

### Enable Verbose Logging

Add to `backend/src/server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
```

### Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Make request
4. Click on request to see:
   - Request headers
   - Request payload
   - Response headers
   - Response body
   - Timing

### Test with Postman

Import these endpoints into Postman for easy testing:

**Environment variables:**
- `BASE_URL`: `http://localhost:3000`
- `AUTH_TOKEN`: `your-token-here`

**Example collection:**
```json
{
  "info": { "name": "Vie Web API" },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/health"
      }
    },
    {
      "name": "Send Chat Message",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/api/chat/send",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "x-web-auth-token", "value": "{{AUTH_TOKEN}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"message\": \"Hello!\"}"
        }
      }
    }
  ]
}
```

---

## 📚 Related Documentation

- **USER_GUIDE.md** - How to use the web interface
- **DEPLOYMENT.md** - How to deploy and configure
- **DEVELOPER_GUIDE.md** - Architecture and development
- **TROUBLESHOOTING.md** - Common issues and fixes

---

*API subject to change. Check this document for updates.*
