## Parent Dashboard – Clean Layout Redesign

### Files Modified/Created (In Order)
1. **File:** `frontend/src/components/dashboard/parent/ChildrenListSection.tsx`  
   - Layer: Presentation  
   - Order: 1  
   - Purpose: Render a compact, scannable list of children with inline “Add child” and “Book hours” actions.

2. **File:** `frontend/src/components/dashboard/parent/ParentCleanRightSidebar.tsx`  
   - Layer: Presentation  
   - Order: 2  
   - Purpose: Provide an ultra-simple right sidebar showing total hours balance, per-child hours, and a small set of alerts.

3. **File:** `frontend/src/components/dashboard/ChildrenActivitiesCalendar.tsx`  
   - Layer: Presentation  
   - Order: 3  
   - Purpose: Simplify the month view by removing the legend and replacing coloured dots/cards with child initials in each day cell.

4. **File:** `frontend/src/app/dashboard/parent/ParentDashboardPageClient.tsx`  
   - Layer: Presentation / Orchestration  
   - Order: 4  
   - Purpose: Wire the new children list and clean sidebar into the parent dashboard, and ensure the child filter drives both the calendar and hours panel.

### Plain English Explanation
The parent dashboard has been redesigned around extreme simplicity.  
The horizontal “child cards” strip has been replaced with a clean list that shows each child, their remaining hours, and a single “Book hrs” button.  
The calendar month view no longer shows a status legend or coloured dots; instead, each day simply shows the date and the initials of children who have sessions on that day.  
The right-hand sidebar now focuses on one “Hours balance” card and a minimal “Alerts / All clear” card, and it respects the same child filter as the calendar, so parents can switch between “All children” and a single child and see both the calendar and hours update together.

### Summary of Changes
- **Frontend (layout & components)**  
  - Introduced `ChildrenListSection` as the primary children UI on the parent dashboard, with the “+ Add Child” action moved into the section itself.  
  - Added `ParentCleanRightSidebar` which summarises total available hours, hours per child, and a short list of alerts (sessions today, low hours).  
  - Simplified `ChildrenActivitiesCalendar` month view by removing the legend and replacing dots/mini-cards with initials, while keeping Month/Week/Day switching and the existing booking logic.  
  - Updated `ParentDashboardPageClient` to compose the new components, derive per-child remaining hours, and pass the current child filter (`visibleChildIds`) into both the calendar and sidebar.

- **Backend / API / Database**  
  - No backend, API, or database schema changes were required. All new behaviour is derived from existing `BookingDTO` and child data already exposed to the frontend.

### Clean Architecture Compliance
- The changes are confined to the **Presentation** layer; no domain or infrastructure contracts were modified.  
- The new components (`ChildrenListSection`, `ParentCleanRightSidebar`) receive simple DTO-style props (child IDs, names, remaining hours, bookings) and do not perform any direct HTTP calls.  
- Business rules (what counts as an active booking, what hours are available) are still respected by reusing existing booking data and helper logic, without introducing new cross-layer coupling.  
- The calendar’s child filter remains the single source of truth for which children are “in view”, and this is now passed down to the sidebar rather than duplicating filtering logic in multiple places.

### Trainer dashboard alignment (same clean layout)
The trainer dashboard Schedule tab has been aligned with the parent dashboard:
- **Right sidebar removed** on the schedule view (no weekly hours card, quick stats, or pending actions column).
- **Left sidebar removed** (no mini calendar, no upcoming sessions list, no “My Trainees” section).
- **Calendar-only main content** with a single **Trainee filter** above the calendar (when multiple trainees), mirroring the parent’s ChildrenFilter. All schedule actions remain in the header and in the mobile Actions dropdown / FAB.

### Next Steps
- Validate the new layout on small, medium, and large screens to ensure the children list, calendar, and sidebar remain readable without horizontal scrolling.  
- Consider adding explicit test coverage around the “child filter → hours panel” behaviour (e.g. Cypress or Playwright) to guard against regressions.  
- If parents request it, extend alerts to include “payment due” and “checklist required” in the same minimal style, reusing existing booking and checklist data.  
  
