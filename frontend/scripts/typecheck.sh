#!/bin/bash
# Type checking script for WSL/Unix environments
# This script runs TypeScript type checking

cd "$(dirname "$0")/.." || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Please run 'npm install' first."
  exit 1
fi

# Check if TypeScript is installed
if [ ! -f "node_modules/.bin/tsc" ]; then
  echo "❌ TypeScript not found. Installing..."
  npm install typescript --save-dev
fi

# Run type checking
echo "🔍 Running TypeScript type checking..."
echo ""
./node_modules/.bin/tsc --noEmit

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Type checking passed! No errors found."
else
  echo ""
  echo "❌ Type checking failed! Please fix the errors above."
fi

exit $EXIT_CODE

