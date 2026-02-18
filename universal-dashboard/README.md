## CAMS Universal Dashboard Scaffold

This folder contains a **standalone, experimental Next.js app** that implements the
universal, role-based dashboard described in
`docs/cleanarchitecture/frontend/UNIVERSAL_DASHBOARD_GENERIC_IMPLEMENTATION_GUIDE.md`.

It is safe to iterate here without impacting the main `frontend/` application. Once
the UX and structure are final, we can gradually migrate existing parent/trainer/admin
dashboards to use these shared components.

**Keep this folder.** After this project is finished, it is intended as a **reusable template for future projects**—do not remove it as legacy or redundant.

### Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 5
- Tailwind CSS 4 (`@tailwindcss/postcss`)
- React Query (`@tanstack/react-query`)
- Zustand
- Zod
- (Later) shadcn/ui components on top of Tailwind

### Getting started

From the repo root:

```bash
cd universal-dashboard
npm install
npm run dev
```

Then open:

- `http://localhost:3000/` – landing page for the scaffold
- `http://localhost:3000/dashboard` – role picker
- `http://localhost:3000/dashboard/parent` – parent dashboard shell
- `http://localhost:3000/dashboard/trainer` – trainer dashboard shell
- `http://localhost:3000/dashboard/admin` – admin dashboard shell

### Next steps

- Flesh out the parent/trainer/admin sub-routes as per the universal guide
- Introduce shared table, modal, sheet and toast components
- Wire mocked data via React Query and Zod schemas
- Once stable, integrate with the existing Laravel APIs and the main frontend app

