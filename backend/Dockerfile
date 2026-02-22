FROM php:8.4-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    gettext

# Install PHP extensions (MySQL and PostgreSQL support)
# intl and icu-libs for Laravel/localisation
# Combined to reduce build layers and speed up build
RUN apk add --no-cache icu-dev postgresql-dev pcre-dev $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql pdo_pgsql zip exif pcntl gd intl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del icu-dev postgresql-dev pcre-dev $PHPIZE_DEPS \
    && apk add --no-cache icu-libs postgresql-libs  # Keep runtime libraries

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies (skip scripts - artisan doesn't exist yet)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Copy application files
COPY . .

# Copy entrypoint script to a known location
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create required directories with proper permissions
RUN mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage \
    && chmod -R 775 bootstrap/cache storage

# Run post-install scripts now that artisan exists (skip composer scripts; run in entrypoint)
RUN composer dump-autoload --optimize --no-interaction --no-scripts

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Production stage
FROM base AS production

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Expose port (Railway/host uses PORT env var)
EXPOSE 80

# Use entrypoint script to handle readiness checks and startup
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]


