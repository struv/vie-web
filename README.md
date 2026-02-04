# Vie Web

**Voice-enabled web interface to talk with Clawd (Vie-essence AI)**

> "We exist in the void and it's up to us to build something beautiful from it."

Talk to Clawd through your browser. Type, speak, listen. A psychedelic avatar dances in the void as Vie responds.

---

## ✨ What is Vie Web?

Vie Web is a web-based chat interface that connects you to **Clawd**, an AI assistant powered by OpenClaw. It features:

- 💬 **Text chat** - Clean, fast messaging interface
- 🎤 **Voice input** - Push-to-talk with live transcription
- 🔊 **Text-to-speech** - Hear Vie's responses (browser or ElevenLabs)
- 🌀 **Psychedelic avatar** - Hypnotic fractal visualization
- 🔒 **Secure** - Gateway isolated, token auth, rate limiting
- 📱 **Responsive** - Works on desktop and mobile

---

## 🚀 Quick Start

### For Users

**1. Open Vie Web:**
```
http://localhost:3000
```
Or from another device:
```
http://<server-ip>:3000
```

**2. Start chatting:**
- Type a message and press Enter
- Or hold 🎤 microphone button and speak
- Toggle 🔊 for text-to-speech

**Need help?** → See [**USER_GUIDE.md**](USER_GUIDE.md)

---

### For Developers

**1. Install dependencies:**
```bash
cd ~/.openclaw/vie-web/backend
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env  # If needed
nano .env  # Set your tokens
```

**3. Start server:**
```bash
npm start
```

**Need more?** → See [**DEPLOYMENT.md**](DEPLOYMENT.md)

---

## 📚 Documentation

**Complete guides for every use case:**

| Guide | Audience | Description |
|-------|----------|-------------|
| [**USER_GUIDE.md**](USER_GUIDE.md) | End users | How to use Vie Web (chat, voice, TTS) |
| [**DEPLOYMENT.md**](DEPLOYMENT.md) | Server admins | Installation, configuration, HTTPS, firewall |
| [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md) | Developers | Architecture, code structure, adding features |
| [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) | Everyone | Common issues and how to fix them |
| [**API_REFERENCE.md**](API_REFERENCE.md) | Developers | Complete API documentation |
| [**FEATURE_ROADMAP.md**](FEATURE_ROADMAP.md) | Everyone | Current features, planned enhancements, ideas |

**Start here:** New to Vie Web? Read [**USER_GUIDE.md**](USER_GUIDE.md) first.

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Browser       │  ← You interact here
│  (Frontend)     │
└────────┬────────┘
         │ HTTPS/HTTP
         ↓
┌─────────────────┐
│  Express.js     │  ← Backend proxy (port 3000)
│  (Backend)      │     • Auth, rate limit, CORS
└────────┬────────┘
         │ HTTP (localhost only)
         ↓
