#!/bin/bash
# Clear Laravel caches
echo "Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
echo "✅ All Laravel caches cleared!"
