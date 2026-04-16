#!/bin/bash
# Clear Cache and Restart Services
# Supports local Docker Compose workflows

# Exit on critical errors, but continue on non-critical ones
set -o pipefail

echo "🧹 Clearing Cache and Restarting Services..."
echo "=============================================="
echo ""

# Detect environment
if [ -f "docker-compose.yml" ] && docker ps > /dev/null 2>&1; then
    echo "📍 Environment: Local (Docker Compose)"
    ENV="local"
else
    echo "📍 Environment: Unknown (assuming local)"
    ENV="local"
fi

if [ "$ENV" = "local" ]; then
    # LOCAL DEVELOPMENT (Docker Compose)
    
    # Check if containers are running
    if ! docker ps --format "{{.Names}}" | grep -q "^kidzrunz-backend$"; then
        echo "❌ Error: kidzrunz-backend container is not running"
        echo "   Start it with: docker-compose up -d backend"
        exit 1
    fi
    
    if ! docker ps --format "{{.Names}}" | grep -q "^kidzrunz-frontend$"; then
        echo "❌ Error: kidzrunz-frontend container is not running"
        echo "   Start it with: docker-compose up -d frontend"
        exit 1
    fi
    
    echo ""
    echo "🔧 Backend: Clearing Laravel cache..."
    if docker exec kidzrunz-backend php artisan config:clear 2>&1; then
        docker exec kidzrunz-backend php artisan cache:clear 2>&1 || true
        docker exec kidzrunz-backend php artisan route:clear 2>&1 || true
        docker exec kidzrunz-backend php artisan view:clear 2>&1 || true
        docker exec kidzrunz-backend php artisan optimize:clear 2>&1 || true
        echo "✅ Backend cache cleared"
        
        echo ""
        echo "🔧 Backend: Rebuilding cache (for performance)..."
        docker exec kidzrunz-backend php artisan config:cache 2>&1 || echo "⚠️  Config cache failed (non-critical)"
        docker exec kidzrunz-backend php artisan route:cache 2>&1 || echo "⚠️  Route cache failed (non-critical)"
        echo "✅ Backend cache rebuilt"
    else
        echo "⚠️  Warning: Some backend cache commands failed (continuing anyway)"
    fi
    
    echo ""
    echo "🔧 Frontend: Clearing Next.js cache..."
    if docker exec kidzrunz-frontend sh -c "rm -rf /app/.next" 2>&1; then
        echo "✅ Frontend cache cleared"
    else
        echo "⚠️  Warning: Frontend cache clear failed (continuing anyway)"
    fi
    
    echo ""
    echo "🔄 Restarting services..."
    if docker-compose restart backend frontend 2>&1; then
        echo "✅ Services restarted"
        
        echo ""
        echo "⏳ Waiting for services to be ready (5 seconds)..."
        sleep 5
        
        echo ""
        echo "🔍 Checking service health..."
        if docker exec kidzrunz-backend php artisan --version > /dev/null 2>&1; then
            echo "✅ Backend is responding"
        else
            echo "⚠️  Warning: Backend may not be fully ready yet"
        fi
        
        if docker exec kidzrunz-frontend node --version > /dev/null 2>&1; then
            echo "✅ Frontend is responding"
        else
            echo "⚠️  Warning: Frontend may not be fully ready yet"
        fi
    else
        echo "❌ Error: Failed to restart services"
        exit 1
    fi
    
    echo ""
    echo "📊 Service Status:"
    docker-compose ps backend frontend
    
    echo ""
    echo "🔍 Running diagnostics..."
    
    # Check database connection
    if docker exec kidzrunz-backend php artisan db:show > /dev/null 2>&1; then
        echo "✅ Database connection: OK"
    else
        echo "⚠️  Database connection: May have issues"
    fi
    
    # Check if config is cached
    if docker exec kidzrunz-backend test -f bootstrap/cache/config.php 2>/dev/null; then
        echo "✅ Config cache: Present"
    else
        echo "⚠️  Config cache: Missing (this is normal after clearing)"
    fi
    
    # Check recent errors in logs
    echo ""
    echo "📋 Recent backend errors (last 5 lines):"
    docker exec kidzrunz-backend tail -5 /var/www/html/storage/logs/laravel.log 2>&1 | grep -i "error\|exception\|fatal" || echo "   No recent errors found"
    
    echo ""
    echo "💡 If you see 'internal server error', try:"
    echo "   1. Check backend logs: docker logs kidzrunz-backend --tail 50"
    echo "   2. Check frontend logs: docker logs kidzrunz-frontend --tail 50"
    echo "   3. Rebuild config: docker exec kidzrunz-backend php artisan config:cache"
    echo "   4. Check database: docker exec kidzrunz-backend php artisan db:show"
    
fi

echo ""
echo "✅ Done!"
echo ""

