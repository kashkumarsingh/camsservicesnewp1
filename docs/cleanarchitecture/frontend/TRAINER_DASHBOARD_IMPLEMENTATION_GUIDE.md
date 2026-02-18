## Trainer Dashboard Implementation Guide for Cursor AI

> **Note:** This guide describes the **ideal Trainer Dashboard implementation**. The current codebase (as of 2026‑02‑10) already implements parts of this, especially in `app/dashboard/trainer/TrainerDashboardPageClient.tsx`. Future work should align existing implementations with this guide instead of creating competing UIs.

---

## Project Overview

You are building a **Trainer Dashboard** for a fitness/training staff management system using **Next.js App Router**, **TypeScript**, and **CSS Modules**. This dashboard allows trainers to manage their schedules, timesheets, time off, and profile information.

**Critical Rule**: The mobile app is the source of truth. Desktop and mobile use **identical structure and placement** – only navigation chrome changes (bottom nav → top tabs → sidebar).

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: CSS Modules (scoped per component)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation)

---

## Design System

### Colours

```css
--color-primary: #FF6B35;        /* Orange - main actions */
--color-primary-dark: #E85A2A;   /* Dark orange */
--color-secondary: #004E89;      /* Deep blue - headers */
--color-accent: #00D9FF;         /* Cyan - highlights */
--color-success: #06D6A0;        /* Green - approved/confirmed */
--color-warning: #FFB627;        /* Yellow - pending */
--color-error: #EF476F;          /* Red - important */
--color-background: #FAFBFC;     /* Light grey background */
--color-surface: #FFFFFF;        /* White cards */
```

### Typography

- **Primary Font**: Outfit (Google Fonts)
- **Monospace**: Space Mono (for times, hours, data)
- **Scale**: 0.75rem → 2rem

### Spacing

- Use 8px grid: `0.5rem`, `1rem`, `1.5rem`, `2rem`, `3rem`

### Border Radius

- Small: `0.375rem`
- Medium: `0.5rem`
- Large: `0.75rem`
- XL: `1rem`
- Full: `9999px`

---

## File Structure (Target)

```text
frontend/src/
├── app/
│   ├── layout.tsx                          # Root layout
│   ├── globals.css                         # Global styles, CSS variables
│   └── dashboard/
│       └── trainer/
│           ├── page.tsx                    # Main trainer dashboard (Schedule/Timesheets/More)
│           ├── schedule/
│           │   ├── page.tsx               # Schedule list view
│           │   ├── calendar/
│           │   │   └── page.tsx           # Calendar month view
│           │   ├── shift/[id]/
│           │   │   └── page.tsx           # Shift detail view
│           │   └── location/[id]/
│           │       └── page.tsx           # Location map view (future)
│           ├── timesheets/
│           │   └── page.tsx               # Timesheets month view
│           └── more/
│               ├── page.tsx               # More menu
│               ├── profile/
│               │   └── page.tsx           # Profile view
│               ├── absences/
│               │   └── page.tsx           # Absences (future)
│               ├── availability/
│               │   └── page.tsx           # Availability (future)
│               └── pay/
│                   └── page.tsx           # Pay periods (future)
│
├── components/
│   └── trainer/
│       ├── ScheduleListView.tsx           # Day‑grouped shift cards
│       ├── ScheduleListView.module.css    # CSS module for schedule list
│       ├── TimesheetsMonthView.tsx        # Calendar with day summary
│       └── modals/
│           └── RequestTimeOffModal.tsx    # Time off request modal
│
├── core/
│   └── trainer/
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── TrainerSchedule.ts     # Schedule aggregate
│       │   │   ├── TrainerTimesheet.ts    # Timesheet aggregate
│       │   │   └── TrainerProfile.ts      # Profile aggregate
│       │   └── repositories/              # Repository interfaces
│       └── application/
│           └── useCases/                  # Use cases (future)
│
├── infrastructure/
│   └── http/
│       └── repositories/                  # Remote API implementations
│
└── mock/
    └── trainerData.ts                     # Mock data for development
```

