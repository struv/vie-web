# Voice Interface Testing Guide

## Quick Start

```bash
# Start the backend (if not already running)
cd /home/opc/.openclaw/vie-web/backend
npm run dev

# Open in Chrome or Edge
# Navigate to: http://localhost:3000
```

## Testing Checklist

### 1. Initial Load
- [ ] Page loads without errors (check browser console)
- [ ] Avatar appears and animates
- [ ] Voice controls visible at bottom
- [ ] Microphone button shows idle state
- [ ] TTS toggle shows "TTS Off" by default

### 2. Voice Input (Push-to-Talk)

**Test 1: Basic voice input**
- [ ] Click and hold microphone button
- [ ] Browser prompts for microphone permission → Allow
- [ ] Button shows pulsing animation (listening state)
- [ ] Speak: "Hello Vie, can you hear me?"
- [ ] See live transcription appear below button
- [ ] Release button
- [ ] Message appears in chat as user message
- [ ] Vie responds

**Test 2: Interim transcription**
- [ ] Hold button and speak slowly
- [ ] See words appear in real-time (gray, italic)
- [ ] Release when done
- [ ] Final transcript turns solid gold

**Test 3: Error handling**
- [ ] Hold button but don't speak
- [ ] Release after 2 seconds
- [ ] Should not send empty message
- [ ] Status clears back to idle

**Test 4: Permission denied**
- [ ] Clear microphone permission in browser
- [ ] Try to hold button
- [ ] Should show error message
- [ ] Fallback to text input still works

### 3. Voice Output (TTS)

**Test 1: Enable TTS**
- [ ] Click TTS toggle button
- [ ] Button changes to "🔊 TTS On" (purple highlight)
- [ ] Send a text message: "Tell me a joke"
- [ ] Vie's response plays aloud
- [ ] Speaker indicator shows pulse animation while speaking

**Test 2: TTS controls**
- [ ] While Vie is speaking, click TTS toggle to turn off
- [ ] Speech stops immediately
- [ ] Speaker indicator disappears

**Test 3: Multiple messages**
- [ ] Enable TTS
- [ ] Send message while Vie is still speaking
- [ ] Previous speech stops
- [ ] New response starts speaking

### 4. Visual Feedback

**Microphone button states:**
- [ ] Idle: Gray border, no animation
- [ ] Listening: Gold border, pulsing rings
- [ ] Processing: Cyan border, rotating icon
- [ ] Error: Red border

**Status indicators:**
- [ ] "Listening..." (gold text) while recording
- [ ] "Processing..." (cyan text) after release
- [ ] Error messages in red
- [ ] Clear when idle

### 5. Browser Compatibility

**Chrome/Edge (best support):**
- [ ] Voice input works
- [ ] TTS works
- [ ] All animations smooth

**Safari (partial support):**
- [ ] Voice input works
- [ ] TTS works (fewer voice options)
- [ ] May need microphone permission per session

**Firefox (no support):**
- [ ] Shows "Voice features require Chrome, Edge, or Safari"
- [ ] Text input still works
- [ ] No crash or errors

### 6. Mobile Testing (optional)

**Chrome on Android:**
- [ ] Touch and hold mic button
- [ ] Voice input works
- [ ] TTS plays through speaker

**Safari on iOS:**
- [ ] Touch and hold mic button
- [ ] Voice input works
- [ ] TTS works

## Common Issues

### "Microphone access denied"
→ Check browser permissions: Settings → Privacy → Microphone

### "No speech detected"
→ Speak louder or check microphone input level

### "Network error"
→ Web Speech API requires internet connection

### Voice sounds robotic
→ Browser's built-in TTS. Can upgrade to ElevenLabs/OpenAI later

### Button not responding
→ Check browser console for JavaScript errors

## Expected Behavior

**Normal flow:**
1. Hold mic button → pulsing animation starts
2. Speak → see words appear in transcript
3. Release → transcript finalizes, message sends
4. Vie responds → if TTS on, reads response aloud

**Settings persistence:**
- TTS toggle state saved to localStorage
- Survives page refresh

## Known Limitations

- Web Speech API requires internet (uses Google's servers)
- Voice quality depends on browser's built-in voices
- Chrome/Edge have best support
- Microphone permission required per domain

## Next Steps After Testing

If everything works:
- ✅ Voice interface is ready for daily use!
- Consider adding voice settings panel
- Consider upgrading to premium TTS (ElevenLabs)

If issues found:
- Check browser console for errors
- Verify microphone permissions
- Test in different browser
- Report bugs in Discord

---

**Built by Devon (subagent) - Phase 3 complete!** 🎤💜
