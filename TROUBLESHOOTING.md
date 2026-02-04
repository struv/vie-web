# Vie Web - Troubleshooting Guide

**Common issues and how to fix them.**

Quick reference for solving problems with Vie Web.

---

## 🔍 Quick Diagnostic Checklist

Run these checks first:

```bash
# 1. Is backend running?
curl http://localhost:3000/health

# 2. Is gateway connected?
curl http://localhost:3000/health/gateway

# 3. Check backend logs
pm2 logs vie-web
# Or: sudo journalctl -u vie-web -f

# 4. Check OpenClaw gateway
curl http://localhost:18789/health

# 5. Test from browser console (F12)
fetch('/health').then(r => r.json()).then(console.log)
```

---

## 🌐 Connection Issues

### "Site can't be reached" / "Connection refused"

**Symptom:** Can't access http://localhost:3000 or http://server-ip:3000

**Possible causes:**

#### 1. Backend not running

**Check:**
```bash
# Is the process running?
ps aux | grep node

# Or if using PM2:
pm2 list

# Or if using systemd:
sudo systemctl status vie-web
```

**Fix:**
```bash
# Start backend
cd ~/.openclaw/vie-web/backend

# Direct:
npm start

# PM2:
pm2 start src/server.js --name vie-web

# systemd:
sudo systemctl start vie-web
```

#### 2. Wrong port

**Check:**
```bash
# What port is backend listening on?
cat ~/.openclaw/vie-web/backend/.env | grep PORT

# Is something else using port 3000?
sudo lsof -i :3000
```

**Fix:**
```bash
# Change port in .env
nano ~/.openclaw/vie-web/backend/.env
# Set: PORT=3001 (or another port)

# Restart backend
pm2 restart vie-web
```

#### 3. Firewall blocking (remote access)

**Check:**
```bash
# iptables rules
sudo iptables -L -n | grep 3000

# firewalld (if used)
sudo firewall-cmd --list-ports
```

**Fix:**
```bash
# iptables
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save

# firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

**Oracle Cloud:** Also check Security List in VCN settings (see DEPLOYMENT.md).

#### 4. Server listening on 127.0.0.1 only

**Check:**
```bash
# Should show 0.0.0.0:3000 (not 127.0.0.1:3000)
sudo netstat -tlnp | grep 3000
```

**Fix:**
Express defaults to 0.0.0.0, but if modified:
```javascript
// In server.js, use:
app.listen(PORT, '0.0.0.0', () => { ... });
```

---

## 🔌 "Gateway offline" / Gateway Connection Failed

**Symptom:** Health check shows gateway not connected, or `/health/gateway` returns error.

**Possible causes:**

#### 1. OpenClaw gateway not running

**Check:**
```bash
curl http://localhost:18789/health
```

**Fix:**
```bash
# Start OpenClaw gateway
openclaw gateway start

# Check status
openclaw gateway status
```

#### 2. Wrong gateway token

**Check:**
```bash
# Get correct token from OpenClaw config
cat ~/.openclaw/openclaw.json | grep gatewayToken

# Check backend .env
cat ~/.openclaw/vie-web/backend/.env | grep OPENCLAW_GATEWAY_TOKEN
```

**Fix:**
```bash
# Update .env with correct token
nano ~/.openclaw/vie-web/backend/.env
# Set: OPENCLAW_GATEWAY_TOKEN=<token-from-openclaw.json>

# Restart backend
pm2 restart vie-web
```

#### 3. Wrong gateway URL

**Check:**
```bash
cat ~/.openclaw/vie-web/backend/.env | grep OPENCLAW_GATEWAY_URL
# Should be: http://localhost:18789
```

**Fix:**
```bash
# Update .env
nano ~/.openclaw/vie-web/backend/.env
# Set: OPENCLAW_GATEWAY_URL=http://localhost:18789

# Restart backend
pm2 restart vie-web
```

#### 4. Network/DNS issue

**Test:**
```bash
# Can backend reach gateway?
curl http://localhost:18789/health