> **Alignment with current codebase:**  
> The existing implementation already uses `app/dashboard/trainer/TrainerDashboardPageClient.tsx` plus many trainer components under `components/trainer/*`. As we build towards this target structure, we should:
> - Prefer **adapting existing components** rather than duplicating them.  
> - Introduce the `core/trainer/domain` layer and `mock/trainerData.ts` without breaking live API‑based flows.  
> - Use CSS Modules primarily for **new** trainer components; existing Tailwind‑based components can remain until migrated.

---

## Navigation Structure

**Three top‑level items only** (same on all devices):

1. **Schedule** – View and manage shifts.
2. **Timesheets** – Track hours and pay.
3. **More** – Profile, settings, and additional features.

### Responsive Navigation Behaviour

- **Mobile (< 768px)** – Fixed bottom nav (already implemented using `TrainerBottomNav`):

```tsx
<nav className="bottom-nav">
  <button>📅 Schedule</button>
  <button>📊 Timesheets</button>
  <button>☰ More</button>
</nav>
```

- **Tablet (768px–1024px)** – Top horizontal tabs.
- **Desktop (> 1024px)** – Left sidebar with same three entries.

The **content structure must remain identical** – only the navigation chrome changes.

---

## Key Pages and Layouts (Summary)

Below is a condensed summary of the most important pages. See `TRAINER_REFERENCE_SCREENS.md` for the UX/behaviour details and reference screenshots.

### 1. Schedule List View (`/dashboard/trainer/schedule`)

- Day‑grouped list of:
  - **Shift cards** (time, role, location, pay, notes count).
  - **Unavailable cards** for days marked unavailable.
- Tabs: `SCHEDULE` and `AVAILABLE SHIFTS`.
- Floating action button (FAB) on mobile for quick actions (e.g. request time off).
- Desktop enhancement: same cards rendered in a 2–3 column grid.

### 2. Calendar View (`/dashboard/trainer/schedule/calendar`)

- Blue header strip with month navigation.
- Month grid with:
  - Green dots for days with shifts.
  - Markers for availability and absences.
- Shifts list for the selected day below the calendar.

### 3. Shift Detail View (`/dashboard/trainer/schedule/shift/[id]`)

Sections, in strict order:

1. **SHIFT INFO** – Assignee, position, location, time.
2. **WORK INFO** – Hours worked, clock history link, total hours worked.
3. **APPROVAL** – Assignee vs supervisor approvals.
4. **PAY** – Rate and total pay.
5. **SHIFT NOTES** – Count and click‑through to notes.

This maps closely to the existing `TrainerSessionDetailModal`, which should be evolved towards this layout.

### 4. Timesheets View (`/dashboard/trainer/timesheets`)

- Month selector + interactive calendar.
- Selected day summary (Confirmed vs Total hours and pay).
- List of underlying entries (or empty state).

### 5. More Menu and Profile (`/dashboard/trainer/more/*`)

- More menu: profile card and menu items (Absences, Availability, Pay, Documents, Contacts, Settings, 2FA, Support).
- Profile view:
  - Personal information (email, DOB, gender, mobile, driving licence, access to car).
  - Qualifications with expiry.
  - Emergency contacts.

---

## Domain Entities (Target)

These entities live in `frontend/src/core/trainer/domain/entities/` and are fed either by mock data or by repository adapters that transform API responses into these shapes.

### `TrainerSchedule.ts`

```ts
export interface Shift {
  id: string;
  position: string;
  location: {
    id: string;
    name: string;
    address: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  startTime: string;       // "09:00"
  endTime: string;         // "17:00"
  date: string;            // "2026-02-07"
  breakMinutes: number;
  assignee: string;
  rate: number;
  totalPay: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notesCount?: number;
  clockHistory?: ClockEvent[];
  hoursWorked?: string;    // "12:15–16:30"
  totalHoursWorked?: number;
  approvalStatus?: ApprovalStatus;
}

export interface ClockEvent {
  id: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
  time: string;
  timestamp: string;
}

export interface ApprovalStatus {
  assignee: 'approved' | 'pending' | 'rejected';
  supervisor: 'approved' | 'pending' | 'rejected';
}

export interface AvailabilityEntry {
  id: string;
  date: string;
  type: 'available' | 'unavailable';
  period: 'all-day' | 'morning' | 'afternoon' | 'evening';
}

export interface AbsenceRequest {
  id: string;
  type: 'sick-leave' | 'annual-leave' | 'unpaid-leave' | 'other';
  fromDate: string;
  toDate: string;
  halfDay: boolean;
  status: 'approved' | 'pending' | 'rejected';
  comment?: string;
  days: number;
}
```

