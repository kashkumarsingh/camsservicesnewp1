# Vercel Deployment Workflow

## Overview

Vercel uses a Git-based workflow to automatically create preview and production deployments.

## Domains

- **Production:** `yourdomain.com` (your custom domain)
- **Preview:** `yourproject-git-branchname-yourteam.vercel.app` (auto-generated)

## Workflow

### 1. Create a branch

```bash
git checkout -b branch-a
```

### 2. Make your changes and push

```bash
git add .
git commit -m "Your changes"
git push origin branch-a
```

### 3. Preview your changes

Vercel automatically creates a preview deployment.

- **URL:** `yourproject-git-branch-a-yourteam.vercel.app`

### 4. Merge to main

```bash
git checkout main
git merge branch-a
git push origin main
```

### 5. Production deployment

Vercel automatically deploys to your custom domain.

- **URL:** `yourdomain.com`

## Project setup (monorepo)

This repo has the Next.js app in **`frontend/`**. In Vercel:

- **Root Directory:** set to `frontend` (Project Settings → General).
- **Build Command:** `npm run build` (default).
- **Output Directory:** leave as Next.js default (Vercel detects it).

## Environment variables

- Add in **Vercel → Project → Settings → Environment Variables**.
- Use **Preview** for branch deployments, **Production** for `main`.
- Ensure `NEXT_PUBLIC_*` and API URLs are set for both if the app needs them in previews.

## Aligning with this repo’s workflow

- Use **feature branches** (e.g. `feature/description`, `fix/description`); avoid pushing directly to `main`.
- Push to a feature branch → get a **preview** URL to test.
- When ready, **merge to `main`** (via PR or locally) → Vercel deploys to **production**.
- Run `npm run typecheck` in `frontend/` before merging (per project standards).

## Optional

- **Vercel CLI:** `npx vercel` for local previews or linking.
- **Preview protection:** Team/Enterprise can add password or Vercel Auth for `.vercel.app` previews.
- **Docs:** [Vercel – Git integrations](https://vercel.com/docs/deployments/git).

## Notes

- Preview deployments are created for every branch push.
- Production deployments are created when pushing to the main branch.
- The `.vercel.app` domain cannot be removed but can be protected.