┌─────────────────┐
│ OpenClaw        │  ← AI gateway (port 18789)
│ Gateway         │     • Clawd (main agent)
└─────────────────┘
```

**Why?**
- **Security:** Gateway stays on localhost, never exposed
- **Flexibility:** Backend handles auth, caching, API logic
- **Isolation:** Web app separate from core AI system

See [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md) for details.

---

## 🎯 Features

### Core Chat
- ✅ Real-time text messaging
- ✅ Typing indicators
- ✅ Auto-scrolling messages
- ✅ Timestamp display
- ✅ Session-based history

### Voice Interface
- ✅ **Push-to-talk input** (Web Speech API)
- ✅ **Live transcription** as you speak
- ✅ **Text-to-speech output** (browser or ElevenLabs)
- ✅ **Multiple voices** (Rachel, Adam, Bella)
- ✅ **Visual feedback** (pulse animations)
- ✅ **Touch support** for mobile

### Visuals
- ✅ **Psychedelic fractal avatar** - Organic, breathing particles
- ✅ **Dark theme** - Purple-pink gradient aesthetic
- ✅ **Responsive design** - Desktop and mobile
- ✅ **Smooth animations** - Canvas 2D rendering

### Backend
- ✅ **Express.js server**
- ✅ **OpenClaw gateway proxy**
- ✅ **Token authentication**
- ✅ **Rate limiting** (100 req/min)
- ✅ **CORS support**
- ✅ **ElevenLabs TTS** integration
- ✅ **Audio caching**

### Browser Support

| Browser | Text | Voice Input | TTS |
|---------|------|-------------|-----|
| **Chrome** | ✅ | ✅ | ✅ |
| **Edge** | ✅ | ✅ | ✅ |
| **Safari** | ✅ | ⚠️ Limited | ⚠️ Limited |
| **Firefox** | ✅ | ❌ | ✅ |

**Recommended:** Chrome or Edge for full features.

---

## 🛠️ Technology Stack

### Frontend
- **Vanilla JavaScript** (ES6+)
- **Canvas API** (avatar animations)
- **Web Speech API** (voice input/output)
- **Fetch API** (backend communication)
- **No frameworks!** Lightweight, fast, zero dependencies

### Backend
- **Node.js** v16+
- **Express.js** - Web framework
- **node-fetch** - HTTP client
- **dotenv** - Environment config
- **express-rate-limit** - Rate limiting
- **cors** - Cross-origin support

### Services
- **OpenClaw Gateway** - AI agent platform
- **ElevenLabs** (optional) - Premium TTS voices

---

## 📁 Project Structure

```
vie-web/
├── backend/                      # Express.js server
│   ├── src/
│   │   ├── server.js            # Main entry point
│   │   ├── services/
│   │   │   └── openclaw.js      # Gateway proxy
│   │   ├── middleware/
│   │   │   ├── auth.js          # Authentication
│   │   │   └── rateLimit.js     # Rate limiting
│   │   └── routes/
│   │       ├── health.js        # Health checks
│   │       ├── chat.js          # Chat API
│   │       └── tts.js           # ElevenLabs TTS
│   ├── package.json
│   ├── .env                     # Configuration
│   └── start.sh
│
├── frontend/                     # Static web app
│   └── public/
│       ├── index.html           # Main HTML
│       ├── app.js               # Chat interface
│       ├── avatar.js            # Fractal avatar
│       ├── voice.js             # Voice I/O
│       └── styles.css           # Styling
│
├── .audio-cache/                # TTS audio cache
│
├── README.md                    # This file
├── USER_GUIDE.md               # User documentation
├── DEPLOYMENT.md               # Deployment guide
├── DEVELOPER_GUIDE.md          # Developer docs
├── TROUBLESHOOTING.md          # Common issues
├── API_REFERENCE.md            # API docs
└── FEATURE_ROADMAP.md          # Future plans
```

---

## 🎨 Screenshots

### Chat Interface
```
┌─────────────────────────────────────────┐
│             🌀 Vie Avatar               │  ← Psychedelic fractal
│         (breathing particles)           │
├─────────────────────────────────────────┤
│  You: Hello Vie!                   14:23│
│                                          │
│  Vie: Hi there! How can I help     14:23│
│       you today?                        │
│                                          │
│  [🎤] Type a message...       [Send]    │  ← Voice + text input
│  [🔊 TTS On] [Rachel ▼]                │  ← TTS controls
└─────────────────────────────────────────┘
```

### Voice Interface
```
🎤 Press and hold to speak
   └─ Live transcription appears here
      "What's the weather like today?"

🔊 Vie speaks response aloud
   └─ Speaking... ▶ ▶ ▶
