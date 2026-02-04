# Vie Web - Deployment Guide

**Complete setup instructions for deploying Vie Web on your server.**

This guide covers installation, configuration, firewall setup, HTTPS, and process management.

---

## 📋 Prerequisites

### Required
- **Node.js** v16+ (v18+ recommended)
- **npm** v8+ (comes with Node.js)
- **OpenClaw Gateway** running on localhost:18789
- **Linux server** (Ubuntu, Oracle Linux, etc.)

### Check Your Setup
```bash
node --version    # Should be v16+
npm --version     # Should be v8+
curl http://localhost:18789/health  # Gateway should respond
```

---

## 📦 Installation

### 1. Clone or Download Project

If not already on your system:
```bash
cd ~/.openclaw
# Project should be in: ~/.openclaw/vie-web/
```

### 2. Install Backend Dependencies

```bash
cd ~/.openclaw/vie-web/backend
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `express-rate-limit` - API rate limiting
- `node-fetch` - HTTP client for gateway

### 3. Frontend Setup

Frontend is static files - no build step required!
```bash
ls ~/.openclaw/vie-web/frontend/public/
# Should see: index.html, app.js, avatar.js, voice.js, styles.css
```

---

## ⚙️ Configuration

### Environment Variables (.env)

The backend uses `.env` file for configuration:

```bash
cd ~/.openclaw/vie-web/backend
nano .env  # or use your preferred editor
```

**Required settings:**

```bash
# Server Configuration
PORT=3000

# OpenClaw Gateway (local only - never expose!)
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=<your-gateway-token>

# Web App Authentication
WEB_AUTH_TOKEN=<your-secure-token>

# CORS (Cross-Origin Resource Sharing)
ALLOWED_ORIGINS=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Optional settings:**

```bash
# ElevenLabs TTS (premium voices)
ELEVENLABS_API_KEY=<your-api-key>
```

### Finding Your Gateway Token

```bash
cat ~/.openclaw/openclaw.json | grep gatewayToken
```

Or:
```bash
jq -r '.gatewayToken' ~/.openclaw/openclaw.json
```

### Generating Secure Auth Token

```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: /dev/urandom
head -c 32 /dev/urandom | base64
```

Copy the generated token to `WEB_AUTH_TOKEN` in `.env`.

### ElevenLabs API Key (Optional)

For premium TTS voices:
1. Sign up at https://elevenlabs.io
2. Get API key from https://elevenlabs.io/app/settings/api-keys
3. Add to `.env`: `ELEVENLABS_API_KEY=<your-key>`

**Note:** Free tier includes 10,000 characters/month.

---

## 🚀 Starting the Server

### Quick Start (Development)

```bash
cd ~/.openclaw/vie-web/backend
npm start
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║                    Vie Web Backend                       ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3000
🌍 External access: http://<vm-ip>:3000

Endpoints:
  GET  /health              - Health check
  GET  /health/gateway      - Gateway connection status
  POST /api/chat/send       - Send message to Clawd
  POST /api/chat/stream     - Stream message (SSE)
  GET  /api/tts/voices      - List available TTS voices
  POST /api/tts/elevenlabs  - Generate speech with ElevenLabs

Testing OpenClaw gateway connection...
✅ Gateway connection successful!

Ready for requests! 💜
```

### Testing the Server

**Health check:**
```bash
curl http://localhost:3000/health
```

**Gateway connection:**
```bash
curl http://localhost:3000/health/gateway
```

**Send a test message:**
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: <your-token>" \
  -d '{"message": "Hello Vie!"}'
```

---

## 🌍 Accessing from Other Devices

### Local Network Access

**Find your server IP:**
```bash
# Option 1: Internal IP
hostname -I | awk '{print $1}'

# Option 2: External IP
curl ifconfig.me
```

**Access from browser:**
```
http://<server-ip>:3000
```

### Firewall Configuration (Oracle Cloud)

If using Oracle Cloud, you need to open port 3000:

#### 1. Security List (Oracle Cloud Console)

1. Go to **Networking** → **Virtual Cloud Networks**
2. Select your VCN → **Security Lists**
3. Click your security list → **Add Ingress Rules**
4. Add rule:
   - **Source CIDR:** `0.0.0.0/0` (or specific IP range)
   - **IP Protocol:** TCP
   - **Destination Port Range:** `3000`
   - **Description:** "Vie Web access"
5. Click **Add Ingress Rules**

#### 2. Instance Firewall (iptables)

```bash
# Allow port 3000
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT

# Save rules (Oracle Linux)
sudo netfilter-persistent save

# Or for RHEL/CentOS:
sudo service iptables save
```

#### 3. Verify Firewall

```bash
# Check if port is listening
sudo netstat -tlnp | grep 3000

# Test from another device
curl http://<server-ip>:3000/health
```

### Common Firewall Issues

**Still can't connect?**

```bash
# Check if port is open
sudo firewall-cmd --list-ports  # RHEL/CentOS/Oracle Linux 8+

# Add port if using firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Check iptables
sudo iptables -L -n -v | grep 3000
```

---

## 🔒 HTTPS Setup (Recommended)

Voice features work best over HTTPS. Here's how to set it up:

### Option 1: Reverse Proxy (Nginx)

**Install Nginx:**
```bash
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # RHEL/CentOS/Oracle Linux
```

**Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/vie-web
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or server IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/vie-web /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

**Add SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
sudo yum install certbot python3-certbot-nginx  # RHEL/Oracle Linux

sudo certbot --nginx -d your-domain.com
```

