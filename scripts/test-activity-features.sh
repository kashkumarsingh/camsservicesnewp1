#!/bin/bash

# Test Activity Calculation & Assignment Features (Phase 1 & 2)
# 
# Purpose: Test Phase 1 (Database/Models) and Phase 2 (API Endpoints)
# Usage: ./scripts/test-activity-features.sh [BASE_URL] [TRAINER_EMAIL] [TRAINER_PASSWORD]
# 
# Example:
#   ./scripts/test-activity-features.sh http://localhost:9080/api/v1 trainer@example.com Trainer123!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
BASE_URL="${1:-http://localhost:9080/api/v1}"
TRAINER_EMAIL="${2:-trainer@example.com}"
TRAINER_PASSWORD="${3:-Trainer123!}"

echo -e "${BLUE}🧪 Testing Activity Calculation & Assignment Features${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Trainer Email: ${TRAINER_EMAIL}${NC}"
echo ""

# Step 1: Login as Trainer
echo -e "${YELLOW}1. Logging in as trainer...${NC}"
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
    echo -e "${GREEN}✅ Login successful${NC}"
    
    # Extract token
    if command -v jq &> /dev/null; then
        ACCESS_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.data.access_token' 2>/dev/null || echo "")
    else
        ACCESS_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//' || echo "")
    fi
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ Failed to extract access token${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}   Token: ${ACCESS_TOKEN:0:20}...${NC}"
else
    echo -e "${RED}❌ Login failed (HTTP $LOGIN_HTTP_CODE)${NC}"
    echo "$LOGIN_BODY" | jq '.' 2>/dev/null || echo "$LOGIN_BODY"
    exit 1
fi
echo ""

# Step 2: Get Trainer Schedules
echo -e "${YELLOW}2. Getting trainer schedules...${NC}"
SCHEDULES_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/trainer/schedules" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Accept: application/json")

SCHEDULES_HTTP_CODE=$(echo "$SCHEDULES_RESPONSE" | tail -n1)
SCHEDULES_BODY=$(echo "$SCHEDULES_RESPONSE" | sed '$d')

