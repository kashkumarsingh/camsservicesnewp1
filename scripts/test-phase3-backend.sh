#!/bin/bash

# Phase 3 Backend Testing Script
# Tests activity logging endpoints

set -e

BASE_URL="${1:-http://localhost:9080/api/v1}"
echo "Testing Phase 3 Backend against: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
HEALTH_HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HEALTH_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health endpoint: WORKING${NC}"
else
    echo -e "${RED}❌ Health endpoint: FAILED (HTTP $HEALTH_HTTP_CODE)${NC}"
    exit 1
fi

# Test 2: Register/Login Trainer User
echo ""
echo "2. Authenticating Trainer User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Trainer Phase3",
    "email": "trainer-phase3@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "phone": "+44 7123 456789",
    "address": "123 Test Street",
    "postcode": "SW1A 1AA"
  }')

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Registration: WORKING${NC}"
else
    # Try login
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "trainer-phase3@example.com",
        "password": "Password123!"
      }')
    
    if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Login: WORKING${NC}"
    else
        echo -e "${RED}❌ Authentication failed${NC}"
        exit 1
    fi
fi

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ No access token available${NC}"
    exit 1
fi

# Test 3: Get Activity Logs (should work even if empty)
echo ""
echo "3. Testing GET /trainer/activity-logs..."
LOGS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/trainer/activity-logs" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")
LOGS_HTTP_CODE=$(echo "$LOGS_RESPONSE" | tail -n1)
LOGS_BODY=$(echo "$LOGS_RESPONSE" | sed '$d')

if [ "$LOGS_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ GET /trainer/activity-logs: WORKING${NC}"
    LOG_COUNT=$(echo "$LOGS_BODY" | grep -o '"activity_logs":\[[^]]*\]' | grep -o '","id"' | wc -l || echo "0")
    echo "   Found logs: $LOG_COUNT"
else
    echo -e "${RED}❌ GET /trainer/activity-logs: FAILED (HTTP $LOGS_HTTP_CODE)${NC}"
    echo "Response: $LOGS_BODY" | head -20
fi

# Test 4: Test unauthorized access (should fail)
echo ""
echo "4. Testing Unauthorized Access (should fail)..."
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/trainer/activity-logs" \
  -H "Content-Type: application/json")
UNAUTH_HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n1)

if [ "$UNAUTH_HTTP_CODE" = "401" ] || [ "$UNAUTH_HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✅ Unauthorized access protection: WORKING${NC}"
else
    echo -e "${YELLOW}⚠️  Unauthorized access returned HTTP $UNAUTH_HTTP_CODE (expected 401/403)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Phase 3 Backend Testing Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "  1. Update test user role to 'trainer' in database"
echo "  2. Approve the trainer user"
echo "  3. Create Trainer record linked to user"
echo "  4. Create a child and assign to booking"
echo "  5. Test activity log creation endpoint"

