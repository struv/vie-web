#!/bin/bash
# Vie Web Backend Startup Script
# Ensures correct OpenClaw gateway token is used (from .env, not system env)

cd "$(dirname "$0")"

# Load the token from .env file (takes priority over system env)
export OPENCLAW_GATEWAY_TOKEN=$(grep '^OPENCLAW_GATEWAY_TOKEN=' .env | cut -d '=' -f2)

echo "🚀 Starting Vie Web Backend..."
echo "   Gateway: $OPENCLAW_GATEWAY_URL"
echo "   Token: ${OPENCLAW_GATEWAY_TOKEN:0:20}..."
echo "   Port: ${PORT:-3000}"
echo ""

# Start the server
node src/server.js
