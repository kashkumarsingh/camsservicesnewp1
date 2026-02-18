# Quick Type Check Instructions

## ⚠️ Important: Run from WSL Ubuntu Terminal

You **MUST** run these commands from **WSL Ubuntu bash**, not from Windows CMD or PowerShell.

## Steps to Run Type Checking

1. **Open WSL Ubuntu Terminal** (not Windows CMD)

2. **Navigate to frontend directory:**
   ```bash
   cd /home/buildco/camsservicep1/frontend
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Run type checking:**
   ```bash
   npm run typecheck
   ```

   This will show **ALL TypeScript errors** at once, just like Render's build process.

## Alternative: Watch Mode

To catch errors as you code:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run type checking in watch mode
npm run typecheck:watch
```

## What to Look For

Common TypeScript errors we've been fixing:
- `'booking' is possibly 'null'` - Need null checks
- `Property 'X' does not exist on type 'Y'` - Wrong property names
- `Type '"xs"' is not assignable` - Invalid enum/union values
- Missing properties in interfaces
- Type mismatches (string vs number, etc.)

## If You See Errors

1. Copy the full error message
2. Share it with me
3. I'll fix all errors at once

## Why This Matters

- `next dev` doesn't check all files (fast reload)
- `next build` checks everything (what Render runs)
- Running `typecheck` locally = same as Render build

