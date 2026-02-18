#!/bin/bash
# FAANG-Level Validation Script
# Validates environment before starting development
# Run this before docker compose up

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ERRORS=0
WARNINGS=0

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Environment Validation                                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Docker
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running"
else
    print_success "Docker is running"
fi

# Check Docker Compose
if ! docker compose version >/dev/null 2>&1 && ! docker-compose version >/dev/null 2>&1; then
    print_error "Docker Compose is not available"
else
    print_success "Docker Compose is available"
fi

# Check for generated files in Git
cd "$PROJECT_ROOT"
GENERATED_IN_GIT=$(git ls-files | grep -E "(next-env\.d\.ts|\.next/)" || true)
if [ -n "$GENERATED_IN_GIT" ]; then
    print_error "Generated files found in Git:"
    echo "$GENERATED_IN_GIT"
    print_info "Run: git rm --cached <file> to remove from Git"
else
    print_success "No generated files in Git"
fi

# Check .gitignore
if git check-ignore -q frontend/next-env.d.ts 2>/dev/null; then
    print_success "next-env.d.ts is in .gitignore"
else
    print_warning "next-env.d.ts is not in .gitignore"
fi

# Check ports
PORTS=(4300 9080 33306)
PORT_NAMES=("Frontend" "Backend" "MySQL")

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}
    
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "$NAME port $PORT is in use"
        else
            print_success "$NAME port $PORT is available"
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -an 2>/dev/null | grep -q ":$PORT.*LISTEN"; then
            print_warning "$NAME port $PORT is in use"
        else
            print_success "$NAME port $PORT is available"
        fi
    fi
done

# Summary
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi

