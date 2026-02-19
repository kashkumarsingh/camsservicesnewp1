#!/bin/bash

# Cursor Chat Cleanup Script
# Archives large chat transcripts to reduce memory usage and costs.
# Supports both legacy (.txt) and new (.jsonl) transcript formats.
# Reports total and per-project size / estimated token usage (~4 chars per token).
#
# Usage:
#   bash scripts/cleanup-cursor-chats.sh           # Archive only files >5MB
#   bash scripts/cleanup-cursor-chats.sh --reset  # Archive ALL transcripts (reset to empty)

set -e

ARCHIVE_DIR="$HOME/.cursor/archived-chats"
TRANSCRIPT_DIR="$HOME/.cursor/projects"
ARCHIVE_THRESHOLD_BYTES=5242880  # 5MB

RESET_MODE=false
[ "${1:-}" = "--reset" ] || [ "${1:-}" = "reset" ] && RESET_MODE=true

# Sum bytes for a single agent-transcripts dir. Sets TOTAL_BYTES (ESTIMATED_TOKENS = bytes/4).
sum_one_dir() {
    local dir="$1"
    TOTAL_BYTES=0
    [ -d "$dir" ] || return
    while IFS= read -r file; do
        [ -f "$file" ] || continue
        local b
        b=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        TOTAL_BYTES=$((TOTAL_BYTES + b))
    done < <(find "$dir" -type f \( -name "*.txt" -o -name "*.jsonl" \) 2>/dev/null || true)
}

# Sum bytes and estimate tokens for all transcript files under given dirs
sum_transcript_stats() {
    local dirs="$1"
    TOTAL_BYTES=0
    while IFS= read -r dir; do
        [ -d "$dir" ] || continue
        while IFS= read -r file; do
            [ -f "$file" ] || continue
            local bytes
            bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            TOTAL_BYTES=$((TOTAL_BYTES + bytes))
        done < <(find "$dir" -type f \( -name "*.txt" -o -name "*.jsonl" \) 2>/dev/null || true)
    done <<< "$dirs"
    ESTIMATED_TOKENS=$((TOTAL_BYTES / 4))
}

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

if [ "$RESET_MODE" = true ]; then
    echo "🔄 Reset mode: archiving ALL transcripts (no size threshold)"
else
    echo "🧹 Cleaning up Cursor chat transcripts (archive files >5MB)..."
fi
echo ""

# Find all transcript directories
TRANSCRIPT_DIRS=$(find "$TRANSCRIPT_DIR" -type d -name "agent-transcripts" 2>/dev/null || true)

if [ -z "$TRANSCRIPT_DIRS" ]; then
    echo "✅ No transcript directories found"
    exit 0
fi

# Pre-scan: total and per-project stats (before archive)
sum_transcript_stats "$TRANSCRIPT_DIRS"
BEFORE_BYTES=$TOTAL_BYTES
BEFORE_TOKENS=$ESTIMATED_TOKENS
BEFORE_MB="0"
[ "$BEFORE_BYTES" -gt 0 ] && BEFORE_MB=$(echo "scale=2; $BEFORE_BYTES / 1048576" | bc 2>/dev/null || echo "?")

echo "📊 Total (before): ${BEFORE_MB} MB  ~ $BEFORE_TOKENS estimated tokens"
echo ""
echo "─────────────────────────────────────────"
echo "📊 Individual token usage (per project)"
echo "─────────────────────────────────────────"
while IFS= read -r dir; do
    [ -d "$dir" ] || continue
    sum_one_dir "$dir"
    [ "$TOTAL_BYTES" -eq 0 ] && continue
    PROJECT_NAME=$(basename "$(dirname "$dir")")
    MB=$(echo "scale=2; $TOTAL_BYTES / 1048576" | bc 2>/dev/null || echo "?")
    TOKENS=$((TOTAL_BYTES / 4))
    echo "  $PROJECT_NAME: ${MB} MB  ~ $TOKENS tokens"
done <<< "$TRANSCRIPT_DIRS"
echo "─────────────────────────────────────────"
echo ""

ARCHIVED_COUNT=0
ARCHIVED_BYTES=0

# Reset: use a dated subdir so we don't overwrite previous resets
if [ "$RESET_MODE" = true ]; then
    RESET_SUBDIR="$ARCHIVE_DIR/reset-$(date +%Y-%m-%d-%H%M%S)"
    mkdir -p "$RESET_SUBDIR"
fi

