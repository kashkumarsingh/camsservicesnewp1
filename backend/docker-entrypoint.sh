#!/bin/sh
set -e

# Fail fast with clear message if APP_KEY is missing (Laravel will crash on first request otherwise)
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:..." ]; then
    echo "FATAL: APP_KEY is not set. Set it in Railway (or your host) → cams-backend → Variables."
    echo "Generate with: php artisan key:generate --show"
    exit 1
fi

# Reverb-only mode (Railway WebSocket service): listen on PORT, use ping for keepalive
if [ "$RUN_MODE" = "reverb" ]; then
    export REVERB_PORT="${PORT:-8080}"
    export REVERB_HOST="${REVERB_HOST:-0.0.0.0}"
    echo "Reverb mode → starting WebSocket server on port $REVERB_PORT (Railway WSS)"
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

# PORT is provided by Railway (or your host)
export PORT=${PORT:-80}

# Smart APP_URL detection (Railway → Fallback)
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export APP_URL="https://$RAILWAY_PUBLIC_DOMAIN"
    echo "Railway detected → APP_URL = $APP_URL"
else
    export APP_URL="${APP_URL:-http://localhost}"
    echo "Fallback → APP_URL = $APP_URL"
fi

# Safe defaults for Railway (ephemeral filesystem)
export CACHE_DRIVER=${CACHE_DRIVER:-database}
export SESSION_DRIVER=${SESSION_DRIVER:-database}
export QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}

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

# Worker-only mode (Railway): needs DB and migrations before running queue:work
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

# Scheduler-only mode (Railway cron): needs DB, then run schedule:run once
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

# Web mode (default): start bootstrap in background, then Nginx in foreground so /health responds and container stays alive.
# Nginx must run in foreground (daemon off) or the container would exit; nginx & daemonizes and the PID we wait for exits.
echo "Web mode → starting bootstrap in background, then Nginx in foreground (daemon off)."
(
    set +e
    echo "[background] Waiting for database..."
    MAX_RETRIES=60
    COUNT=0
    DB_READY=0
    until php artisan db:monitor >/dev/null 2>&1; do
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $MAX_RETRIES ]; then
            echo "[background] DB not ready after ${MAX_RETRIES} attempts — continuing anyway (migrations skipped). Set DB_* in Railway if this persists."
            DB_READY=0
            break
        fi
        sleep 2
    done
    if [ $COUNT -lt $MAX_RETRIES ]; then
        DB_READY=1
    fi
    if [ "$DB_READY" = "1" ]; then
        echo "[background] Database connected. Running migrations..."
        MIGRATION_EXIT=1
        for ATTEMPT in 1 2 3; do
            set +e
            php artisan migrate --force --no-interaction 2>&1
            MIGRATION_EXIT=$?
            set -e
            if [ $MIGRATION_EXIT -eq 0 ]; then
                break
            fi
            echo "[background] Migrations attempt $ATTEMPT failed (exit $MIGRATION_EXIT). Retrying in 15s..."
            sleep 15
        done
        if [ $MIGRATION_EXIT -ne 0 ]; then
            echo "[background] Migrations failed after 3 attempts. Continuing startup; run migrate manually if needed."
        fi
    fi
    php artisan config:clear || true
    php artisan cache:clear || true
    php artisan route:clear || true
    php artisan view:clear || true
    if [ "$DB_READY" = "1" ] && [ "${MIGRATION_EXIT:-1}" = "0" ]; then
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

php-fpm -D
echo "✓ Nginx starting in foreground; /health will respond immediately. Bootstrap running in background."
exec nginx -g 'daemon off;'