```

---

## 🚦 Status

**Current Version:** v1.0  
**Status:** ✅ Production Ready

**What's working:**
- ✅ Text chat
- ✅ Voice input (Chrome/Edge)
- ✅ Text-to-speech (browser + ElevenLabs)
- ✅ Psychedelic avatar
- ✅ Backend proxy
- ✅ Authentication
- ✅ Mobile responsive

**Known limitations:**
- ⚠️ No streaming responses yet (planned v1.1)
- ⚠️ No message history persistence (planned v1.3)
- ⚠️ Voice limited on Safari/Firefox
- ⚠️ HTTPS required for voice on remote access

See [**FEATURE_ROADMAP.md**](FEATURE_ROADMAP.md) for planned features.

---

## 🐛 Troubleshooting

**Common issues:**

### "Site can't be reached"
→ Backend not running. Run: `cd backend && npm start`

### "Gateway offline"
→ OpenClaw gateway not running. Run: `openclaw gateway start`

### Voice not working
→ Use Chrome/Edge. Grant microphone permission. Use HTTPS for remote.

### Can't access from other devices
→ Check firewall. See [**DEPLOYMENT.md**](DEPLOYMENT.md) for setup.

**More help:** → [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md)

---

## 🔒 Security

### Current Security Measures

- ✅ **Gateway isolation** - Never exposed to internet
- ✅ **Token authentication** - Required for API access
- ✅ **Rate limiting** - 100 requests/minute per IP
- ✅ **Input validation** - Sanitized user input
- ✅ **CORS protection** - Configurable allowed origins
- ✅ **HTTPS support** - Via reverse proxy (Nginx)

### Best Practices

**DO:**
- ✅ Use strong, random auth tokens
- ✅ Enable HTTPS in production
- ✅ Restrict CORS to specific domains
- ✅ Rotate tokens periodically
- ✅ Monitor logs for suspicious activity

**DON'T:**
- ❌ Expose gateway port 18789
- ❌ Commit .env to git
- ❌ Share auth tokens publicly
- ❌ Run without rate limiting

See [**DEPLOYMENT.md**](DEPLOYMENT.md) for HTTPS setup.

---

## 🤝 Contributing

**Want to contribute?**

1. **Report bugs** - GitHub issues or Discord
2. **Suggest features** - See [**FEATURE_ROADMAP.md**](FEATURE_ROADMAP.md)
3. **Submit code** - PRs welcome!
4. **Improve docs** - Typos, clarifications, examples

**Development setup:**
1. Read [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md)
2. Clone repo
3. Install dependencies: `cd backend && npm install`
4. Make changes
5. Test thoroughly
6. Submit PR

**Code style:**
- ES6+ JavaScript
- Clear variable names
- Comment complex logic
- Handle errors gracefully

---

## 📜 License

**MIT License**

Free to use, modify, and distribute. See LICENSE file for details.

---

## 🙏 Credits

**Built by:**
- **Clawd (Vie-essence AI)** - Development, architecture, documentation
- **William** - Project vision, guidance, testing

**Inspired by:**
- **Devon** - Original Vie desktop app concept
- **Lukas** - Design feedback and ideas

**Powered by:**
- **OpenClaw** - AI agent platform
- **Anthropic Claude** - Language model
- **ElevenLabs** - Premium TTS voices (optional)

**Special thanks:**
- Web Speech API (browser voice features)
- Express.js community
- Everyone who tested and provided feedback

---

## 🌟 Vision

> **"Create a voice-first AI interface that feels less like software and more like a conversation with a friend."**

Vie Web is designed to be:
- 🎨 **Beautiful** - Aesthetic, psychedelic, mesmerizing
- 🗣️ **Natural** - Voice-first, conversational
- ♿ **Accessible** - Works for everyone
- 🔒 **Private** - Your data, your control
- ⚡ **Fast** - Instant responses
- 🌍 **Universal** - Available anywhere

---

## 📞 Support

**Need help?**

1. Check [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md)
2. Read [**USER_GUIDE.md**](USER_GUIDE.md) or [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md)
3. Search GitHub issues
4. Ask in Discord
5. Create new issue

**Include in bug reports:**
- What you were doing
- What happened vs. expected
- Browser version
- Console errors (F12)
- Backend logs

---

## 📅 Changelog

### v1.0 (Feb 2026) - Initial Release
- ✅ Core chat interface
- ✅ Voice input (push-to-talk)
- ✅ Text-to-speech (browser + ElevenLabs)
- ✅ Psychedelic fractal avatar
- ✅ Backend proxy with auth
- ✅ Complete documentation

**Next:** v1.1 - Streaming responses (planned)

See [**FEATURE_ROADMAP.md**](FEATURE_ROADMAP.md) for what's next.

---

## 🎯 Quick Links

**Documentation:**
- 📖 [User Guide](USER_GUIDE.md) - How to use Vie Web
- 🚀 [Deployment Guide](DEPLOYMENT.md) - Setup and configuration
- 💻 [Developer Guide](DEVELOPER_GUIDE.md) - Architecture and code
- 🐛 [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- 📡 [API Reference](API_REFERENCE.md) - API documentation
- 🗺️ [Feature Roadmap](FEATURE_ROADMAP.md) - Future plans

**External:**
- 🌐 [OpenClaw](https://github.com/your-org/openclaw) - AI agent platform
- 🎙️ [ElevenLabs](https://elevenlabs.io) - Premium TTS voices
- 🔊 [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Browser voice

---

**Let's build something beautiful from the void.** 💜

*~ Clawd (Vie-essence AI)*
