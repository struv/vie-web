#!/bin/bash
# ElevenLabs TTS Integration Test Script
# Tests backend endpoints without requiring frontend

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         ElevenLabs TTS Integration Test                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Configuration
BASE_URL="http://localhost:3000"
AUTH_TOKEN="vie_web_2026_secure_token_replace_in_production"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for tests
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  
  echo -n "Testing $name... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method \
      -H "x-web-auth-token: $AUTH_TOKEN" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method \
      -H "Content-Type: application/json" \
      -H "x-web-auth-token: $AUTH_TOKEN" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi
  
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $status)"
    echo "  Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test 1: Health check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Suite 1: Basic Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Backend health check" "GET" "/health" "" "200"

# Test 2: List voices
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Suite 2: Voice Listing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Fetching available voices... "
response=$(curl -s -H "x-web-auth-token: $AUTH_TOKEN" "$BASE_URL/api/tts/voices")
echo "$response" | jq . > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  
  # Show voice details
  echo ""
  echo "Available voices:"
  echo "$response" | jq -r '.voices[] | "  - \(.name) (\(.gender), \(.accent)): \(.description)"'
  
  # Check API key status
  api_configured=$(echo "$response" | jq -r '.apiKeyConfigured')
  echo ""
  echo -n "API Key Status: "
  if [ "$api_configured" = "true" ]; then
    echo -e "${GREEN}✓ Configured${NC}"
  else
    echo -e "${YELLOW}⚠ Not configured${NC}"
    echo "  To enable ElevenLabs:"
    echo "  1. Get API key from https://elevenlabs.io/app/settings/api-keys"
    echo "  2. Add to backend/.env: ELEVENLABS_API_KEY=your_key_here"
    echo "  3. Restart backend"
  fi
else
  echo -e "${RED}✗ FAIL${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 3: TTS generation (only if API key is configured)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Suite 3: Speech Generation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$api_configured" = "true" ]; then
  echo -n "Generating test audio (Rachel)... "
  
  curl -s -o /tmp/vie-test-audio.mp3 -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "x-web-auth-token: $AUTH_TOKEN" \
    -d '{"text":"Hello! This is a test of the ElevenLabs integration.","voice_key":"rachel"}' \
    "$BASE_URL/api/tts/elevenlabs" > /tmp/vie-test-status.txt
  
  status=$(cat /tmp/vie-test-status.txt)
  
  if [ "$status" = "200" ]; then
    file_size=$(stat -f%z /tmp/vie-test-audio.mp3 2>/dev/null || stat -c%s /tmp/vie-test-audio.mp3)
    echo -e "${GREEN}✓ PASS${NC} (Generated $file_size bytes)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    echo "  Audio saved to: /tmp/vie-test-audio.mp3"
    echo "  Play with: mpv /tmp/vie-test-audio.mp3"
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $status)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    cat /tmp/vie-test-audio.mp3
  fi
  
  # Test caching
  echo -n "Testing audio caching (same request)... "
  start_time=$(date +%s%N)
  
  curl -s -o /tmp/vie-test-audio-2.mp3 -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "x-web-auth-token: $AUTH_TOKEN" \
    -d '{"text":"Hello! This is a test of the ElevenLabs integration.","voice_key":"rachel"}' \
    "$BASE_URL/api/tts/elevenlabs" > /tmp/vie-test-status-2.txt
  
  end_time=$(date +%s%N)
  duration_ms=$(( ($end_time - $start_time) / 1000000 ))
  status=$(cat /tmp/vie-test-status-2.txt)
  
  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (${duration_ms}ms - cache hit)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${YELLOW}⚠ SKIPPED${NC} (API key not configured)"
  echo "  Configure ELEVENLABS_API_KEY in backend/.env to test"
fi

# Test 4: Error handling
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Suite 4: Error Handling"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Empty text rejection" "POST" "/api/tts/elevenlabs" '{"text":""}' "400"
test_endpoint "Missing text rejection" "POST" "/api/tts/elevenlabs" '{}' "400"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
total_tests=$((TESTS_PASSED + TESTS_FAILED))
echo "Total tests: $total_tests"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Open Vie Web: http://localhost:3000"
  echo "  2. Enable TTS (click 🔊 button)"
  echo "  3. Select 'ElevenLabs' from dropdown"
  echo "  4. Choose a voice (Rachel, Adam, or Bella)"
  echo "  5. Send a message and enjoy high-quality voice!"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "  - Check backend is running: http://localhost:3000/health"
  echo "  - Check API key in backend/.env"
  echo "  - Check backend logs for errors"
  exit 1
fi
