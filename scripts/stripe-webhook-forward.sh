#!/bin/bash

# Stripe Webhook Forwarding Script
# This script forwards Stripe webhooks to the local backend for testing

set -e

echo "🔔 Starting Stripe webhook forwarding..."
echo ""
echo "This will forward Stripe webhooks to: http://backend:80/api/v1/webhooks/stripe"
echo ""

# Check if STRIPE_SECRET_KEY is set
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ Error: STRIPE_SECRET_KEY is not set in your .env file"
    echo "   Please add it to your .env file and try again"
    exit 1
fi

# Run Stripe CLI in Docker
echo "📡 Starting Stripe CLI listener..."
echo "   Press Ctrl+C to stop"
echo ""

docker-compose run --rm \
    -e STRIPE_API_KEY="$STRIPE_SECRET_KEY" \
    stripe-cli listen \
    --forward-to http://backend:80/api/v1/webhooks/stripe \
    --print-secret

