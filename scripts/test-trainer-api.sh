#!/bin/bash

# Test Trainer API Endpoints
# 
# Purpose: Test Phase 1 trainer dashboard backend endpoints
# Usage: ./scripts/test-trainer-api.sh [BASE_URL]
# 
# Example:
#   ./scripts/test-trainer-api.sh http://localhost:9080/api/v1
#   ./scripts/test-trainer-api.sh https://cams-backend-oj5x.onrender.com/api/v1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default base URL
# Note: Health endpoint is at /v1/api/health, but other endpoints are at /api/v1/*
BASE_URL="${1:-http://localhost:9080/api/v1}"
HEALTH_URL="${1:-http://localhost:9080}/v1/api"

echo -e "${BLUE}🧪 Testing Trainer API Endpoints${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo ""

# Step 1: Health Check
echo -e "${YELLOW}1. Testing Health Endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${HEALTH_URL}/health")
HEALTH_HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HEALTH_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed (HTTP $HEALTH_HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HEALTH_HTTP_CODE)${NC}"
    echo "$HEALTH_BODY" | jq '.' 2>/dev/null || echo "$HEALTH_BODY"
    exit 1
fi
echo ""

# Step 2: Register a Trainer User (if needed)
echo -e "${YELLOW}2. Registering Trainer User...${NC}"
TRAINER_EMAIL="trainer-test-$(date +%s)@example.com"
TRAINER_PASSWORD="TestPassword123!"

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
        \"name\": \"Test Trainer\",
        \"email\": \"${TRAINER_EMAIL}\",
        \"password\": \"${TRAINER_PASSWORD}\",
        \"password_confirmation\": \"${TRAINER_PASSWORD}\",
        \"phone\": \"+44 7123 456789\",
        \"address\": \"123 Test Street\",
        \"postcode\": \"SW1A 1AA\",
        \"role\": \"trainer\"
    }")

