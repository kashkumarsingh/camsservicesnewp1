#!/bin/bash

# Test Registration & Approval Flow
# This script tests the complete registration and approval system

set -e

API_URL="${API_URL:-http://localhost:9080/api/v1}"
echo "Testing API at: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH=$(curl -s "$API_URL/health" || echo "FAILED")
if [[ "$HEALTH" == *"status"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "$HEALTH"
fi
echo ""

# Test 2: Register User
echo -e "${YELLOW}Test 2: Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Parent",
    "email": "testparent'$(date +%s)'@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "07123456789",
    "address": "123 Test Street",
    "postcode": "IG9 5BT"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.access_token' 2>/dev/null || echo "")
if [[ -n "$TOKEN" && "$TOKEN" != "null" ]]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Registration failed${NC}"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo -e "${YELLOW}Test 3: Get Current User${NC}"
USER_RESPONSE=$(curl -s -X GET "$API_URL/auth/user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$USER_RESPONSE" | jq '.' 2>/dev/null || echo "$USER_RESPONSE"

APPROVAL_STATUS=$(echo "$USER_RESPONSE" | jq -r '.data.user.approval_status' 2>/dev/null || echo "")
if [[ "$APPROVAL_STATUS" == "pending" ]]; then
    echo -e "${GREEN}✓ User approval status is 'pending'${NC}"
else
    echo -e "${RED}✗ User approval status is not 'pending': $APPROVAL_STATUS${NC}"
fi
echo ""

# Test 4: Add Child
echo -e "${YELLOW}Test 4: Add Child${NC}"
CHILD_RESPONSE=$(curl -s -X POST "$API_URL/children" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Child",
    "age": 8,
    "date_of_birth": "2016-01-01"
  }')

echo "$CHILD_RESPONSE" | jq '.' 2>/dev/null || echo "$CHILD_RESPONSE"

CHILD_ID=$(echo "$CHILD_RESPONSE" | jq -r '.data.child.id' 2>/dev/null || echo "")
if [[ -n "$CHILD_ID" && "$CHILD_ID" != "null" ]]; then
    echo -e "${GREEN}✓ Child created successfully${NC}"
    echo "Child ID: $CHILD_ID"
else
    echo -e "${RED}✗ Child creation failed${NC}"
    exit 1
fi
echo ""

# Test 5: List Children
echo -e "${YELLOW}Test 5: List Children${NC}"
CHILDREN_RESPONSE=$(curl -s -X GET "$API_URL/children" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$CHILDREN_RESPONSE" | jq '.' 2>/dev/null || echo "$CHILDREN_RESPONSE"

CHILDREN_COUNT=$(echo "$CHILDREN_RESPONSE" | jq -r '.data.children | length' 2>/dev/null || echo "0")
if [[ "$CHILDREN_COUNT" -gt 0 ]]; then
    echo -e "${GREEN}✓ Children list retrieved: $CHILDREN_COUNT child(ren)${NC}"
else
    echo -e "${RED}✗ No children found${NC}"
fi
echo ""

# Test 6: Save Checklist
echo -e "${YELLOW}Test 6: Save Child Checklist${NC}"
CHECKLIST_RESPONSE=$(curl -s -X POST "$API_URL/children/$CHILD_ID/checklist" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emergency_contact_name": "Emergency Contact",
    "emergency_contact_phone": "07123456789",
    "consent_photography": true,
    "consent_medical_treatment": true
  }')

echo "$CHECKLIST_RESPONSE" | jq '.' 2>/dev/null || echo "$CHECKLIST_RESPONSE"

CHECKLIST_ID=$(echo "$CHECKLIST_RESPONSE" | jq -r '.data.checklist.id' 2>/dev/null || echo "")
if [[ -n "$CHECKLIST_ID" && "$CHECKLIST_ID" != "null" ]]; then
    echo -e "${GREEN}✓ Checklist saved successfully${NC}"
else
    echo -e "${RED}✗ Checklist save failed${NC}"
fi
echo ""

# Test 7: Get Checklist
echo -e "${YELLOW}Test 7: Get Child Checklist${NC}"
GET_CHECKLIST_RESPONSE=$(curl -s -X GET "$API_URL/children/$CHILD_ID/checklist" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$GET_CHECKLIST_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_CHECKLIST_RESPONSE"

if [[ "$GET_CHECKLIST_RESPONSE" == *"checklist"* ]]; then
    echo -e "${GREEN}✓ Checklist retrieved successfully${NC}"
else
    echo -e "${RED}✗ Checklist retrieval failed${NC}"
fi
echo ""

echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Approve user in Filament admin panel"
echo "2. Approve child in Filament admin panel"
echo "3. Test booking flow"

