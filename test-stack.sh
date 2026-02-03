#!/bin/bash
# Vie Web Stack Test Script
# Tests backend → gateway communication

echo "╔══════════════════════════════════════════════════════════╗"
echo "║           Vie Web Stack Integration Test                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:3000"
GATEWAY_URL="http://localhost:18789"
AUTH_TOKEN="vie_web_2026_secure_token_replace_in_production"

# Load gateway token from openclaw.json
GATEWAY_TOKEN=$(grep -oP '"token"\s*:\s*"\K[^"]+' ~/.openclaw/openclaw.json | tail -1)

echo "Configuration:"
echo "  Backend: $BACKEND_URL"
echo "  Gateway: $GATEWAY_URL"
echo "  Gateway Token: ${GATEWAY_TOKEN:0:10}...${GATEWAY_TOKEN: -10}"
echo ""

# Test 1: Backend health
echo "Test 1: Backend Health Check"
RESPONSE=$(curl -s $BACKEND_URL/health)
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "  ${GREEN}✓${NC} Backend is running"
else
    echo -e "  ${RED}✗${NC} Backend is not responding"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 2: Gateway direct access
echo "Test 2: Direct Gateway Communication"
RESPONSE=$(curl -s -X POST $GATEWAY_URL/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -d '{"model":"openclaw","input":"ping"}' 2>&1)

if echo "$RESPONSE" | grep -q '"status":"completed"'; then
    REPLY=$(echo "$RESPONSE" | jq -r '.output[0].content[0].text' 2>/dev/null)
    echo -e "  ${GREEN}✓${NC} Gateway is responding"
    echo "  Reply: ${REPLY:0:50}..."
else
    echo -e "  ${RED}✗${NC} Gateway is not responding or auth failed"
    echo "  Response: ${RESPONSE:0:200}"
    exit 1
fi
echo ""

# Test 3: Backend → Gateway proxy
echo "Test 3: Backend → Gateway Proxy"
RESPONSE=$(curl -s -X POST $BACKEND_URL/api/chat/send \
  -H "Content-Type: application/json" \
  -H "x-web-auth-token: $AUTH_TOKEN" \
  -d '{"message":"Test message from integration test"}' 2>&1)

if echo "$RESPONSE" | grep -q '"success":true'; then
    REPLY=$(echo "$RESPONSE" | jq -r '.reply' 2>/dev/null)
    echo -e "  ${GREEN}✓${NC} Full stack working!"
    echo "  Reply: ${REPLY:0:100}..."
else
    echo -e "  ${RED}✗${NC} Backend → Gateway proxy failed"
    echo "  Response: ${RESPONSE:0:300}"
    exit 1
fi
echo ""

# Test 4: Frontend files
echo "Test 4: Frontend Files"
if [ -f "/home/opc/.openclaw/vie-web/frontend/public/index.html" ]; then
    echo -e "  ${GREEN}✓${NC} index.html exists"
else
    echo -e "  ${RED}✗${NC} index.html missing"
fi

if [ -f "/home/opc/.openclaw/vie-web/frontend/public/styles.css" ]; then
    echo -e "  ${GREEN}✓${NC} styles.css exists"
else
    echo -e "  ${RED}✗${NC} styles.css missing"
fi

if [ -f "/home/opc/.openclaw/vie-web/frontend/public/app.js" ]; then
    echo -e "  ${GREEN}✓${NC} app.js exists"
else
    echo -e "  ${RED}✗${NC} app.js missing"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                All Tests Passed! 🎉                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Next Steps:"
echo "  1. Open browser to: $BACKEND_URL"
echo "  2. Try sending a message"
echo "  3. For external access: http://[vm-ip]:3000"
echo ""
