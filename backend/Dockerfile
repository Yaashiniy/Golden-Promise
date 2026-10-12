FROM php:8.3-cli-alpine

# Install system dependencies and Postgres client tools
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

# Install PHP extensions required for Laravel and PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy the backend codebase
COPY . .

RUN cp uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# Run composer installation
RUN composer install --no-dev --optimize-autoloader

# Expose Laravel default port
EXPOSE 8000

# Start command with storage link initialization
CMD ["sh", "-c", "php artisan storage:link || true; php artisan serve --host=0.0.0.0 --port=8000"]