# Process each transcript directory
while IFS= read -r dir; do
    [ -d "$dir" ] || continue
    echo "📁 Checking: $dir"
    PROJECT_NAME=$(basename "$(dirname "$dir")")

    while IFS= read -r file; do
        [ -f "$file" ] || continue
        SIZE_BYTES=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        SHOULD_ARCHIVE=false
        if [ "$RESET_MODE" = true ]; then
            SHOULD_ARCHIVE=true
            DEST_BASE="${RESET_SUBDIR}/${PROJECT_NAME}"
        else
            [ "$SIZE_BYTES" -gt "$ARCHIVE_THRESHOLD_BYTES" ] && SHOULD_ARCHIVE=true
            DEST_BASE="$ARCHIVE_DIR"
        fi
        if [ "$SHOULD_ARCHIVE" = true ]; then
            SIZE=$(du -h "$file" | cut -f1)
            FILENAME=$(basename "$file")
            REL="${file#"$dir"/}"
            if [[ "$REL" == */* ]]; then
                mkdir -p "$DEST_BASE/$(dirname "$REL")"
                mv "$file" "$DEST_BASE/$REL"
            else
                mkdir -p "$DEST_BASE"
                mv "$file" "$DEST_BASE/$FILENAME"
            fi
            ARCHIVED_COUNT=$((ARCHIVED_COUNT + 1))
            ARCHIVED_BYTES=$((ARCHIVED_BYTES + SIZE_BYTES))
            echo "  📦 Archived: $FILENAME ($SIZE)"
        fi
    done < <(find "$dir" -type f \( -name "*.txt" -o -name "*.jsonl" \) 2>/dev/null || true)
done <<< "$TRANSCRIPT_DIRS"

# Post-scan: remaining size and estimated tokens
sum_transcript_stats "$TRANSCRIPT_DIRS"
AFTER_BYTES=$TOTAL_BYTES
AFTER_TOKENS=$ESTIMATED_TOKENS
AFTER_MB="0"
[ "$AFTER_BYTES" -gt 0 ] && AFTER_MB=$(echo "scale=2; $AFTER_BYTES / 1048576" | bc 2>/dev/null || echo "?")

# Summary
echo ""
echo "─────────────────────────────────────────"
echo "📊 Token usage summary"
echo "─────────────────────────────────────────"
echo "  Before:  ${BEFORE_MB} MB  ~ $BEFORE_TOKENS estimated tokens"
echo "  After:   ${AFTER_MB} MB  ~ $AFTER_TOKENS estimated tokens"
if [ "$ARCHIVED_COUNT" -gt 0 ]; then
    ARCHIVED_MB=$(echo "scale=2; $ARCHIVED_BYTES / 1048576" | bc 2>/dev/null || echo "?")
    ARCHIVED_EST_TOKENS=$((ARCHIVED_BYTES / 4))
    echo "  Archived: $ARCHIVED_COUNT file(s), ${ARCHIVED_MB} MB (~ $ARCHIVED_EST_TOKENS tokens)"
    if [ "$RESET_MODE" = true ]; then
        echo "  📁 Archive location: $RESET_SUBDIR"
    else
        echo "  📁 Archive location: $ARCHIVE_DIR"
    fi
fi
echo "─────────────────────────────────────────"
echo ""

# Per-project after (individual summary again)
if [ "$BEFORE_BYTES" -gt 0 ]; then
    echo "─────────────────────────────────────────"
    echo "📊 Individual token usage (after)"
    echo "─────────────────────────────────────────"
    while IFS= read -r dir; do
        [ -d "$dir" ] || continue
        sum_one_dir "$dir"
        [ "$TOTAL_BYTES" -eq 0 ] && continue
        PROJECT_NAME=$(basename "$(dirname "$dir")")
        MB=$(echo "scale=2; $TOTAL_BYTES / 1048576" | bc 2>/dev/null || echo "?")
        TOKENS=$((TOTAL_BYTES / 4))
        echo "  $PROJECT_NAME: ${MB} MB  ~ $TOKENS tokens"
    done <<< "$TRANSCRIPT_DIRS"
    echo "─────────────────────────────────────────"
    echo ""
fi

if [ "$ARCHIVED_COUNT" -eq 0 ]; then
    echo "✅ No large transcripts found to archive (>5MB)"
elif [ "$RESET_MODE" = true ]; then
    echo "✅ Reset complete. All transcripts archived; Cursor will start with empty chat history for these projects."
fi

echo "💡 Tip: Start new chats for new topics to keep transcripts small!"
echo ""
echo "📌 Legacy .txt: node scripts/convert-cursor-txt-to-jsonl.js [agent-transcripts-dir]"
echo "📌 Trim in place: node scripts/trim-cursor-transcripts.js [--keep N] [path]"
echo "📌 Full reset:  bash scripts/cleanup-cursor-chats.sh --reset"
