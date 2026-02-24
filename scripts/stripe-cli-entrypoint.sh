#!/bin/sh
# Map STRIPE_SECRET_KEY (from backend/.env) to STRIPE_API_KEY so Stripe CLI
# receives the key without relying on host env substitution in docker-compose.
if [ -n "$STRIPE_SECRET_KEY" ]; then
  export STRIPE_API_KEY="$STRIPE_SECRET_KEY"
fi
exec stripe "$@"