### `TrainerTimesheet.ts`

```ts
export interface TimesheetEntry {
  id: string;
  date: string;
  shiftId: string;
  position: string;
  location: string;
  confirmedHours: number;
  totalHours: number;
  confirmedPay: number;
  totalPay: number;
  status: 'confirmed' | 'pending' | 'disputed';
}

export interface PayPeriod {
  id: string;
  period: string;
  fromDate: string;
  toDate: string;
  totalHours: number;
  totalPay: number;
  status: 'upcoming' | 'paid';
  payDate?: string;
}
```

### `TrainerProfile.ts`

```ts
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Qualification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
}

export class TrainerProfile {
  constructor(
    public readonly id: string,
    public readonly avatar: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly dateOfBirth: string,
    public readonly gender: string,
    public readonly mobile: string,
    public readonly drivingLicence: boolean,
    public readonly accessToCar: boolean,
    public readonly qualifications: Qualification[],
    public readonly emergencyContacts: EmergencyContact[],
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase();
  }
}
```

---

## Mock Data (`frontend/src/mock/trainerData.ts`)

Mock data should be comprehensive enough to:

- Populate schedule list and calendar views.
- Drive shift detail (including approval, pay, and clock history).
- Fill timesheets and pay summaries.
- Populate trainer profile, qualifications, and emergency contacts.

Example snippet:

```ts
import { Shift } from '@/core/trainer/domain/entities/TrainerSchedule';
import { TrainerProfile, Qualification, EmergencyContact } from '@/core/trainer/domain/entities/TrainerProfile';

export const mockShifts: Shift[] = [
  {
    id: 'shift-001',
    position: 'Senior Fitness Trainer',
    location: {
      id: 'loc-001',
      name: 'ExcelCentre London',
      address: 'Royal Victoria Dock, 1 Western Gateway, London E16 1XL',
      country: 'United Kingdom',
      latitude: 51.5081,
      longitude: 0.0294,
    },
    startTime: '09:00',
    endTime: '17:00',
    date: '2026-02-07',
    breakMinutes: 60,
    assignee: 'John Smith',
    rate: 25.5,
    totalPay: 178.5,
    status: 'confirmed',
    notesCount: 2,
    hoursWorked: '12:15–16:30',
    totalHoursWorked: 4.25,
    clockHistory: [
      { id: 'c1', type: 'clock-in', time: '12:15', timestamp: '2026-02-07T12:15:00' },
      { id: 'c2', type: 'clock-out', time: '16:30', timestamp: '2026-02-07T16:30:00' },
    ],
    approvalStatus: {
      assignee: 'approved',
      supervisor: 'pending',
    },
  },
];

export const mockTrainerProfile = new TrainerProfile(
  'trainer-001',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
  'John',
  'Doe',
  'john.doe@trainer.com',
  '1990-05-15',
  'Male',
  '+44 7700 900000',
  true,
  true,
  [] as Qualification[],
  [] as EmergencyContact[],
);
```

---

## Implementation Phases (Checklists)

See the user‑facing checklist in the original prompt; in this repo we track progress via:

1. **Foundation**
   - Next.js + TypeScript project set up (already done).
   - CSS variables in `globals.css` aligned with trainer palette (to be adapted carefully).
   - Domain entities and mock data created.

2. **Navigation & Layout**
   - Bottom nav (mobile) – already implemented as `TrainerBottomNav`.
   - Top tabs (tablet) and sidebar (desktop) – implemented in `TrainerDashboardPageClient` and `DashboardShell`.

