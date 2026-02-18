#!/bin/bash
# Clear Next.js caches
echo "Clearing Next.js caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
echo "✅ All Next.js caches cleared!"
