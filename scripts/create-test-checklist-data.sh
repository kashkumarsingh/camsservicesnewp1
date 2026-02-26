#!/bin/bash

# Create Test Data for Checklist System
# This script creates a parent, child, and checklist for testing

set -e

echo "🧪 Creating Test Checklist Data"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run the seeder to create test data
echo -e "${BLUE}Step 1: Creating parent user with child and checklist...${NC}"

docker-compose exec -T backend php artisan db:seed --class=Database\\Seeders\\TestChecklistSeeder

echo ""
echo -e "${GREEN}✅ Test data created!${NC}"
echo ""
echo "================================"
echo -e "${BLUE}📋 Test Account Details:${NC}"
echo "================================"
echo ""
echo "Parent Email: ${PARENT_EMAIL}"
echo "Password: ${PARENT_PASSWORD}"
echo ""
echo "Login at: http://localhost:4300/login"
echo ""
echo "================================"
echo ""
echo -e "${YELLOW}📝 What to Test:${NC}"
echo ""
echo "1. ${BLUE}As Parent (Frontend):${NC}"
echo "   - Login with the credentials above"
echo "   - Go to Dashboard"
echo "   - You'll see 'Test Child Checklist' with 'Checklist Submitted' status"
echo "   - Click 'View/Edit Checklist' to see the filled-out form"
echo ""
echo "2. ${BLUE}As Admin:${NC}"
echo "   - Login at http://localhost:4300/dashboard/admin"
echo "   - Go to Child Checklists / Children in the dashboard"
echo "   - You'll see the checklist for 'Test Child Checklist'"
echo "   - Click to view it"
echo "   - Click 'Mark as Completed' button"
echo "   - Go to Children → Find 'Test Child Checklist'"
echo "   - Click 'Approve Child' (button should be enabled now)"
echo ""
echo "3. ${BLUE}Test Booking:${NC}"
echo "   - As parent, try to book a package"
echo "   - Should work if child is approved AND checklist is completed"
echo ""
echo "================================"
echo ""

