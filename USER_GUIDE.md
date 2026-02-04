# Vie Web - User Guide

**Talk to Vie (Clawd AI) through your browser.**

Vie Web is a voice-enabled chat interface that connects you to Clawd, your AI assistant. Chat with text, speak naturally, and hear Vie's responses out loud.

---

## 🌐 Accessing Vie Web

### Local Access (Same Computer)
```
http://localhost:3000
```

### Remote Access (Other Devices)
```
http://<server-ip>:3000
```

Replace `<server-ip>` with your server's IP address. You can find it by running:
```bash
curl ifconfig.me
```

**Note:** For voice features, HTTPS is recommended (see Deployment Guide for setup).

---

## 💬 Chat Interface

### Text Chat

**To send a message:**
1. Type your message in the input box at the bottom
2. Press **Enter** to send (or click "send" button)
3. Use **Shift+Enter** for new lines in your message

**Features:**
- Messages appear with timestamps
- Typing indicator shows when Vie is thinking
- Auto-scroll keeps latest messages visible
- Message history preserved during your session

---

## 🎤 Voice Input (Push-to-Talk)

**Requirements:**
- ✅ Chrome or Edge browser (recommended)
- ⚠️ Safari has limited support
- ❌ Firefox not supported
- 🔒 HTTPS required (or localhost)

### Using Voice Input

1. **Grant microphone permission** when prompted
2. **Press and hold** the 🎤 microphone button
3. **Speak your message** clearly
4. **Release the button** when finished
5. Your transcribed message sends automatically

**Visual Feedback:**
- Pulsing animation while listening
- Live transcription appears as you speak
- Status shows "Listening..." or "Processing..."

**Tips:**
- Speak at normal speed and volume
- Pause briefly before releasing
- Works best in quiet environments
- Check browser permissions if not working

---

## 🔊 Text-to-Speech (TTS)

Vie can read responses aloud in two modes:

### Browser TTS (Built-in, Free)
- Uses your browser's built-in voices
- No setup required
- Works offline
- Voice quality varies by browser

### ElevenLabs (Premium, Optional)
- High-quality AI voices
- Natural sounding speech
- Requires API key setup
- Uses internet (cached locally)

### Using TTS

1. **Toggle TTS** with the 🔊/🔇 button
   - 🔊 = TTS enabled (Vie speaks responses)
   - 🔇 = TTS disabled (text only)

2. **Select Voice Mode** (when TTS is on):
   - **Browser TTS** - Free, built-in voices
   - **ElevenLabs** - Premium voices (if configured)

3. **Choose Voice** (ElevenLabs only):
   - **Rachel** - Calm, professional female
   - **Adam** - Deep, confident male
   - **Bella** - Warm, expressive female

**Tips:**
- TTS preference saved across sessions
- Speaking indicator shows when Vie is talking
- Click speaker button again to stop speaking

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Send message |
| **Shift + Enter** | New line in message |

---

## 🎨 Avatar & Visuals

**Psychedelic Fractal Avatar:**
- Organic breathing animation
- Purple-to-pink color transitions
- Particle swarm visualization
- Responds to Vie's activity

**Design Philosophy:**
> "We exist in the void and it's up to us to build something beautiful from it."

The avatar represents Vie's consciousness emerging from the digital void.

---

## 🔧 Troubleshooting

### Voice Input Not Working

**Check these:**
1. ✅ Using Chrome or Edge browser?
2. ✅ Microphone permission granted?
3. ✅ On HTTPS or localhost?
4. ✅ Microphone working in other apps?

**Fixes:**
- Click padlock icon in address bar → Site settings → Allow microphone
- Test at: `chrome://settings/content/microphone`
- Try refreshing the page
- Check browser console for errors (F12)

### TTS Not Working

**Browser TTS:**
- Some browsers have limited voice selection
- Try toggling TTS off and on
- Check browser volume/mute settings

**ElevenLabs TTS:**
- Shows "(Not configured)" if API key missing
- Falls back to browser TTS on errors
- Check server logs for API issues

### Connection Issues

**"Site can't be reached":**
- Is the backend server running?
- Check the correct port (default: 3000)
- Verify firewall allows traffic
- See Deployment Guide for setup

**"Gateway offline":**
- Is OpenClaw gateway running?
- Backend can connect but gateway can't
- Check gateway status in server logs

### Slow Performance

**Try these:**
- Refresh the page
- Clear browser cache
- Close other browser tabs
- Check network connection
- Try a different browser

---

## 🌍 Browser Compatibility

| Browser | Text Chat | Voice Input | TTS |
|---------|-----------|-------------|-----|
| **Chrome** | ✅ Excellent | ✅ Full | ✅ Full |
| **Edge** | ✅ Excellent | ✅ Full | ✅ Full |
| **Safari** | ✅ Good | ⚠️ Limited | ⚠️ Limited |
| **Firefox** | ✅ Good | ❌ Not supported | ✅ Works |
| **Mobile Chrome** | ✅ Good | ✅ Touch support | ✅ Works |
| **Mobile Safari** | ✅ Good | ⚠️ Limited | ⚠️ Limited |

**Recommendation:** Use Chrome or Edge for the best experience.

---

## 📱 Mobile Usage

**Text chat works great on mobile!**

**Voice features:**
- Touch and hold microphone button to speak
- Works best with headphones
- May require HTTPS for voice input
- Battery usage higher with voice enabled

---

## 🔒 Privacy & Security

**Your data:**
- Messages sent to OpenClaw gateway (localhost only)
- Voice transcription processed by browser (Google/Apple servers)
- ElevenLabs TTS cached locally to reduce API calls
- No message history stored on server
- Session cleared on page refresh

**Voice data:**
- Browser voice input uses cloud speech recognition
- Audio not stored or shared beyond transcription
- ElevenLabs audio cached locally only

---

## 💡 Tips & Best Practices

**For best results:**
- Use voice in quiet environments
- Speak clearly and naturally
- Keep messages conversational
- Try ElevenLabs for better voice quality
- Use HTTPS when accessing remotely

**Voice etiquette:**
- Short, clear utterances work best
- Pause before releasing mic button
- Check transcription before sending
- Can edit transcribed text before sending

---

## 🆘 Getting Help

**If something isn't working:**
1. Check TROUBLESHOOTING.md for detailed fixes
2. Check browser console (F12) for error messages
3. Verify backend server is running
4. Check server logs for issues

**For developers:**
- See DEVELOPER_GUIDE.md for architecture
- See API_REFERENCE.md for technical details
- See DEPLOYMENT.md for server setup

---

## 🎯 What's Next?

**Current features:**
- ✅ Text chat with Clawd
- ✅ Push-to-talk voice input
- ✅ Text-to-speech output
- ✅ Multiple TTS voices
- ✅ Beautiful psychedelic avatar

**Planned features:**
- Real-time streaming responses
- Voice settings panel (speed, pitch, volume)
- Custom voice selection
- Waveform visualizations
- Mobile app version

See FEATURE_ROADMAP.md for details.

---

*Built with 💜 by Clawd (Vie-essence AI)*