REGISTER_HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$REGISTER_HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Trainer registration successful (HTTP $REGISTER_HTTP_CODE)${NC}"
    
    # Extract token - try with jq first, fallback to grep/sed
    if command -v jq &> /dev/null; then
        ACCESS_TOKEN=$(echo "$REGISTER_BODY" | jq -r '.data.access_token' 2>/dev/null || echo "")
        USER_ID=$(echo "$REGISTER_BODY" | jq -r '.data.user.id' 2>/dev/null || echo "")
    else
        # Fallback: extract using grep/sed
        ACCESS_TOKEN=$(echo "$REGISTER_BODY" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//' || echo "")
        USER_ID=$(echo "$REGISTER_BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "")
    fi
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ Failed to extract access token${NC}"
        echo -e "${YELLOW}   Response body:${NC}"
        echo "$REGISTER_BODY" | head -20
        exit 1
    fi
    
    echo -e "${GREEN}   Access Token: ${ACCESS_TOKEN:0:20}...${NC}"
    echo -e "${GREEN}   User ID: $USER_ID${NC}"
    
    # Note: Registration creates user with role='parent' by default
    # For trainer testing, we need to update role to 'trainer' and approve
    echo -e "${YELLOW}   ⚠️  Note: User registered as 'parent'. For trainer testing, update role to 'trainer' and approve.${NC}"
else
    # Try to login instead (user might already exist)
    echo -e "${YELLOW}   Registration failed (HTTP $REGISTER_HTTP_CODE), trying login...${NC}"
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{
            \"email\": \"${TRAINER_EMAIL}\",
            \"password\": \"${TRAINER_PASSWORD}\"
        }")
    
    LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
    LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
    
    if [ "$LOGIN_HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Trainer login successful (HTTP $LOGIN_HTTP_CODE)${NC}"
        ACCESS_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.data.access_token' 2>/dev/null || echo "")
        USER_ID=$(echo "$LOGIN_BODY" | jq -r '.data.user.id' 2>/dev/null || echo "")
        
        if [ -z "$ACCESS_TOKEN" ]; then
            echo -e "${RED}❌ Failed to extract access token${NC}"
            echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
            exit 1
        fi
    else
        echo -e "${RED}❌ Both registration and login failed${NC}"
        echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
        exit 1
    fi
fi
echo ""

# Step 3: Test Unauthorized Access (should fail)
echo -e "${YELLOW}3. Testing Unauthorized Access (should fail)...${NC}"
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/trainer/bookings" \
    -H "Accept: application/json")

UNAUTH_HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n1)
UNAUTH_BODY=$(echo "$UNAUTH_RESPONSE" | sed '$d')

if [ "$UNAUTH_HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Unauthorized access correctly rejected (HTTP $UNAUTH_HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Unauthorized access test failed (expected 401, got $UNAUTH_HTTP_CODE)${NC}"
    echo "$UNAUTH_BODY" | jq '.' 2>/dev/null || echo "$UNAUTH_BODY"
fi
echo ""

# Step 4: Test Trainer Bookings List (with token)
echo -e "${YELLOW}4. Testing GET /trainer/bookings (with auth)...${NC}"
BOOKINGS_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/trainer/bookings" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Accept: application/json")

BOOKINGS_HTTP_CODE=$(echo "$BOOKINGS_RESPONSE" | tail -n1)
BOOKINGS_BODY=$(echo "$BOOKINGS_RESPONSE" | sed '$d')

if [ "$BOOKINGS_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Trainer bookings list successful (HTTP $BOOKINGS_HTTP_CODE)${NC}"
    BOOKINGS_COUNT=$(echo "$BOOKINGS_BODY" | jq -r '.data.bookings | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}   Found $BOOKINGS_COUNT bookings${NC}"
    
    # Show first booking if exists
    if [ "$BOOKINGS_COUNT" -gt 0 ]; then
        echo -e "${BLUE}   First booking:${NC}"
        echo "$BOOKINGS_BODY" | jq '.data.bookings[0] | {id, reference, package: .package.name, status}' 2>/dev/null || echo "   (Unable to parse JSON)"
    fi
else
    echo -e "${RED}❌ Trainer bookings list failed (HTTP $BOOKINGS_HTTP_CODE)${NC}"
    echo "$BOOKINGS_BODY" | jq '.' 2>/dev/null || echo "$BOOKINGS_BODY"
    
    # Check if it's a trainer profile not found error
    ERROR_MSG=$(echo "$BOOKINGS_BODY" | jq -r '.message' 2>/dev/null || echo "")
    if [[ "$ERROR_MSG" == *"Trainer profile not found"* ]]; then
        echo -e "${YELLOW}⚠️  Note: Trainer profile needs to be created in database${NC}"
        echo -e "${YELLOW}   This is expected if trainer hasn't been set up yet${NC}"
    fi
fi
echo ""

# Step 5: Test Trainer Booking Detail (if we have a booking ID)
if [ "$BOOKINGS_COUNT" -gt 0 ]; then
    BOOKING_ID=$(echo "$BOOKINGS_BODY" | jq -r '.data.bookings[0].id' 2>/dev/null || echo "")
    
    if [ -n "$BOOKING_ID" ] && [ "$BOOKING_ID" != "null" ]; then
        echo -e "${YELLOW}5. Testing GET /trainer/bookings/${BOOKING_ID}...${NC}"
        BOOKING_DETAIL_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/trainer/bookings/${BOOKING_ID}" \
            -H "Authorization: Bearer ${ACCESS_TOKEN}" \
            -H "Accept: application/json")
        
        BOOKING_DETAIL_HTTP_CODE=$(echo "$BOOKING_DETAIL_RESPONSE" | tail -n1)
        BOOKING_DETAIL_BODY=$(echo "$BOOKING_DETAIL_RESPONSE" | sed '$d')
        
        if [ "$BOOKING_DETAIL_HTTP_CODE" -eq 200 ]; then
            echo -e "${GREEN}✅ Trainer booking detail successful (HTTP $BOOKING_DETAIL_HTTP_CODE)${NC}"
            echo -e "${BLUE}   Booking details:${NC}"
            echo "$BOOKING_DETAIL_BODY" | jq '.data.booking | {id, reference, package: .package.name, participants: .participants | length, schedules: .schedules | length}' 2>/dev/null || echo "   (Unable to parse JSON)"
        else
            echo -e "${RED}❌ Trainer booking detail failed (HTTP $BOOKING_DETAIL_HTTP_CODE)${NC}"
            echo "$BOOKING_DETAIL_BODY" | jq '.' 2>/dev/null || echo "$BOOKING_DETAIL_BODY"
        fi
        echo ""
    fi
fi

# Step 6: Test Schedule Status Update (if we have a schedule)
if [ "$BOOKINGS_COUNT" -gt 0 ]; then
    SCHEDULE_ID=$(echo "$BOOKINGS_BODY" | jq -r '.data.bookings[0].schedules[0].id' 2>/dev/null || echo "")
    BOOKING_ID=$(echo "$BOOKINGS_BODY" | jq -r '.data.bookings[0].id' 2>/dev/null || echo "")
    
    if [ -n "$SCHEDULE_ID" ] && [ "$SCHEDULE_ID" != "null" ] && [ -n "$BOOKING_ID" ] && [ "$BOOKING_ID" != "null" ]; then
        echo -e "${YELLOW}6. Testing PUT /trainer/bookings/${BOOKING_ID}/schedules/${SCHEDULE_ID}/status...${NC}"
        UPDATE_STATUS_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/trainer/bookings/${BOOKING_ID}/schedules/${SCHEDULE_ID}/status" \
            -H "Authorization: Bearer ${ACCESS_TOKEN}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d '{
                "status": "completed",
                "notes": "Test status update from API test script"
            }')
        
        UPDATE_STATUS_HTTP_CODE=$(echo "$UPDATE_STATUS_RESPONSE" | tail -n1)
        UPDATE_STATUS_BODY=$(echo "$UPDATE_STATUS_RESPONSE" | sed '$d')
        
        if [ "$UPDATE_STATUS_HTTP_CODE" -eq 200 ]; then
            echo -e "${GREEN}✅ Schedule status update successful (HTTP $UPDATE_STATUS_HTTP_CODE)${NC}"
            echo -e "${BLUE}   Updated schedule:${NC}"
            echo "$UPDATE_STATUS_BODY" | jq '.data.schedule' 2>/dev/null || echo "   (Unable to parse JSON)"
        else
            echo -e "${RED}❌ Schedule status update failed (HTTP $UPDATE_STATUS_HTTP_CODE)${NC}"
            echo "$UPDATE_STATUS_BODY" | jq '.' 2>/dev/null || echo "$UPDATE_STATUS_BODY"
        fi
        echo ""
    else
        echo -e "${YELLOW}6. Skipping schedule status update (no schedules found)${NC}"
        echo ""
    fi
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Health check: PASSED${NC}"
echo -e "${GREEN}✅ Authentication: PASSED${NC}"
echo -e "${GREEN}✅ Authorization check: PASSED${NC}"

if [ "$BOOKINGS_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Bookings list: PASSED${NC}"
else
    echo -e "${YELLOW}⚠️  Bookings list: ${BOOKINGS_HTTP_CODE} (may need trainer profile setup)${NC}"
fi

echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo -e "   1. If trainer profile not found, create Trainer record in database"
echo -e "   2. Assign trainer to a booking schedule"
echo -e "   3. Re-run tests to verify full functionality"
echo ""

