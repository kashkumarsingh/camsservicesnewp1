#!/bin/bash
# Check Render Environment Variables
# This script helps verify that NEXT_PUBLIC_API_URL is set correctly

echo "=========================================="
echo "Render Environment Variable Checker"
echo "=========================================="
echo ""

echo "⚠️  IMPORTANT: NEXT_PUBLIC_API_URL must be set in Render BEFORE building!"
echo ""
echo "To fix the localhost:9080 issue:"
echo ""
echo "1. Go to Render Dashboard → Your Frontend Service (cams-frontend-1q6w)"
echo "2. Click 'Environment' tab"
echo "3. Add/Update:"
echo "   Key:   NEXT_PUBLIC_API_URL"
echo "   Value: https://cams-backend-1q6w.onrender.com/api/v1"
echo "4. Click 'Save Changes'"
echo "5. Go to 'Manual Deploy' → 'Clear build cache & deploy'"
echo "   OR push a new commit to trigger rebuild"
echo ""
echo "=========================================="
echo "Current Environment Variables (if available):"
echo "=========================================="

if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "✅ NEXT_PUBLIC_API_URL = $NEXT_PUBLIC_API_URL"
else
  echo "❌ NEXT_PUBLIC_API_URL is NOT set!"
  echo "   This will cause API calls to go to localhost:9080"
fi

if [ -n "$API_URL" ]; then
  echo "✅ API_URL = $API_URL"
else
  echo "⚠️  API_URL is not set (using NEXT_PUBLIC_API_URL as fallback)"
fi

echo ""
echo "=========================================="
echo "Backend URL Check:"
echo "=========================================="

BACKEND_URL="https://cams-backend-1q6w.onrender.com/api/v1/health"
echo "Testing backend health endpoint..."
if curl -s -f "$BACKEND_URL" > /dev/null 2>&1; then
  echo "✅ Backend is accessible at: $BACKEND_URL"
else
  echo "❌ Backend is NOT accessible at: $BACKEND_URL"
  echo "   Check if backend service is running on Render"
fi

echo ""
echo "=========================================="