3. **Schedule**
   - Schedule list view (`ScheduleListView` + CSS Module).
   - Shift detail view aligned with reference sections.
   - Calendar month view.

4. **Timesheets**
   - Month calendar and day summary.
   - Timesheet entries list.

5. **More & Profile**
   - More menu.
   - Profile view (personal info, qualifications, emergency contacts).

6. **Polish**
   - Animations, loading states, error handling, accessibility, and responsive testing.

---

## Success Criteria (Summary)

- Mobile and desktop use the **same structure**; only navigation placement changes.
- All trainer pages respect the design system colours and spacing.
- Shift detail shows **all five sections** in the correct order.
- Calendar view uses a **blue header** with clear day indicators.
- Responsive navigation works seamlessly across bottom nav, top tabs, and sidebar.
- TypeScript strict mode passes with no errors for trainer modules.
- CSS Modules are used for new trainer UI components; existing Tailwind remains until migrated.
- Mock data renders correctly when APIs are unavailable (dev mode).

## Trainer Dashboard - Implementation Summary

### Single UX: Mobile = Desktop (Structure and Placement)

**Mandate:** The trainer dashboard uses the **same structure and placement** on desktop as on mobile. The mobile app is the source of truth. There is **no** separate desktop layout (no sidebar with Schedule, Open Shifts, Timesheet, Time off, Documents, Assets). Desktop shows the same three top-level areas and the same screens; only the chrome changes (e.g. bottom nav on mobile, top or side tab bar on desktop that still says Schedule | Timesheets | More).

---

### Features of the Trainer Dashboard

The trainer dashboard gives staff/trainers a single place to manage their shifts, time off, availability, timesheets, pay, and profile. All features are available under the same three areas (Schedule, Timesheets, More) on both mobile and desktop.

| Area | Feature | Description |
|------|---------|-------------|
| **Schedule** | View my schedule | List of days with confirmed shifts (time, venue, role) or "UNAVAILABLE – All day". Sub-tab to switch to "Available shifts" (open shifts). |
| **Schedule** | Calendar view | Optional month grid of scheduled days (via header calendar icon). |
| **Schedule** | Shift details | Tap a shift to see full details: position, location, time, date, break, assignee, rate, total pay. Option to add to calendar. |
| **Schedule** | Cancel shift | "Call supervisor to cancel" action from shift details (e.g. tap-to-call on mobile). |
| **Schedule** | Location & directions | From shift details, open location screen with map and "Get directions" (e.g. open in maps app). |
| **Schedule** | Add availability / request | FAB (+) to add new availability or request time off from schedule context. |
| **Timesheets** | View my timesheets | Month calendar; select a day to see confirmed hours, total hours, and pay for that day. |
| **Timesheets** | Per-day summary | For selected day: "Confirmed: X.XXh, pay £X.XX" and "Total: X.XXh, pay £X.XX", or "No timesheets for this day". |
| **More** | My profile | View and edit profile: avatar, name, email, date of birth, gender, mobile, driving licence, access to car, qualifications, emergency contacts. |
| **More** | Absences | View allowance (Allowed, Used, Booked, Requested, Left in days) and list of used absences (e.g. Sick Leave with dates). Request new absence via "+" (type, dates, half-day, comment). |
| **More** | Availability | List of dates with availability status ("All day", available/unavailable). Load more months (e.g. "Load April"). Add or edit availability. |
| **More** | Pay | View upcoming and past pay (tabs UPCOMING / PAST). |
| **More** | Documents | View documents issued to the trainer. Empty state with "Reload" when none. |
| **More** | Contacts | Access contacts (e.g. supervisors, support). |
| **More** | Settings | App or account settings. |
| **More** | Two-factor authentication | Configure or manage 2FA. |
| **More** | Support | Access support (e.g. help, contact). |

**Summary:** Schedule (view shifts, available shifts, shift details, location, directions, add availability); Timesheets (month view, per-day hours and pay); More (profile, absences, availability, pay, documents, contacts, settings, 2FA, support).

---

### Files Modified/Created (In Order)