# Try IP instead of localhost
curl http://127.0.0.1:18789/health
```

**Fix:**
```bash
# Use 127.0.0.1 in .env if localhost doesn't resolve
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
```

---

## 🎤 Voice Input Not Working

**Symptom:** Microphone button doesn't work, or "not supported" message shown.

**Possible causes:**

#### 1. Unsupported browser

**Check:** What browser are you using?

**Fix:**
- ✅ Use Chrome or Edge
- ⚠️ Safari has limited support
- ❌ Firefox doesn't support Web Speech Recognition

#### 2. Microphone permission denied

**Check:**
- Click padlock icon in address bar
- Look for microphone permission status

**Fix:**
```
Chrome/Edge:
1. Click padlock icon → Site settings
2. Find "Microphone" → Allow
3. Refresh page

Safari:
1. Safari menu → Settings → Websites → Microphone
2. Find your site → Allow
3. Refresh page
```

**Or reset all permissions:**
```
Chrome: chrome://settings/content/microphone
Edge: edge://settings/content/microphone
```

#### 3. Not using HTTPS

**Check:**
- Is URL `http://` or `https://`?
- Localhost is OK, but remote access needs HTTPS

**Fix:**
- See DEPLOYMENT.md for HTTPS setup
- Use Nginx + Let's Encrypt
- Or Cloudflare Tunnel (easiest)

#### 4. Microphone not working

**Check:**
```bash
# On server (if local)
arecord -l  # List audio devices

# Test in browser
# Visit: https://www.onlinemictest.com/
```

**Fix:**
- Test microphone in other apps
- Check OS audio settings
- Try different browser
- Check hardware connection

#### 5. Browser console errors

**Check:**
- Open browser console (F12)
- Look for errors related to "SpeechRecognition"

**Common errors:**
- `not-allowed` → Permission denied
- `no-speech` → No audio detected
- `audio-capture` → Mic not found
- `network` → Network issue

---

## 🔊 Text-to-Speech Not Working

**Symptom:** TTS toggle on, but Vie doesn't speak responses.

**Possible causes:**

#### 1. TTS disabled

**Check:**
- Is speaker button showing 🔊 (on) or 🔇 (off)?

**Fix:**
- Click speaker button to enable TTS

#### 2. Browser volume muted

**Check:**
- System volume
- Browser tab sound (icon on tab)
- Site-specific volume settings

**Fix:**
- Unmute browser tab
- Check OS volume mixer

#### 3. No voices available (Browser TTS)

**Check:**
```javascript
// In browser console:
speechSynthesis.getVoices()
// Should return array of voices
```

**Fix:**
- Wait a moment, then try again (voices load async)
- Refresh page
- Try different browser
- Check OS language/speech settings

#### 4. ElevenLabs not configured

**Check:**
```bash
cat ~/.openclaw/vie-web/backend/.env | grep ELEVENLABS_API_KEY
```

**Fix:**
```bash
# Add API key to .env
nano ~/.openclaw/vie-web/backend/.env
# Add: ELEVENLABS_API_KEY=<your-key>

# Restart backend
pm2 restart vie-web
```

**Get API key:** https://elevenlabs.io/app/settings/api-keys

#### 5. ElevenLabs API error

**Check backend logs:**
```bash
pm2 logs vie-web --lines 50
# Look for "ElevenLabs API error"
```

**Common errors:**
- `401` → Invalid API key
- `429` → Rate limit exceeded
- `500` → ElevenLabs service issue

**Fix:**
- Verify API key is correct
- Check ElevenLabs account status
- Wait if rate limited
- Falls back to browser TTS automatically

---

## 🐌 Slow Performance / Lag

**Symptom:** Interface feels sluggish, messages take long to send.

**Possible causes:**

#### 1. Slow network connection

**Test:**
```bash
# From server
ping 8.8.8.8

# Check backend response time
time curl http://localhost:3000/health
```

**Fix:**
- Check internet connection
- Disable VPN if using
- Try wired connection

#### 2. Gateway response slow

**Test:**
```bash
# Time a gateway request
time curl -X POST http://localhost:18789/v1/responses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"model":"openclaw","input":"test"}'
```

