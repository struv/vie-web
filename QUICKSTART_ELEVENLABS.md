# ElevenLabs TTS - Quick Start (30 seconds)

## Setup (One Time)

```bash
# 1. Get API key from https://elevenlabs.io/app/settings/api-keys

# 2. Add to backend/.env
echo "ELEVENLABS_API_KEY=your_key_here" >> /home/opc/.openclaw/vie-web/backend/.env

# 3. Restart backend
cd /home/opc/.openclaw/vie-web/backend && npm start
```

## Test It

```bash
# Run test script
/home/opc/.openclaw/vie-web/test-elevenlabs.sh

# Should see: ✓ All tests passed!
```

## Use It

1. Open Vie Web: `http://localhost:3000`
2. Click **🔊 TTS On**
3. Select **"ElevenLabs"** from dropdown
4. Choose voice: **Rachel** (calm), **Adam** (deep), or **Bella** (warm)
5. Send a message - enjoy premium voice! 🎙️

## Voices

- **Rachel** (default) - Calm, professional female
- **Adam** - Deep, confident male
- **Bella** - Warm, expressive female

## Cost

- **Free tier:** 10,000 chars/month (~33 responses)
- **Starter:** $5/mo for 30,000 chars (~100 responses)

## Fallback

If ElevenLabs fails (no API key, network issue, rate limit), automatically uses browser TTS.

---

**Full docs:** `ELEVENLABS_SETUP.md`  
**Status:** `ELEVENLABS_COMPLETE.md`
