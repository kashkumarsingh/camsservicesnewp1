# Parent Dashboard Backup — 2025-02-24

Backup created **before** the three-column calendar layout redesign (sidebar → header nav, three-column layout).

## Restore

To restore from this backup (from repo root):

```bash
cp -r frontend/backups/parent-dashboard-20250224/app/dashboard/parent/* frontend/src/app/dashboard/parent/
cp -r frontend/backups/parent-dashboard-20250224/components/dashboard/parent/* frontend/src/components/dashboard/parent/
cp frontend/backups/parent-dashboard-20250224/components/dashboard/layout/DashboardShell.tsx frontend/src/components/dashboard/layout/
cp frontend/backups/parent-dashboard-20250224/components/dashboard/layout/ParentDashboardHeaderContext.tsx frontend/src/components/dashboard/layout/
```

## Contents

- **app/dashboard/parent/** — All parent route pages and page clients (Overview, Schedule, Bookings, Children, Progress, Settings).
- **components/dashboard/parent/** — ParentCleanRightSidebar, ChildrenListSection, SelectedDayEventCards.
- **components/dashboard/layout/** — DashboardShell.tsx, ParentDashboardHeaderContext.tsx.