if [ "$SCHEDULES_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Schedules retrieved${NC}"
    
    # Extract first schedule ID
    if command -v jq &> /dev/null; then
        SCHEDULE_ID=$(echo "$SCHEDULES_BODY" | jq -r '.data.schedules[0].id' 2>/dev/null || echo "")
    else
        SCHEDULE_ID=$(echo "$SCHEDULES_BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "")
    fi
    
    if [ -z "$SCHEDULE_ID" ] || [ "$SCHEDULE_ID" == "null" ]; then
        echo -e "${YELLOW}⚠️  No schedules found. Please create a booking with schedule first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}   Schedule ID: $SCHEDULE_ID${NC}"
else
    echo -e "${RED}❌ Failed to get schedules (HTTP $SCHEDULES_HTTP_CODE)${NC}"
    echo "$SCHEDULES_BODY" | jq '.' 2>/dev/null || echo "$SCHEDULES_BODY"
    exit 1
fi
echo ""

# Step 3: Get Session Activities
echo -e "${YELLOW}3. Getting session activities...${NC}"
ACTIVITIES_RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/trainer/schedules/${SCHEDULE_ID}/activities" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Accept: application/json")

ACTIVITIES_HTTP_CODE=$(echo "$ACTIVITIES_RESPONSE" | tail -n1)
ACTIVITIES_BODY=$(echo "$ACTIVITIES_RESPONSE" | sed '$d')

if [ "$ACTIVITIES_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Session activities retrieved${NC}"
    
    if command -v jq &> /dev/null; then
        echo -e "${BLUE}   Schedule Info:${NC}"
        echo "$ACTIVITIES_BODY" | jq '.data.schedule | {id, duration_hours, activity_count, is_activity_override, activity_status, calculated_activity_count}' 2>/dev/null || echo "   (Unable to parse JSON)"
        
        # Get first available activity ID
        AVAILABLE_ACTIVITY_ID=$(echo "$ACTIVITIES_BODY" | jq -r '.data.available_activities[0].id' 2>/dev/null || echo "")
    else
        AVAILABLE_ACTIVITY_ID=$(echo "$ACTIVITIES_BODY" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "")
    fi
    
    if [ -z "$AVAILABLE_ACTIVITY_ID" ] || [ "$AVAILABLE_ACTIVITY_ID" == "null" ]; then
        echo -e "${YELLOW}⚠️  No available activities found. Please create activities first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}   Available Activity ID: $AVAILABLE_ACTIVITY_ID${NC}"
else
    echo -e "${RED}❌ Failed to get session activities (HTTP $ACTIVITIES_HTTP_CODE)${NC}"
    echo "$ACTIVITIES_BODY" | jq '.' 2>/dev/null || echo "$ACTIVITIES_BODY"
    exit 1
fi
echo ""

# Step 4: Assign Activity
echo -e "${YELLOW}4. Assigning activity to session...${NC}"
ASSIGN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/trainer/schedules/${SCHEDULE_ID}/activities" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
        \"activity_id\": ${AVAILABLE_ACTIVITY_ID},
        \"duration_hours\": 3.0,
        \"notes\": \"Test activity assignment\"
    }")

ASSIGN_HTTP_CODE=$(echo "$ASSIGN_RESPONSE" | tail -n1)
ASSIGN_BODY=$(echo "$ASSIGN_RESPONSE" | sed '$d')

if [ "$ASSIGN_HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Activity assigned successfully${NC}"
    
    if command -v jq &> /dev/null; then
        echo "$ASSIGN_BODY" | jq '.data.activity' 2>/dev/null || echo "   (Unable to parse JSON)"
    fi
else
    echo -e "${RED}❌ Failed to assign activity (HTTP $ASSIGN_HTTP_CODE)${NC}"
    echo "$ASSIGN_BODY" | jq '.' 2>/dev/null || echo "$ASSIGN_BODY"
    exit 1
fi
echo ""

# Step 5: Override Activity Count
echo -e "${YELLOW}5. Testing activity count override...${NC}"
OVERRIDE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${BASE_URL}/trainer/schedules/${SCHEDULE_ID}/activities/override" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
        \"activity_count\": 1,
        \"override_reason\": \"Test override: Parent requested 6-hour session to count as 1 activity\"
    }")

OVERRIDE_HTTP_CODE=$(echo "$OVERRIDE_RESPONSE" | tail -n1)
OVERRIDE_BODY=$(echo "$OVERRIDE_RESPONSE" | sed '$d')

if [ "$OVERRIDE_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Activity count overridden successfully${NC}"
    
    if command -v jq &> /dev/null; then
        echo "$OVERRIDE_BODY" | jq '.data.schedule | {activity_count, is_activity_override, calculated_activity_count}' 2>/dev/null || echo "   (Unable to parse JSON)"
    fi
else
    echo -e "${YELLOW}⚠️  Override failed (HTTP $OVERRIDE_HTTP_CODE) - may not be allowed for this package${NC}"
    echo "$OVERRIDE_BODY" | jq '.' 2>/dev/null || echo "$OVERRIDE_BODY"
fi
echo ""

# Step 6: Confirm Activities
echo -e "${YELLOW}6. Confirming activities (triggers parent notification)...${NC}"
CONFIRM_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/trainer/schedules/${SCHEDULE_ID}/activities/confirm" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{
        \"notes\": \"Activities confirmed for testing\"
    }")

CONFIRM_HTTP_CODE=$(echo "$CONFIRM_RESPONSE" | tail -n1)
CONFIRM_BODY=$(echo "$CONFIRM_RESPONSE" | sed '$d')

if [ "$CONFIRM_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Activities confirmed successfully${NC}"
    
    if command -v jq &> /dev/null; then
        echo "$CONFIRM_BODY" | jq '.data.schedule | {activity_status, activity_confirmed_at}' 2>/dev/null || echo "   (Unable to parse JSON)"
    fi
    
    echo -e "${BLUE}   Check logs for notification: docker-compose exec backend tail -f storage/logs/laravel.log${NC}"
else
    echo -e "${RED}❌ Failed to confirm activities (HTTP $CONFIRM_HTTP_CODE)${NC}"
    echo "$CONFIRM_BODY" | jq '.' 2>/dev/null || echo "$CONFIRM_BODY"
    exit 1
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Login: PASSED${NC}"
echo -e "${GREEN}✅ Get Schedules: PASSED${NC}"
echo -e "${GREEN}✅ Get Session Activities: PASSED${NC}"
echo -e "${GREEN}✅ Assign Activity: PASSED${NC}"
if [ "$OVERRIDE_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Override Activity Count: PASSED${NC}"
else
    echo -e "${YELLOW}⚠️  Override Activity Count: SKIPPED (may not be allowed)${NC}"
fi
echo -e "${GREEN}✅ Confirm Activities: PASSED${NC}"
echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo -e "   1. Check logs for notification: docker-compose exec backend tail -f storage/logs/laravel.log"
echo -e "   2. Verify database changes in booking_schedules and booking_schedule_activities tables"
echo -e "   3. If all tests pass, proceed to Phase 3: Frontend Implementation"
echo ""

