#!/bin/sh
set -e

# Remove stale lock file (prevents "Port 3000 is already in use" errors)
rm -rf /app/.next/dev/lock

# Execute the main command
exec "$@"