1. **File:** `src/app/(dashboard)/trainer/page.tsx`
   - Layer: Presentation
   - Purpose: Trainer dashboard shell with **three areas only**: Schedule, Timesheets, More (bottom nav on mobile; same three items on desktop, e.g. tab bar or compact sidebar).

2. **File:** `src/app/(dashboard)/trainer/schedule/page.tsx`
   - Layer: Presentation
   - Purpose: **Schedule** – default **list view** by day (same as mobile). Sub-tabs: "SCHEDULE" and "AVAILABLE SHIFTS". Rows: day label + card (shift time, venue, role, or "UNAVAILABLE – All day"). FAB (+) for add.

3. **File:** `src/app/(dashboard)/trainer/schedule/calendar/page.tsx`
   - Layer: Presentation
   - Purpose: Optional calendar view (header calendar icon) – month grid, same as mobile.

4. **File:** `src/app/(dashboard)/trainer/schedule/shift/[id]/page.tsx`
   - Layer: Presentation
   - Purpose: **Shift info** full-screen (same as mobile): INFO (Position, Location link, Time, Date, Break, Assignee), PAY (Rate, Total pay), red "Call supervisor to cancel" button.

5. **File:** `src/app/(dashboard)/trainer/schedule/location/[id]/page.tsx`
   - Layer: Presentation
   - Purpose: **Location** screen: map pin, venue name, country, "Get directions" CTA.

6. **File:** `src/app/(dashboard)/trainer/timesheets/page.tsx`
   - Layer: Presentation
   - Purpose: **Timesheets** – month calendar at top, selected day highlighted; below: summary (Confirmed X.XXh, pay £X.XX / Total X.XXh, pay £X.XX) and per-day content or "No timesheets for this day".

7. **File:** `src/app/(dashboard)/trainer/more/page.tsx`
   - Layer: Presentation
   - Purpose: **More** – list (same order as mobile): Profile card, then Timesheets, Absences, Availability, Pay, Documents, Contacts, Settings, Two-factor authentication, Support.

8. **File:** `src/app/(dashboard)/trainer/more/absences/page.tsx`
   - Layer: Presentation
   - Purpose: **Absences** – year range, summary rows (Allowed, Used, Booked, Requested, Left in days), "USED" section with list of absences (e.g. Sick Leave – 1 day – date range). Header "+" opens Request absence modal.

9. **File:** `src/app/(dashboard)/trainer/more/availability/page.tsx`
   - Layer: Presentation
   - Purpose: **Availability** – month heading, per-day rows ("All day") with available/unavailable icon; footer "Load [next month]" link.

10. **File:** `src/app/(dashboard)/trainer/more/profile/page.tsx`
    - Layer: Presentation
    - Purpose: **Profile** – avatar, name, Email, Date of birth, Gender, Mobile, Driving licence, Access to car, Qualifications, Emergency contacts (same as mobile; no desktop-only long form).

11. **File:** `src/app/(dashboard)/trainer/more/pay/page.tsx`
    - Layer: Presentation
    - Purpose: **Pay** – tabs "UPCOMING" and "PAST"; list or empty state.

12. **File:** `src/app/(dashboard)/trainer/more/documents/page.tsx`
    - Layer: Presentation
    - Purpose: **Documents** – empty state: icon, "No documents", "There are no documents available to you.", "Reload".

13. **File:** `src/app/(dashboard)/trainer/more/contacts/page.tsx`
    - Layer: Presentation
    - Purpose: **Contacts** – list (same as mobile).

14. **File:** `src/app/(dashboard)/trainer/more/settings/page.tsx`
    - Layer: Presentation
    - Purpose: **Settings** (same as mobile).

15. **File:** `src/core/trainer/domain/entities/TrainerSchedule.ts`
    - Layer: Domain
    - Purpose: Aggregate for trainer schedule (sessions, availability, absences).

16. **File:** `src/core/trainer/domain/entities/TrainerTimesheet.ts`
    - Layer: Domain
    - Purpose: Aggregate for timesheets and pay.

17. **File:** `src/core/trainer/application/useCases/GetTrainerDashboardOverview.ts`
    - Layer: Application
    - Purpose: Dashboard summary (if needed).

