#!/bin/bash

echo "🔨 Testing Production Builds..."
echo "================================"

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FRONTEND_PASSED=false
BACKEND_PASSED=false

# Test Backend Build
echo ""
echo "${YELLOW}1️⃣  Building Backend (Laravel)...${NC}"
echo "-------------------------------------------"
docker-compose -f docker-compose.prod.yml build backend-prod

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Backend build successful!${NC}"
    BACKEND_PASSED=true
else
    echo "${RED}❌ Backend build FAILED!${NC}"
    echo "Fix backend errors before pushing to Render."
fi

# Test Frontend Build
echo ""
echo "${YELLOW}2️⃣  Building Frontend (Next.js 16)...${NC}"
echo "-------------------------------------------"
docker-compose -f docker-compose.prod.yml build frontend-prod

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Frontend build successful!${NC}"
    FRONTEND_PASSED=true
else
    echo "${RED}❌ Frontend build FAILED!${NC}"
    echo "Fix frontend errors before pushing to Render."
fi

# Summary
echo ""
echo "================================"
echo "📊 Build Summary"
echo "================================"
echo "Backend:  $([ "$BACKEND_PASSED" = true ] && echo "${GREEN}✅ PASS${NC}" || echo "${RED}❌ FAIL${NC}")"
echo "Frontend: $([ "$FRONTEND_PASSED" = true ] && echo "${GREEN}✅ PASS${NC}" || echo "${RED}❌ FAIL${NC}")"
echo ""

if [ "$BACKEND_PASSED" = true ] && [ "$FRONTEND_PASSED" = true ]; then
    echo "${GREEN}🎉 All builds successful! Safe to push to Render.${NC}"
    echo ""
    echo "🧪 To test the full stack locally:"
    echo "   docker-compose -f docker-compose.prod.yml up"
    echo ""
    echo "   Frontend: http://localhost:4300"
    echo "   Backend:  http://localhost:9080"
    exit 0
else
    echo "${RED}⚠️  Some builds failed. Fix errors before deploying.${NC}"
    exit 1
fi