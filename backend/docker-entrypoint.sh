#!/bin/sh
set -e

# Reverb-only mode (Render WebSocket service): listen on PORT, use ping for keepalive
if [ "$RUN_MODE" = "reverb" ]; then
    export REVERB_PORT="${PORT:-8080}"
    export REVERB_HOST="${REVERB_HOST:-0.0.0.0}"
    echo "Reverb mode → starting WebSocket server on port $REVERB_PORT (Render WSS)"
    exec php artisan reverb:start
fi

# Function to run migrations with error handling
run_migrations() {
    php artisan migrate --force --no-interaction 2>&1 || {
        echo "⚠️  Some migrations failed (this may be expected if tables already exist)"
        echo "Continuing with startup..."
        return 0
    }
}

echo "Starting CAMS Backend..."

# PORT is always provided by Railway/Render/Fly.io
export PORT=${PORT:-80}

# Smart APP_URL detection (Railway → Render → Fallback)
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export APP_URL="https://$RAILWAY_PUBLIC_DOMAIN"
    echo "Railway detected → APP_URL = $APP_URL"
elif [ -n "$RENDER_EXTERNAL_URL" ]; then
    export APP_URL=$(echo "$RENDER_EXTERNAL_URL" | sed 's|^http://|https://|')
    echo "Render detected → APP_URL = $APP_URL"
else
    export APP_URL="${APP_URL:-http://localhost}"
    echo "Fallback → APP_URL = $APP_URL"
fi

# Safe defaults for Railway (ephemeral filesystem)
export CACHE_DRIVER=${CACHE_DRIVER:-database}
export SESSION_DRIVER=${SESSION_DRIVER:-database}
export QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}

# Auto-configure session domain for Render.com (fixes 419 CSRF errors)
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    # Extract domain from Render URL (e.g., https://cams-backend-oj5x.onrender.com)
    RENDER_DOMAIN=$(echo "$RENDER_EXTERNAL_URL" | sed 's|https\?://||' | sed 's|/.*||')
    # Use EXACT domain (not .onrender.com) for better browser cookie compatibility
    # Some browsers reject cookies with wildcard domains like .onrender.com
    if echo "$RENDER_DOMAIN" | grep -q "\.onrender\.com$"; then
        # If SESSION_DOMAIN not explicitly set, use exact domain for better compatibility
        if [ -z "$SESSION_DOMAIN" ]; then
            export SESSION_DOMAIN="$RENDER_DOMAIN"
            echo "Render detected → SESSION_DOMAIN = $SESSION_DOMAIN (exact domain for cookie compatibility)"
        else
            echo "Render detected → SESSION_DOMAIN = $SESSION_DOMAIN (using explicit value)"
        fi
    fi
    # Auto-configure Sanctum stateful domains if not set
    if [ -z "$SANCTUM_STATEFUL_DOMAINS" ]; then
        # Try to detect frontend URL from environment or use backend domain
        FRONTEND_DOMAIN="${FRONTEND_URL:-$RENDER_DOMAIN}"
        FRONTEND_DOMAIN=$(echo "$FRONTEND_DOMAIN" | sed 's|https\?://||' | sed 's|/.*||')
        export SANCTUM_STATEFUL_DOMAINS="$FRONTEND_DOMAIN,$RENDER_DOMAIN"
        echo "Auto-configured → SANCTUM_STATEFUL_DOMAINS = $SANCTUM_STATEFUL_DOMAINS"
    fi
fi

# Auto-configure session domain for Railway
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export SESSION_DOMAIN=${SESSION_DOMAIN:-.railway.app}
    echo "Railway detected → SESSION_DOMAIN = $SESSION_DOMAIN"
fi

# Set secure cookie defaults for production
if [ "$APP_ENV" = "production" ]; then
    export SESSION_SECURE_COOKIE=${SESSION_SECURE_COOKIE:-true}
    export SESSION_SAME_SITE=${SESSION_SAME_SITE:-lax}
fi

# Configure PHP-FPM pool sizing (prevents pm.max_children warnings)
export PHP_FPM_PM_MAX_CHILDREN=${PHP_FPM_PM_MAX_CHILDREN:-16}
export PHP_FPM_PM_START_SERVERS=${PHP_FPM_PM_START_SERVERS:-6}
export PHP_FPM_PM_MIN_SPARE_SERVERS=${PHP_FPM_PM_MIN_SPARE_SERVERS:-4}
export PHP_FPM_PM_MAX_SPARE_SERVERS=${PHP_FPM_PM_MAX_SPARE_SERVERS:-8}
export PHP_FPM_PM_MAX_REQUESTS=${PHP_FPM_PM_MAX_REQUESTS:-500}

