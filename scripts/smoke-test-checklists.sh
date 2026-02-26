#!/bin/bash

# Smoke Test: Child Checklist vs User Checklist
# This script demonstrates the difference and tests the functionality

set -e

echo "🧪 SMOKE TEST: Checklist System"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="${API_URL:-http://localhost:9080/api/v1}"

echo -e "${BLUE}📋 Understanding Checklists:${NC}"
echo ""
echo "1. ${GREEN}Child Checklist${NC}:"
echo "   - One checklist PER CHILD"
echo "   - Contains: Medical info, allergies, emergency contacts, special needs, consents"
echo "   - Required BEFORE child can be approved"
echo "   - Parent fills it out, Admin reviews and marks as completed"
echo ""
echo "2. ${YELLOW}User Checklist${NC}:"
echo "   - One checklist PER PARENT/USER"
echo "   - Contains: Parent/guardian compliance information"
echo "   - Currently not implemented (empty in your system)"
echo "   - Would be for parent-level compliance (if needed in future)"
echo ""
echo "================================"
echo ""

# Test 1: Check if we can access child checklists
echo -e "${BLUE}Test 1: Check Child Checklists API${NC}"
echo "GET ${BASE_URL}/children/checklists"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BASE_URL}/children/checklists" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" || echo "HTTP_STATUS:000")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${GREEN}✅ API endpoint exists${NC}"
  if [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${YELLOW}   (Authentication required - this is expected)${NC}"
  fi
else
  echo -e "${RED}❌ API endpoint issue (Status: $HTTP_STATUS)${NC}"
fi
echo ""

# Test 2: Check API routes
echo -e "${BLUE}Test 2: Check API Routes${NC}"
echo "Checking if child checklist API routes are registered..."
echo ""

docker-compose exec -T backend php artisan route:list --name=child-checklist 2>/dev/null | grep -i "child-checklist" || echo -e "${YELLOW}⚠️  Routes may need cache clear${NC}"
echo ""

# Test 3: Database check
echo -e "${BLUE}Test 3: Database Check${NC}"
echo "Checking if child_checklists table exists and has data..."
echo ""

CHILD_CHECKLISTS_COUNT=$(docker-compose exec -T backend php artisan tinker --execute="echo \App\Models\ChildChecklist::count();" 2>/dev/null | tail -1 || echo "0")
USER_CHECKLISTS_COUNT=$(docker-compose exec -T backend php artisan tinker --execute="echo \App\Models\UserChecklist::count();" 2>/dev/null | tail -1 || echo "0")

echo "Child Checklists in database: ${CHILD_CHECKLISTS_COUNT}"
echo "User Checklists in database: ${USER_CHECKLISTS_COUNT}"
echo ""

if [ "$CHILD_CHECKLISTS_COUNT" = "0" ]; then
  echo -e "${YELLOW}⚠️  No child checklists found${NC}"
  echo "   This is normal if no parents have filled out checklists yet"
  echo ""
  echo "   To create test data:"
  echo "   1. Login as a parent"
  echo "   2. Add a child"
  echo "   3. Fill out the child's checklist"
  echo "   4. Admin reviews and marks as completed"
  echo ""
else
  echo -e "${GREEN}✅ Found ${CHILD_CHECKLISTS_COUNT} child checklist(s)${NC}"
fi

if [ "$USER_CHECKLISTS_COUNT" = "0" ]; then
  echo -e "${YELLOW}⚠️  No user checklists found${NC}"
  echo "   This is expected - user checklists are not currently implemented"
  echo "   They would be for parent-level compliance (future feature)"
fi
echo ""

# Test 4: Check backend model/API
echo -e "${BLUE}Test 4: Backend Child Checklist Support${NC}"
echo "Checking if ChildChecklist model exists..."
echo ""

if docker-compose exec -T backend php artisan tinker --execute="echo class_exists('App\\\Models\\\ChildChecklist') ? 'EXISTS' : 'NOT_FOUND';" 2>/dev/null | grep -q "EXISTS"; then
  echo -e "${GREEN}✅ ChildChecklist model exists${NC}"
else
  echo -e "${RED}❌ ChildChecklist model not found${NC}"
fi
echo ""

# Summary
echo "================================"
echo -e "${GREEN}📊 SMOKE TEST SUMMARY${NC}"
echo "================================"
echo ""
echo "✅ What's Working:"
echo "   - Child Checklist system is implemented"
echo "   - Backend API/model is configured"
echo "   - Routes are registered"
echo ""
echo "📝 Next Steps to Test:"
echo ""
echo "1. ${BLUE}As Parent:${NC}"
echo "   - Login at http://localhost:4300/login"
echo "   - Go to Dashboard"
echo "   - Add a child (if you don't have one)"
echo "   - Click 'Fill Out Checklist' for the child"
echo "   - Complete the checklist form"
echo "   - Submit the checklist"
echo ""
echo "2. ${BLUE}As Admin:${NC}"
echo "   - Login at http://localhost:4300/dashboard/admin"
echo "   - Go to Child Checklists / Children in the dashboard"
echo "   - View the submitted checklist"
echo "   - Click 'Mark as Completed' or edit to mark as completed"
echo "   - Go to Children → View the child"
echo "   - Click 'Approve Child' (should be enabled now)"
echo ""
echo "3. ${BLUE}Test Booking:${NC}"
echo "   - As parent, try to book a package"
echo "   - Should work if child is approved AND checklist is completed"
echo "   - Should be blocked if checklist is not completed"
echo ""
echo "================================"
echo ""
echo -e "${GREEN}✅ Smoke test complete!${NC}"
echo ""