**Fix:**
- This is normal (AI responses take time)
- Consider implementing streaming (see FEATURE_ROADMAP.md)

#### 3. Browser memory issues

**Check:**
- Browser task manager (Shift+Esc in Chrome)
- Look for high CPU/memory usage

**Fix:**
- Close other tabs
- Restart browser
- Clear browser cache
- Disable browser extensions

#### 4. Avatar animation lag

**Check:**
- Open browser DevTools → Performance
- Record a few seconds
- Look for dropped frames

**Fix:**
- Reduce particle count (avatar.js):
  ```javascript
  this.config = {
    particleCount: 30,  // Reduce from 60
    // ...
  };
  ```
- Use Firefox (sometimes better Canvas performance)
- Close other apps

#### 5. ElevenLabs TTS slow

**First time is slow (generating audio), then fast (cached).**

**Check cache:**
```bash
ls ~/.openclaw/vie-web/.audio-cache/
```

**Fix:**
- Wait for first request (caches afterward)
- Or switch to browser TTS for instant response

---

## 🔑 Authentication Errors

**Symptom:** "Authentication required" or "Invalid token" errors.

#### 1. Missing auth token in frontend

**Check:**
```javascript
// In browser console:
localStorage.getItem('vie-auth-token')
// Or check app.js source for AUTH_TOKEN
```

**Fix:**
Update `frontend/public/app.js`:
```javascript
this.AUTH_TOKEN = 'your-token-here';
```

Or store in localStorage:
```javascript
localStorage.setItem('vie-auth-token', 'your-token-here');
```

#### 2. Wrong token in backend

**Check:**
```bash
cat ~/.openclaw/vie-web/backend/.env | grep WEB_AUTH_TOKEN
```

**Fix:**
- Make sure frontend and backend tokens match
- Generate new token if needed (see DEPLOYMENT.md)

#### 3. Token not sent in request

**Check browser Network tab:**
- Look at request headers
- Should include: `x-web-auth-token: <token>`

**Fix:**
Frontend should send token:
```javascript
fetch('/api/chat/send', {
  headers: {
    'x-web-auth-token': this.AUTH_TOKEN
  }
})
```

---

## 📱 Mobile-Specific Issues

#### Voice input not working on mobile

**iOS Safari:**
- Requires HTTPS (even on local network)
- Limited voice recognition support
- Try Chrome on iOS (still limited)

**Android Chrome:**
- Should work well
- Check microphone permission
- Needs HTTPS for remote access

#### Touch not registering

**Fix:**
- Make sure touch events are bound (voice.js)
- Increase button size for easier tapping

#### Layout issues

**Check:**
- Responsive CSS
- Viewport meta tag
- Test on different screen sizes

---

## 🪵 Checking Logs

### Backend Logs

**PM2:**
```bash
pm2 logs vie-web              # Live logs
pm2 logs vie-web --lines 100  # Last 100 lines
pm2 logs vie-web --err        # Errors only
```

**systemd:**
```bash
sudo journalctl -u vie-web -f                # Live logs
sudo journalctl -u vie-web --since "1h ago"  # Last hour
sudo journalctl -u vie-web -n 100            # Last 100 lines
```

**Direct (npm start):**
- Logs appear in terminal where you ran `npm start`

### Browser Logs

**Console (F12):**
```javascript
// Check for errors
console.log(app);  // Inspect app state
console.table(app.messages);  // View messages
```

**Network tab:**
- Check API requests/responses
- Look for failed requests (red)
- Check request/response payloads

### Gateway Logs

**OpenClaw:**
```bash
openclaw gateway logs
# Or check ~/.openclaw/logs/
```

---

## 🔄 When All Else Fails

### Complete Restart

```bash
# 1. Stop everything
pm2 stop vie-web
openclaw gateway stop

# 2. Start OpenClaw gateway
openclaw gateway start
curl http://localhost:18789/health

# 3. Start backend
cd ~/.openclaw/vie-web/backend
pm2 restart vie-web

# 4. Check status
pm2 list
curl http://localhost:3000/health
curl http://localhost:3000/health/gateway

# 5. Open browser
# Clear cache (Ctrl+Shift+Delete)
# Open: http://localhost:3000
```

