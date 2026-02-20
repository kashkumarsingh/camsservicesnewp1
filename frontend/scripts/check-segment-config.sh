#!/usr/bin/env bash
echo "Checking Next.js segment config..."
set -e  # exit immediately on any error

# 1. Find any imported constant used as segment config
# Allow literal values: single or double quotes for strings, literal numbers
IMPORTED=$(grep -rn "export const revalidate\|export const dynamic\|export const runtime\|export const fetchCache" src/app --include="*.tsx" --include="*.ts" | grep -v "= 'force-dynamic'\|= \"force-dynamic\"\|= 'force-static'\|= \"force-static\"\|= 'auto'\|= \"auto\"\|= 'error'\|= \"error\"\|= 'nodejs'\|= \"nodejs\"\|= 'edge'\|= \"edge\"\|= false\|= [0-9]" || true)

if [ -n "$IMPORTED" ]; then
  echo "❌ Invalid segment config (non-literal value):"
  echo "$IMPORTED"
  exit 1
fi

# 2. Find layouts with dynamic that have children with revalidate
DYNAMIC_LAYOUTS=$(grep -rn "export const dynamic" src/app --include="*.tsx" --include="*.ts" | grep "layout" || true)
REVALIDATE_PAGES=$(grep -rn "export const revalidate" src/app --include="*.tsx" --include="*.ts" || true)

echo "Dynamic layouts:"
echo "$DYNAMIC_LAYOUTS"
echo ""
echo "Revalidate pages:"
echo "$REVALIDATE_PAGES"

# 3. Check for both dynamic AND revalidate in same file
if [ -n "$REVALIDATE_PAGES" ]; then
  while IFS= read -r line; do
    FILEPATH=$(echo "$line" | cut -d: -f1)
    HAS_DYNAMIC=$(grep -n "export const dynamic" "$FILEPATH" 2>/dev/null || true)
    HAS_REVALIDATE=$(grep -n "export const revalidate" "$FILEPATH" 2>/dev/null || true)
    if [ -n "$HAS_DYNAMIC" ] && [ -n "$HAS_REVALIDATE" ]; then
      echo "❌ Conflict in $FILEPATH — has both dynamic and revalidate"
      exit 1
    fi
  done <<< "$REVALIDATE_PAGES"
fi

echo "✓ Segment config looks clean"