Now access: `https://your-domain.com`

### Option 2: Cloudflare Tunnel (Easy HTTPS)

Free HTTPS without opening ports:

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create vie-web

# Configure tunnel
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: <tunnel-id>
credentials-file: /home/<user>/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: vie.your-domain.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# Route DNS
cloudflared tunnel route dns vie-web vie.your-domain.com

# Run tunnel
cloudflared tunnel run vie-web
```

### Option 3: Self-Signed Certificate (Testing)

For testing only (browsers will show warnings):

```bash
# Generate certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update backend/src/server.js to use HTTPS
# (See DEVELOPER_GUIDE.md for code changes)
```

---

## 🔄 Process Management (Keep Running)

### Option 1: PM2 (Recommended)

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Start with PM2:**
```bash
cd ~/.openclaw/vie-web/backend
pm2 start src/server.js --name vie-web

# Save process list
pm2 save

# Auto-start on boot
pm2 startup
# Follow the command it shows
```

**PM2 Commands:**
```bash
pm2 list              # Show running processes
pm2 logs vie-web      # View logs
pm2 restart vie-web   # Restart
pm2 stop vie-web      # Stop
pm2 delete vie-web    # Remove
pm2 monit             # Monitor resources
```

### Option 2: systemd Service

**Create service file:**
```bash
sudo nano /etc/systemd/system/vie-web.service
```

```ini
[Unit]
Description=Vie Web Backend
After=network.target

[Service]
Type=simple
User=opc
WorkingDirectory=/home/opc/.openclaw/vie-web/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=vie-web

Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable vie-web
sudo systemctl start vie-web

# Check status
sudo systemctl status vie-web

# View logs
sudo journalctl -u vie-web -f
```

### Option 3: Screen/Tmux (Simple)

**Using screen:**
```bash
screen -S vie-web
cd ~/.openclaw/vie-web/backend
npm start

# Detach: Ctrl+A, then D
# Reattach: screen -r vie-web
```

**Using tmux:**
```bash
tmux new -s vie-web
cd ~/.openclaw/vie-web/backend
npm start

# Detach: Ctrl+B, then D
# Reattach: tmux attach -t vie-web
```

---

## 📊 Monitoring & Logs

### View Logs

**PM2:**
```bash
pm2 logs vie-web
pm2 logs vie-web --lines 100  # Last 100 lines
```

**systemd:**
```bash
sudo journalctl -u vie-web -f
sudo journalctl -u vie-web --since "1 hour ago"
```

**Direct (if running in screen/tmux):**
```bash
# Logs go to console where npm start was run
```

### Health Checks

**Automated monitoring:**
```bash
# Add to crontab
crontab -e

# Check every 5 minutes
*/5 * * * * curl -f http://localhost:3000/health || systemctl restart vie-web
```

---

## 🔧 Updating Vie Web

```bash
cd ~/.openclaw/vie-web

# Pull latest changes (if using git)
git pull

# Update backend dependencies
cd backend
npm install

# Restart server
pm2 restart vie-web
# Or: sudo systemctl restart vie-web
```

---

## 🗑️ Uninstalling

```bash
# Stop server
pm2 delete vie-web
# Or: sudo systemctl stop vie-web && sudo systemctl disable vie-web

# Remove files
rm -rf ~/.openclaw/vie-web

# Remove systemd service (if created)
sudo rm /etc/systemd/system/vie-web.service
sudo systemctl daemon-reload

# Remove Nginx config (if created)
sudo rm /etc/nginx/sites-enabled/vie-web
sudo systemctl reload nginx
```

---

## 🆘 Troubleshooting Deployment

### "Cannot find module 'express'"
```bash
cd ~/.openclaw/vie-web/backend
npm install
```

### "Port 3000 already in use"
```bash
# Find process using port
sudo lsof -i :3000
sudo kill <PID>

# Or change port in .env
```

### "Gateway connection failed"
```bash
# Check gateway is running
curl http://localhost:18789/health

# Check gateway token
cat ~/.openclaw/openclaw.json | grep gatewayToken

# Verify .env has correct token
```

### "Permission denied" on port 80
```bash
# Use port > 1024 (e.g., 3000)
# Or use reverse proxy (Nginx)
# Or run with sudo (not recommended)
```

### Can't access from external IP
1. Check firewall rules (iptables, firewalld)
2. Check Oracle Cloud security list
3. Check server is listening on 0.0.0.0, not 127.0.0.1
4. Test with: `curl http://<external-ip>:3000/health`

---

## 📚 Next Steps

**After deployment:**
- ✅ Test from multiple devices
- ✅ Set up HTTPS for voice features
- ✅ Configure ElevenLabs for premium voices
- ✅ Set up monitoring/alerts
- ✅ Create backup of configuration

**Learn more:**
- USER_GUIDE.md - How to use Vie Web
- DEVELOPER_GUIDE.md - Architecture and development
- TROUBLESHOOTING.md - Common issues and fixes
- API_REFERENCE.md - API documentation

---

*Questions? Check TROUBLESHOOTING.md or ask in Discord!*