18. **File:** `src/core/trainer/application/useCases/ManageTrainerSchedule.ts`
    - Layer: Application
    - Purpose: Schedule, availability, absence requests.

19. **File:** `src/core/trainer/application/useCases/SubmitTrainerTimesheet.ts`
    - Layer: Application
    - Purpose: Timesheet submit/update.

20. **File:** `src/core/trainer/domain/repositories/TrainerScheduleRepository.ts`
    - Layer: Domain
    - Purpose: Schedule repository interface.

21. **File:** `src/core/trainer/domain/repositories/TrainerTimesheetRepository.ts`
    - Layer: Domain
    - Purpose: Timesheet repository interface.

22. **File:** `src/infrastructure/http/repositories/RemoteTrainerScheduleRepository.ts`
    - Layer: Infrastructure
    - Purpose: Remote implementation for schedule.

23. **File:** `src/infrastructure/http/repositories/RemoteTrainerTimesheetRepository.ts`
    - Layer: Infrastructure
    - Purpose: Remote implementation for timesheets.

24. **File:** `src/infrastructure/http/apiEndpoints.ts`
    - Layer: Infrastructure
    - Purpose: Trainer endpoints (schedule, timesheets, absences, availability, pay, documents, contacts, profile).

25. **File:** `src/components/trainer/ScheduleListView.tsx`
    - Layer: Presentation
    - Purpose: Schedule list by day (cards / UNAVAILABLE) – same on mobile and desktop.

26. **File:** `src/components/trainer/ScheduleMonthCalendar.tsx`
    - Layer: Presentation
    - Purpose: Month grid for schedule (optional view) – same on both.

27. **File:** `src/components/trainer/ShiftInfoView.tsx`
    - Layer: Presentation
    - Purpose: Shift info layout (INFO + PAY + "Call supervisor to cancel") – same on both.

28. **File:** `src/components/trainer/TimesheetsMonthView.tsx`
    - Layer: Presentation
    - Purpose: Month calendar + single-day summary – same on both.

29. **File:** `src/components/trainer/modals/RequestTimeOffModal.tsx`
    - Layer: Presentation
    - Purpose: Request absence (type, dates, half-day, comment).

30. **File:** `src/components/trainer/modals/ExpenseModal.tsx`
    - Layer: Presentation
    - Purpose: Update expenses (from shift context if needed).

31. **File:** `src/components/trainer/TrainerProfileView.tsx`
    - Layer: Presentation
    - Purpose: Profile layout matching mobile (avatar, basics, qualifications, emergency contacts).

---

### Plain English Explanation

The trainer dashboard is **one experience** for both mobile and desktop. We follow the mobile app’s structure and placement exactly:

- **Three top-level areas only:** Schedule, Timesheets, More.
- **Schedule:** List view by day (with SCHEDULE / AVAILABLE SHIFTS sub-tabs); optional calendar view; shift tap opens full-screen Shift info; location opens Location screen with map and "Get directions".
- **Timesheets:** Month calendar + one selected day’s summary (or "No timesheets for this day").
- **More:** Profile card, then Absences, Availability, Pay, Documents, Contacts, Settings, Two-factor authentication, Support. Absences = summary + USED list; Availability = list by day; Pay = Upcoming/Past tabs; Documents = empty state + Reload; Profile = short form (no desktop-only long form).

Desktop does **not** get a different navigation (e.g. no separate Open Shifts, Time off, Documents, Assets in a sidebar). It gets the same three areas and the same screens; only the container (bottom nav vs top/side tabs) adapts to screen size.

---

### Summary of Changes

**Frontend (same structure on mobile and desktop)**