cat <<EOF >/usr/local/etc/php-fpm.d/zz-cams-overrides.conf
[www]
pm = dynamic
pm.max_children = ${PHP_FPM_PM_MAX_CHILDREN}
pm.start_servers = ${PHP_FPM_PM_START_SERVERS}
pm.min_spare_servers = ${PHP_FPM_PM_MIN_SPARE_SERVERS}
pm.max_spare_servers = ${PHP_FPM_PM_MAX_SPARE_SERVERS}
pm.max_requests = ${PHP_FPM_PM_MAX_REQUESTS}
EOF

# Inject PORT into Nginx config
# Use mktemp for proper temporary file handling (FAANG-level best practice)
NGINX_TMP=$(mktemp)
envsubst '$PORT' < /etc/nginx/http.d/default.conf > "$NGINX_TMP"
mv "$NGINX_TMP" /etc/nginx/http.d/default.conf

# Worker-only mode (Render): needs DB and migrations before running queue:work
if [ "$RUN_MODE" = "worker" ]; then
    echo "Waiting for database..."
    MAX_RETRIES=40
    COUNT=0
    until php artisan db:monitor >/dev/null 2>&1; do
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $MAX_RETRIES ]; then echo "Database connection failed!"; exit 1; fi
        echo "Database not ready yet... ($COUNT/$MAX_RETRIES)"
        sleep 2
    done
    echo "Database connected!"
    php artisan migrate --force --no-interaction 2>&1 || true
    echo "Worker mode → starting queue:work (database)"
    exec php artisan queue:work database --sleep=3 --tries=3 --timeout=90 --verbose --no-interaction
fi

# Scheduler-only mode (Render cron): needs DB, then run schedule:run once
if [ "$RUN_MODE" = "scheduler" ]; then
    echo "Waiting for database..."
    MAX_RETRIES=40
    COUNT=0
    until php artisan db:monitor >/dev/null 2>&1; do
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $MAX_RETRIES ]; then echo "Database connection failed!"; exit 1; fi
        echo "Database not ready yet... ($COUNT/$MAX_RETRIES)"
        sleep 2
    done
    echo "Database connected!"
    php artisan migrate --force --no-interaction 2>&1 || true
    echo "Scheduler mode → running schedule:run"
    exec php artisan schedule:run --verbose --no-interaction
fi

# Web mode (default): start Nginx + PHP-FPM first so /health responds immediately (Render health check).
# Run DB wait, migrations, and bootstrap in background so deploy does not time out.
echo "Web mode → starting Nginx first so /health passes; migrations run in background."
php-fpm -D
nginx &
NGINX_PID=$!

(
    echo "[background] Waiting for database..."
    MAX_RETRIES=40
    COUNT=0
    until php artisan db:monitor >/dev/null 2>&1; do
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $MAX_RETRIES ]; then echo "[background] Database connection failed!"; exit 1; fi
        sleep 2
    done
    echo "[background] Database connected. Running migrations..."
    set +e
    php artisan migrate --force --no-interaction 2>&1
    MIGRATION_EXIT=$?
    set -e
    if [ $MIGRATION_EXIT -ne 0 ]; then
        sleep 2
        php artisan migrate --force --no-interaction 2>&1 || true
    fi
    php artisan config:clear || true
    php artisan cache:clear || true
    php artisan route:clear || true
    php artisan view:clear || true
    if [ $MIGRATION_EXIT -eq 0 ]; then
        php artisan db:seed --force --no-interaction || true
    fi
    if [ ! -L public/storage ] && [ ! -d public/storage ]; then
        php artisan storage:link || true
    fi
    php artisan config:cache
    php artisan route:cache || true
    php artisan view:cache || true
    chown -R www-data:www-data storage bootstrap/cache
    chmod -R 775 storage bootstrap/cache
    if [ "${RUN_SCHEDULER_IN_CONTAINER:-true}" = "true" ]; then
        (while true; do php artisan schedule:run --verbose --no-interaction >> /var/log/scheduler.log 2>&1; sleep 60; done) &
    fi
    if [ "${RUN_QUEUE_IN_CONTAINER:-true}" = "true" ]; then
        (while true; do php artisan queue:work database --sleep=3 --tries=3 --max-time=3600 --verbose --no-interaction >> /var/log/queue.log 2>&1; sleep 5; done) &
    fi
    echo "[background] Bootstrap complete."
) &

echo "✓ Nginx and PHP-FPM running; /health responds immediately. Bootstrap continuing in background."
wait $NGINX_PID