#!/bin/bash
# Setup Render Workspace
# Run this script in your terminal to set up the Render workspace

set -e

echo "🔧 Render Workspace Setup"
echo "========================"
echo ""

# Check if API key is set
if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ RENDER_API_KEY not set"
    echo "   Please run: export RENDER_API_KEY='rnd_...'"
    echo "   Or source ~/.bashrc if you saved it there"
    exit 1
fi

echo "✅ API Key is configured"
echo ""

# Check if render CLI is available
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found in PATH"
    echo "   Please ensure ~/.local/bin is in your PATH"
    exit 1
fi

echo "✅ Render CLI found: $(render --version)"
echo ""

# Verify authentication
echo "🔍 Verifying authentication..."
if render whoami &>/dev/null; then
    echo "✅ Authenticated"
    render whoami | grep -E "Name:|Email:" || true
else
    echo "❌ Authentication failed"
    exit 1
fi

echo ""
echo "📋 Setting workspace..."
echo "   (This will show a list - select your workspace)"
echo ""

# Set workspace (interactive)
render workspace set

echo ""
echo "✅ Workspace set!"
echo ""

# Verify workspace
echo "📊 Current workspace:"
render workspace current

echo ""
echo "📚 Your services (from render.yaml):"
echo "   • cams-backend (Laravel API)"
echo "   • cams-frontend (Next.js)"
echo "   • cams-database (PostgreSQL)"
echo ""

echo "🎉 Setup complete! You can now use:"
echo "   render services list"
echo "   render run --service cams-backend 'php artisan migrate --force'"
echo "   render logs --service cams-backend --tail"