### Reinstall Dependencies

```bash
cd ~/.openclaw/vie-web/backend
rm -rf node_modules package-lock.json
npm install
pm2 restart vie-web
```

### Fresh Configuration

```bash
# Backup current config
cp ~/.openclaw/vie-web/backend/.env ~/.openclaw/vie-web/backend/.env.backup

# Create new .env from scratch
nano ~/.openclaw/vie-web/backend/.env
# (See DEPLOYMENT.md for required settings)

# Restart
pm2 restart vie-web
```

### Check for Updates

```bash
cd ~/.openclaw/vie-web
git pull  # If using git

cd backend
npm install  # Update dependencies
pm2 restart vie-web
```

---

## 📞 Getting Help

**Before asking for help, collect this info:**

1. **What were you doing?** (steps to reproduce)
2. **What happened?** (error message, behavior)
3. **What did you expect?** (what should happen)
4. **Environment:**
   - Browser version
   - OS
   - Backend logs (last 20 lines)
   - Console errors (screenshot)
5. **Already tried:**
   - List what you've already attempted

**Where to ask:**
- Check existing GitHub issues
- Ask in Discord
- Create new GitHub issue

**Include:**
```bash
# System info
node --version
npm --version
uname -a

# Backend logs
pm2 logs vie-web --lines 20 --nostream

# Browser console errors
# (Screenshot from F12 console)

# .env config (REDACT TOKENS!)
cat ~/.openclaw/vie-web/backend/.env | sed 's/=.*/=REDACTED/'
```

---

## 🛠️ Common Error Messages

### "Cannot find module 'express'"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd ~/.openclaw/vie-web/backend
npm install
```

### "EADDRINUSE: address already in use"

**Cause:** Port 3000 already in use

**Fix:**
```bash
# Find process
sudo lsof -i :3000

# Kill it
sudo kill -9 <PID>

# Or change port in .env
```

### "ENOENT: no such file or directory"

**Cause:** File path wrong or file missing

**Fix:**
- Check file exists
- Check file permissions
- Verify path in config

### "Network request failed"

**Cause:** Can't reach backend or gateway

**Fix:**
- Check backend is running
- Check URL is correct
- Check CORS settings
- Check network connection

### "SyntaxError: Unexpected token"

**Cause:** JSON parsing error or JavaScript syntax error

**Fix:**
- Check JSON is valid
- Check for missing brackets/quotes
- Check browser console for line number

---

## 📋 Diagnostic Script

**Run this to check everything:**

```bash
#!/bin/bash
echo "=== Vie Web Diagnostic ==="
echo ""

echo "1. Backend process:"
pm2 list | grep vie-web || echo "Not running with PM2"

echo ""
echo "2. Backend health:"
curl -s http://localhost:3000/health | jq '.' || echo "Backend not responding"

echo ""
echo "3. Gateway connection:"
curl -s http://localhost:3000/health/gateway | jq '.' || echo "Gateway check failed"

echo ""
echo "4. OpenClaw gateway:"
curl -s http://localhost:18789/health || echo "Gateway not responding"

echo ""
echo "5. Listening ports:"
sudo netstat -tlnp | grep -E ':(3000|18789)'

echo ""
echo "6. Firewall (iptables):"
sudo iptables -L INPUT -n | grep 3000

echo ""
echo "7. Backend logs (last 10 lines):"
pm2 logs vie-web --lines 10 --nostream 2>/dev/null || echo "No PM2 logs"

echo ""
echo "=== End Diagnostic ==="
```

Save as `diagnose.sh`, run with `bash diagnose.sh`.

---

## 🎯 Prevention Tips

**To avoid issues:**

✅ Always use HTTPS for remote access  
✅ Keep .env in .gitignore  
✅ Monitor logs regularly  
✅ Test after making changes  
✅ Use PM2 or systemd for auto-restart  
✅ Keep dependencies updated  
✅ Document your changes  
✅ Back up configuration  

---

*Still stuck? Check DEVELOPER_GUIDE.md or ask for help!*