- **Navigation:** Exactly three items: **Schedule**, **Timesheets**, **More**. On mobile: bottom nav. On desktop: same three items (e.g. tab bar or minimal sidebar), no extra top-level links.
- **Schedule:** List view by day (default), sub-tabs SCHEDULE / AVAILABLE SHIFTS, FAB (+). Optional calendar view. Shift → full-screen Shift info (INFO + PAY + "Call supervisor to cancel"). Location → Location screen (map + "Get directions").
- **Timesheets:** Month calendar at top, selected day, then summary (Confirmed/Total hours and pay) and either day’s entries or "No timesheets for this day".
- **More:** Same list as mobile. Absences (summary + USED list + "+"); Availability (list + Load next period); Pay (UPCOMING/PAST); Documents (empty state + Reload); Profile (short form); Contacts; Settings; Two-factor authentication; Support.
- **Modals:** Request absence, Update expenses (when needed). Timezone selection only if required by backend (e.g. first use).
- **No desktop-only layouts:** No big month/week calendar as default schedule, no wide multi-week timesheet table, no full-year time-off calendar page, no separate Assets/Open Shifts/Time off as top-level nav. Open Shifts exists only as a sub-tab under Schedule.

**Backend (Laravel)**

- Endpoints aligned to these screens: schedule (list + detail), timesheets, absences/summary, availability, pay, documents, contacts, profile. No need to expose different "desktop" structures.

**Database**

- Unchanged from prior design (sessions, availability, time-off requests, timesheets, profile, etc.). No schema change for "same structure" rule.

---

### Clean Architecture Compliance

- Presentation uses the same routes and components for mobile and desktop; only layout chrome (nav placement) is responsive.
- Application and domain layers unchanged; infrastructure (API endpoints) serves the single set of screens.

---

### UX Mapping (Canonical – Same on Mobile and Desktop)

**1. Global navigation**
- Three items: **Schedule**, **Timesheets**, **More**. Order and labels identical on all breakpoints.

**2. Schedule**
- List view: month label, sub-tabs SCHEDULE | AVAILABLE SHIFTS. Rows: day (e.g. SAT 7) + card (time, venue, role, notes count) or "UNAVAILABLE – All day". FAB (+) bottom-right.
- Shift tap → **Shift info** full-screen: INFO (Position, Location, Time, Date, Break, Assignee), PAY (Rate, Total pay), red "Call supervisor to cancel".
- Location tap → **Location**: map, venue name, country, "Get directions".

**3. Timesheets**
- Month calendar; selected day highlighted. Below: "Confirmed: X.XXh, pay £X.XX" and "Total: X.XXh, pay £X.XX". Main area: entries for that day or "No timesheets for this day".

**4. More – Absences**
- Year range. Summary: Allowed, Used, Booked, Requested, Left (days). Section "USED" with list items (e.g. Sick Leave – 1 day – Fri 6 Feb 00:00–23:59). Header "+" → Request absence modal.

**5. More – Availability**
- Month heading. Rows: day + "All day" + icon (available/unavailable). Footer: "Load [next month]".

**6. More – Pay**
- Tabs UPCOMING | PAST. Content list or empty.

**7. More – Documents**
- Icon, "No documents", "There are no documents available to you.", "Reload".

**8. More – Profile**
- Avatar, name. Email, Date of birth, Gender, Mobile, Driving licence, Access to car. Sections: Qualifications, Emergency contacts (same as mobile; no long desktop-only form).

**9. Modals**
- Request absence: type, date from/to, half-day, comment. Expenses: when applicable from shift context.

---

### Next Steps

1. **Scaffold routes and shell**
   - Implement trainer layout with **only** Schedule, Timesheets, More (bottom nav on mobile; same three on desktop).
   - Build schedule list, shift info, location, timesheets month view, and all More sub-pages using the same components/layouts for both breakpoints.

2. **Implement components**
   - ScheduleListView, ScheduleMonthCalendar, ShiftInfoView, TimesheetsMonthView, TrainerProfileView (mobile-style), modals. No separate "desktop" schedule calendar or timesheet grid.

3. **Wire use-cases and API**
   - Repositories and endpoints for schedule, timesheets, absences, availability, pay, documents, contacts, profile.

4. **Accessibility and polish**
   - Same flows on desktop and mobile; ARIA, keyboard, focus, contrast.

5. **Testing**
   - E2E for Schedule (list → shift info → location), Timesheets, More (Absences, Availability, Pay, Documents, Profile) on both viewport sizes.
