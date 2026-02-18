#!/bin/bash
# Quick TypeScript Type Check
# Fast check without full build (use for quick validation)

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Quick TypeScript Type Check${NC}"
echo ""

cd "$FRONTEND_DIR"

# Detect environment
if docker ps --format "{{.Names}}" | grep -q "^kidzrunz-frontend$" 2>/dev/null; then
    echo -e "${BLUE}📍 Using Docker container${NC}"
    docker exec kidzrunz-frontend npm run typecheck
else
    echo -e "${BLUE}📍 Using local environment${NC}"
    npm run typecheck
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ No type errors found${NC}"
else
    echo -e "${RED}✗ Type errors found - fix before deploying${NC}"
fi

exit $EXIT_CODE
