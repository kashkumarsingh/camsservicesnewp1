# Trainer Mobile/Tablet UI – Implementation Summary

## Purpose

Align the trainer dashboard with the reference app design on **mobile and tablet**: blue header, bottom nav (Schedule | Timesheets | More), section labels, tab strip with orange underline, FAB, and More menu with profile row + list.

## Files Created

| File | Purpose |
|------|---------|
| `frontend/src/components/trainer/mobile/TrainerMobileHeader.tsx` | Blue app header (#2196F3): back (optional), centred title, optional right icon, optional year/subtitle. |
| `frontend/src/components/trainer/mobile/TrainerBottomNav.tsx` | Bottom nav: Schedule \| Timesheets \| More; white bg, grey inactive, blue (#2196F3) active. |
| `frontend/src/components/trainer/mobile/TrainerSectionLabel.tsx` | Grey uppercase section label (e.g. USED, FEBRUARY, INFO); optional horizontal rules. |
| `frontend/src/components/trainer/mobile/index.ts` | Barrel export for trainer mobile components. |

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/app/(trainer)/trainer/dashboard/TrainerDashboardPageClient.tsx` | Mobile/tablet blue header when `!responsive.showSidebar`; `TrainerBottomNav` with “Timesheets” label; Schedule sub-tabs (SCHEDULE / AVAILABLE SHIFTS) with amber underline; month section label; FAB (blue circle +); More tab restructured: profile row (avatar, name, “My profile”, chevron) then menu list (Timesheets, Absences, Availability, Pay, Documents, Contacts, Settings, Two-factor authentication, Support); bottom nav and FAB use `lg:hidden` so layout matches reference on mobile and tablet. |

## Design Details (Reference Match)

- **Header:** Solid blue `#2196F3`, white title and icons, optional back and right action.
- **Bottom nav:** White bar, three items; active tab in blue `#2196F3`, inactive in grey.
- **Schedule tabs:** SCHEDULE | AVAILABLE SHIFTS with amber/orange (`border-amber-500`) underline for active.
- **Section label:** Uppercase grey label (e.g. current month “FEBRUARY”) above schedule content on mobile/tablet.
- **FAB:** Fixed bottom-right, blue circle with plus, above bottom nav (`bottom-20`).
- **More tab:** Single profile row (initials in blue-bordered circle, name, “My profile”, chevron); then list rows with icon, label, chevron; Qualifications block retained below.
- **Safe areas:** `pt-[env(safe-area-inset-top)]` on header, `pb-[env(safe-area-inset-bottom)]` on bottom nav for notched devices.

## Responsive Behaviour

- **Desktop (lg and up):** Existing layout (greeting header, tab pills, sidebars). No blue header, no bottom nav, no FAB, no Schedule sub-tabs.
- **Mobile & tablet (below lg):** Blue header, bottom nav (Schedule | Timesheets | More), Schedule sub-tabs + month label, FAB, and restructured More tab. Content padding `pb-20` to clear bottom nav.

## Clean Architecture

- **Presentation:** `TrainerDashboardPageClient` composes trainer mobile components and switches layout by `responsive.showSidebar`.
- **UI components:** `TrainerMobileHeader`, `TrainerBottomNav`, `TrainerSectionLabel` are presentational; no direct API or domain imports.

## Next Steps (Optional)

- Dedicated screens for Absences, Availability (full page), Pay, Documents, Location, Shift info, Absence detail, My profile (full page) to match every reference screen 1:1.
- Back navigation from sub-screens using `TrainerMobileHeader` `onBack`.
- “My timesheets” screen with blue calendar header and “No timesheets for this day” empty state when implemented.
