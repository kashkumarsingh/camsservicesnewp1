# Type Checking Guide

## Why Type Errors Appear on Render but Not Locally

**Next.js Development Mode (`next dev`):**
- Does **minimal type checking** for faster reload times
- Only checks files as they're accessed/modified
- More lenient with type errors
- Uses incremental builds (may cache old types)

**Next.js Production Build (`next build`):**
- Runs **full TypeScript compilation** on ALL files
- Catches ALL type errors
- This is what Render runs during deployment

## ⚠️ Important: Run from WSL Bash, Not Windows CMD

**You MUST run these commands from WSL Ubuntu bash, not from Windows CMD or PowerShell.**

If you're in Windows CMD, you'll see errors like:
- `'tsc' is not recognized`
- `UNC paths are not supported`
- Permission errors

**Solution:** Open WSL Ubuntu terminal and run commands there.

## Solutions

### 1. Run Type Checking During Development

#### Option A: Watch Mode (Recommended)
Run type checking in watch mode alongside your dev server:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run type checking in watch mode
npm run typecheck:watch
```

#### Option B: Combined Command
Run both dev server and type checking together:

```bash
npm run dev:typecheck
```

This uses `concurrently` to run both commands simultaneously.

### 2. Check Types Before Committing

Always run type checking before pushing:

```bash
npm run typecheck
```

Or use the lint script (same thing):

```bash
npm run lint
```

### 3. Editor Configuration (VS Code)

Create `.vscode/settings.json` in the frontend directory with:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.validate.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  }
}
```

This will:
- Use workspace TypeScript version
- Enable real-time type checking
- Show type errors in the editor
- Auto-fix on save

**Make sure you have the TypeScript extension installed in VS Code.**

### 4. Pre-commit Hook (Optional)

To automatically check types before committing, you can add a git hook:

```bash
# Install husky (if not already installed)
npm install --save-dev husky

# Initialize husky
npx husky init

# Add pre-commit hook
echo "npm run typecheck" > .husky/pre-commit
chmod +x .husky/pre-commit
```

## Available Scripts

- `npm run typecheck` - Run type checking once
- `npm run typecheck:watch` - Run type checking in watch mode
- `npm run typecheck:ci` - Run type checking with pretty output (for CI)
- `npm run dev:typecheck` - Run dev server + type checking together
- `npm run lint` - Same as `typecheck` (alias)

## Best Practices

1. **Always run `npm run typecheck` before pushing code**
2. **Use `typecheck:watch` during development** to catch errors early
3. **Enable TypeScript in your editor** for real-time feedback
4. **Fix type errors immediately** - don't let them accumulate

## Troubleshooting

### Type errors in editor but not in terminal?
- Restart VS Code
- Run "TypeScript: Restart TS Server" from command palette
- Check that `.vscode/settings.json` is correct

### Type errors after pulling code?
- Run `npm install` to ensure dependencies are up to date
- Run `npm run typecheck` to see all errors
- Clear `.next` cache: `rm -rf .next`

### Still seeing errors on Render but not locally?
- Make sure you ran `npm run typecheck` locally and it passed
- Check that your local TypeScript version matches package.json
- Verify `tsconfig.json` is correct

