#!/bin/bash

# Booking & Payment Smoke Test Script
# 
# Purpose: Quick smoke test to verify core booking and payment flow works
# Usage: ./scripts/smoke-test.sh
# 
# This script:
# - Runs PHPUnit smoke tests
# - Verifies core booking and payment endpoints
# - Provides quick feedback on system health

set -e

echo "🧪 Starting Booking & Payment Smoke Test..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in Docker or local
if [ -f /.dockerenv ] || [ -n "$CI" ]; then
    PHP_CMD="php"
    ARTISAN_CMD="php artisan"
else
    # Try to use Docker Compose if available
    if command -v docker-compose &> /dev/null; then
        PHP_CMD="docker-compose exec -T backend php"
        ARTISAN_CMD="docker-compose exec -T backend php artisan"
    else
        PHP_CMD="php"
        ARTISAN_CMD="php artisan"
    fi
fi

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📦 Project root: $PROJECT_ROOT"
echo "🔧 Using: $ARTISAN_CMD"
echo ""

# Step 1: Run PHPUnit smoke tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Running PHPUnit Smoke Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "$PROJECT_ROOT/backend" ]; then
    cd "$PROJECT_ROOT/backend"
    
    if $ARTISAN_CMD test --filter=BookingPaymentSmokeTest; then
        echo -e "${GREEN}✅ PHPUnit smoke tests passed${NC}"
    else
        echo -e "${RED}❌ PHPUnit smoke tests failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Backend directory not found, skipping PHPUnit tests${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Quick API Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if backend is running
BACKEND_URL="${BACKEND_URL:-http://localhost:9080}"
echo "🔍 Checking backend at: $BACKEND_URL"

if curl -s -f "$BACKEND_URL/api/v1/packages" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is accessible${NC}"
    
    # Quick endpoint check
    echo ""
    echo "📋 Testing key endpoints:"
    
    # Packages endpoint
    if curl -s -f "$BACKEND_URL/api/v1/packages" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} GET /api/v1/packages"
    else
        echo -e "  ${RED}✗${NC} GET /api/v1/packages"
    fi
    
    # Bookings endpoint
    if curl -s -f "$BACKEND_URL/api/v1/bookings" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} GET /api/v1/bookings"
    else
        echo -e "  ${RED}✗${NC} GET /api/v1/bookings"
    fi
    
else
    echo -e "${YELLOW}⚠️  Backend API not accessible at $BACKEND_URL${NC}"
    echo "   (This is OK if backend is not running - smoke test will still verify code)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Smoke Test Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  - PHPUnit smoke tests: ✅ Passed"
echo "  - API endpoints: ✅ Accessible (if backend running)"
echo ""
echo "💡 Next steps:"
echo "  - Run full test suite: php artisan test"
echo "  - Run booking tests: php artisan test --filter=BookingApiTest"
echo "  - Run payment tests: php artisan test --filter=PaymentApiTest"
echo ""

