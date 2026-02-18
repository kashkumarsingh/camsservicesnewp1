#!/bin/bash

# Cursor Chat Cleanup Script
# Archives large chat transcripts to reduce memory usage and costs
# Run this weekly: bash scripts/cleanup-cursor-chats.sh

set -e

ARCHIVE_DIR="$HOME/.cursor/archived-chats"
TRANSCRIPT_DIR="$HOME/.cursor/projects"

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

echo "🧹 Cleaning up Cursor chat transcripts..."
echo ""

# Find all transcript directories
TRANSCRIPT_DIRS=$(find "$TRANSCRIPT_DIR" -type d -name "agent-transcripts" 2>/dev/null || true)

if [ -z "$TRANSCRIPT_DIRS" ]; then
    echo "✅ No transcript directories found"
    exit 0
fi

ARCHIVED_COUNT=0
TOTAL_SIZE=0

# Process each transcript directory
while IFS= read -r dir; do
    if [ ! -d "$dir" ]; then
        continue
    fi
    
    echo "📁 Checking: $dir"
    
    # Find large files (>5MB) and archive them
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            SIZE=$(du -h "$file" | cut -f1)
            SIZE_BYTES=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            
            # Archive files larger than 5MB
            if [ "$SIZE_BYTES" -gt 5242880 ]; then
                FILENAME=$(basename "$file")
                echo "  📦 Archiving: $FILENAME ($SIZE)"
                mv "$file" "$ARCHIVE_DIR/$FILENAME"
                ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
                TOTAL_SIZE=$((TOTAL_SIZE + SIZE_BYTES))
            fi
        fi
    done < <(find "$dir" -type f -name "*.txt" 2>/dev/null || true)
    
done <<< "$TRANSCRIPT_DIRS"

# Summary
echo ""
if [ $ARCHIVED_COUNT -gt 0 ]; then
    TOTAL_SIZE_MB=$(echo "scale=2; $TOTAL_SIZE / 1048576" | bc)
    echo "✅ Archived $ARCHIVED_COUNT chat transcript(s) ($TOTAL_SIZE_MB MB)"
    echo "📁 Archive location: $ARCHIVE_DIR"
else
    echo "✅ No large transcripts found to archive"
fi

echo ""
echo "💡 Tip: Start new chats for new topics to keep transcripts small!"
