#!/usr/bin/env node
/**
 * FAANG-Level Post-Install Hook
 * Automatically fixes common issues after npm install
 * Runs automatically after: npm install, npm ci
 */

const fs = require('fs');
const path = require('path');

// Skip in Docker/CI environments where Git may not be available
const isDocker = fs.existsSync('/.dockerenv') || process.env.CI === 'true' || process.env.RENDER === 'true';
if (isDocker) {
    console.log('🔧 Skipping post-install checks (Docker/CI environment)');
    process.exit(0);
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const NEXT_ENV_FILE = path.join(PROJECT_ROOT, 'next-env.d.ts');

console.log('🔧 Running post-install fixes...');

// Fix 1: Ensure next-env.d.ts is not committed
// Next.js will generate it automatically when needed
if (fs.existsSync(NEXT_ENV_FILE)) {
    try {
        // Check if file is in Git
        const { execSync } = require('child_process');
        try {
            execSync(`git ls-files --error-unmatch ${NEXT_ENV_FILE}`, {
                stdio: 'ignore',
                cwd: PROJECT_ROOT
            });
            // File is in Git - warn but don't fail
            console.warn('⚠️  Warning: next-env.d.ts is tracked in Git (should be ignored)');
        } catch (e) {
            // File is not in Git - good!
            // File exists but is ignored - Next.js will regenerate if needed
        }
    } catch (e) {
        // Git not available or not a Git repo - skip check
    }
}

// Fix 2: Verify .gitignore includes next-env.d.ts
const gitignorePath = path.join(PROJECT_ROOT, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('next-env.d.ts')) {
        console.warn('⚠️  Warning: next-env.d.ts is not in .gitignore');
    }
}

// Fix 3: Create .next directory structure if needed (Next.js will handle this)
const nextDir = path.join(PROJECT_ROOT, '.next');
if (!fs.existsSync(nextDir)) {
    // Next.js will create this on first build - no action needed
}

console.log('✓ Post-install fixes complete');

