#!/bin/bash
# PHP Docker Wrapper Script
# This script allows VS Code/Cursor to use PHP from the Docker container for validation

# Check if Docker container is running
if ! docker ps | grep -q "kidzrunz-backend"; then
    echo "Error: Docker container 'kidzrunz-backend' is not running." >&2
    echo "Please start it with: docker-compose up -d backend" >&2
    exit 1
fi

# Execute PHP command in Docker container
# Pass all arguments to PHP in the container
docker exec kidzrunz-backend php "$@"
