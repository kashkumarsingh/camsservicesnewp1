## Trainer Reference Screens – Functional Breakdown

**Date:** 2026-02-10  
**Source:** Client-supplied screenshots of the “staff / trainer portal” (desktop + mobile).  
**Related docs:**  
- `database/TRAINER_PARENT_BOOKING_TABLES.md`  
- `features/TRAINER_DASHBOARD_COMPLETE_MASTER_SPECIFICATION.md`  

**Purpose:** Describe what the trainer-facing system does in the reference product, screen by screen, so we can align our new trainer experience (web + mobile) with it.

---

## 1. Desktop Web – Main Navigation

Left-hand sidebar items visible in the screenshots:

- **Schedule**
- **Open Shifts**
- **Timesheet**
- **Time off**
- **Documents**
- **Assets**

Top-right header:

- Notifications icon  
- Messages/email icon  
- User menu (trainer name + avatar)  

Bottom-left:

- Time zone indicator (e.g. “London GMT+00:00”)

---

## 2. Desktop – Schedule (Month Calendar)

Screens: `schedule` month view with coloured entries, popovers, and absence requests.

### 2.1 Month calendar

**What is shown:**

- Full **month grid** (e.g. February 2026).  
- Each date cell can show:
  - **Green blocks** – confirmed shifts (with time and title).
  - **Striped grey blocks** – days set as **Unavailable**.
  - **Pink/red blocks** – **Sick Leave** or other absences.
  - Dots or coloured text indicating scheduled items.

**Key interactions:**

- Clicking a shift opens a **session/shift detail popover**.  
- Clicking on a date may open a details pane or absence dialog.

**Primary data used (see database doc):**

- `booking_schedules` (core shift/session)
- `activities` / `activity_trainer` (role/position)
- `trainer_availability` (unavailable days)
- `session_completions`, `schedule_attendance` (status)
- `safeguarding_concerns` (indirectly for concerns raised)

### 2.2 Shift / session detail popover

**What is shown:**

- **Role / position** (e.g. “SAMPLE Event Steward”).  
- **Location** (e.g. “SAMPLE Celestia Grand Arena”).  
- **Date + time** (e.g. “09:00–17:00”).  
- **Total pay** (e.g. “Total Pay £100.00”).  
- Status banner (e.g. **Approved**).  
- Links for **Expenses (add)** and **Comments**.  

**Key interactions:**

- “Expenses (add)” opens an **Update Expenses** modal:
  - Expense type, amount, comment, Save.  
- “Comments” shows a **read-only comments accordion**.  

**Primary data used:**

- `booking_schedules` (shift core)
- `activities` (role)
- `time_entries` (hours/pay, if itemised)
- `payments` (confirmed pay)
- Expense/comments table(s) – to be designed for our system

### 2.3 Absence flows on calendar

Screens show:

- **Sick Leave** items displayed in the calendar.  
- Absence detail popover:
  - Type (e.g. “Sick Leave”).
  - Start/End date-time.
  - Comment.
  - Status (e.g. “Waiting for confirmation”).
  - Action: **Cancel request**.

**Implications for our design:**

- We need a formal **absence request entity** (e.g. `absence_requests`) linked to:
  - `trainers`
  - Optional `booking_schedules` (if cancelling specific sessions)
- Calendar must render:
  - Pending absences (e.g. striped or orange).
  - Approved absences (e.g. solid colour).

---

## 3. Desktop – Open Shifts

Screen: “Open Shifts” list for a date (e.g. Today).

**What is shown:**

- Header: **Open Shifts** with date selector (e.g. Today).  
- Table/list with:
  - **Position** (e.g. “SAMPLE Event Steward”).  
  - **Location** (e.g. “SAMPLE Celestia Grand Arena”).  
  - **Time** (e.g. “09:00–17:00”).  
  - **Rate** (e.g. “£100 / shift”).  
  - **Status** (e.g. “Confirmed Shift”).  
  - Instruction note (e.g. “To cancel this shift, please call…”).

**Key behaviour:**

- This is **not yet assigned** work, or work the trainer can pick up/cancel under rules.  
- Shifts can be claimed/accepted or cancelled by calling a supervisor.

**Primary data used:**

- `booking_schedules` (shifts flagged as “open” or “assigned to you”).
- `activities`, `trainers`, `trainer_availability`.  
- Possibly an “open/claimed” status field on schedules.

---

## 4. Desktop – Timesheet

Screens: weekly and monthly timesheet views.

### 4.1 Weekly timesheet (2nd Feb – 8th Feb)

**What is shown:**

- Filters:
  - Location dropdown (e.g. “All locations”).
  - Period presets: Last Week, Last Month, from–to date range.
- Table layout by **week**:
  - Row headers: Week No, Pay Rate.
  - Columns: each day (Start, End, Hours, Total).  
  - Footer: **Total Weekly Hours**, **Total Weekly Pay**.

**Primary data used:**

- `time_entries` (clock in/out, duration).
- `booking_schedules` / `sessions` (link to the underlying shifts).
- `payments` or per-hour pay calculation rules.

### 4.2 Monthly timesheet (1st Jan – 31st Jan)

**What is shown:**

- Similar table, expanded to cover multiple weeks in a month.  
- A “Confirmed Shift Hours” and “Total Pay” summary at the bottom.

**Implications:**

- Time-entry data must aggregate **per day, per week, per month**.  
- Need clear status: **Confirmed** vs pending or unapproved time.

---

## 5. Desktop – Time off

Screens: “My Absences in 2026” full-year calendar.

**What is shown:**

- Left sidebar:
  - **Allowance**: total days (e.g. 28.00).
  - **Used**, **Booked**, **Requested**, **Left**.
  - List of absence records (e.g. “Sick Leave 1/1”).  
- Main area:
  - Annual calendar (Jan–Dec) with dates highlighted for absences.
  - Button **Book time off** (opens request form).

**Request time off modal:**

- Fields:
  - Type (e.g. Holiday, Sick, etc.).
  - Date from, Date to.
  - Comment (required).
  - “Starts at half day”, “Ends at half day” options.
- Info bar: “My Absences in 20xx – x/y”.  
- Note on minimum notice: e.g. “The minimum period of notice for this type of absence is 7 days…”.

**Primary data used:**

- `absence_requests` (to be designed).
- `trainer_availability` or a derived calendar representation.
- Possibly entitlement/allowance table (e.g. `trainer_allowances`) – not yet in our schema.

---

## 6. Desktop – Documents and Assets

### 6.1 Documents

Mobile screenshot: **No documents** state.

- Simple list of documents accessible to the trainer.
- Empty state text and **Reload** action.

Likely data:

- A documents table or storage mapping for trainers (e.g. policies, contracts).

### 6.2 Assets

Desktop screenshot: **Assets assigned to you**.

- Metrics:
  - Total items, total value, total deposit given.  
- Table of assigned assets (empty in screenshot).  
- Right side: **History** panel (“It’s quiet here”).

Likely data:

- `assets` table plus `asset_assignments` linking to `trainers`.  
- Asset history / audit table.

---

## 7. Mobile App – Navigation and Tabs

Bottom navigation tabs shown:

- **Schedule**
- **Timesheets**
- **Time clock**
- **More**

Each tab surfaces a subset of the desktop functions optimised for mobile.

---

## 8. Mobile – Schedule Tab

### 8.1 Calendar + list

Screens:

- Month calendar at top (e.g. February).  
- Below, a **list of schedule items**:
  - For example:
    - “09:00–17:00 SAMPLE Celestia Grand Arena – SAMPLE Event Steward (1 note)”.
    - “UNAVAILABLE – All day” rows.  
- Floating **+** button for new actions (e.g. absence/unavailability).

Data used:

- `booking_schedules`, `activities`, `trainers`.  
- `trainer_availability` (“UNAVAILABLE” rows).
- Notes count (attached to shifts).

### 8.2 Shift info screen

Details for a single shift:

- INFO section:
  - Position.
  - Location.
  - Time.
  - Date.
  - Break.
  - Assignee (trainer name).  
- PAY section:
  - Rate.
  - Total pay.  
- CTA: **Call supervisor to cancel** (red button).

Data used:

- `booking_schedules`, `activities`, `trainers`.  
- Pay logic (rate and total – from bookings, payments, or time entries).

### 8.3 Absence detail and list

Screens:

- Absence detail:
  - Type (e.g. Sick Leave).
  - Period (From/To).
  - Comment.
  - Status banner: “Waiting for approval”.
  - Action: **Cancel request**.  
- Schedule view:
  - Shows the absence as a row under that date.

Data used:

- `absence_requests` (planned).
- `trainer_availability` or separate absence table.

### 8.4 Set as unavailable

Screen: select a date and choose **Set as unavailable** (green button).

Behaviour:

- Quick one-touch creation of an “unavailable all day” entry without manager approval.

Data used:

- `trainer_availability` record with type “unavailable”.

---

## 9. Mobile – Timesheets Tab

Screen: monthly-style timesheet overview.

- Top: Month selector (e.g. February).  
- Main area: list of days with summary:
  - Confirmed hours.
  - Pay for that day.  
- When no records for a day, show “No timesheets for this day”.

Data:

- Aggregated from `time_entries` per day, per month.
- Pay calculated and displayed per day, with totals.

---

## 10. Mobile – More Tab (Profile & Settings)

Top-level “More” screen:

- Header: avatar + trainer name.  
- Menu items:
  - Timesheets
  - Absences
  - Availability
  - Pay
  - Documents
  - Contacts
  - Settings
  - Two-factor authentication
  - Support

### 10.1 My profile

Profile screen:

- Avatar and full name.  
- Personal info:
  - Email.
  - Date of birth.
  - Gender.
  - Mobile.  
- Driving licence: Yes/No.  
- Access to car: Yes/No.  

Data used:

- Extended `trainers` (or related profile table) with DOB, gender, mobile, driving licence, access to car.

### 10.2 Qualifications

List of qualifications with expiry dates:

- Example entries:
  - Driving Licence – Expires 26 May 2030.
  - Public Liability Insurance – Expired 23 Oct 2025.
  - First Aid – Expires 21 Jul 2026.
  - Safeguarding, Prevent Duty, CPI Training, KCSIE, etc.
- Colour-coded cards for status:
  - Green – Valid.
  - Yellow – Expiring soon.
  - Red – Expired.

Data used:

- `trainer_qualifications` (or equivalent) with `expiry_date` and type/reference fields.

### 10.3 Pay (Upcoming / Past)

Screens:

- Tabs: **Upcoming** and **Past** pay.  
- Each list item would show:
  - Date or pay period.
  - Amount to be paid or paid.

Data used:

- Aggregated from `payments` and/or `time_entries` by trainer.

---

## 11. Summary: What This Tells Us to Build

At a high level, the trainer/staff app must provide:

- **Schedule & Open Shifts:** Calendar with shifts, availability and absences, plus an “open shifts” list to claim work.  
- **Time Tracking & Timesheets:** Clock in/out, daily/weekly/monthly summaries, and pay calculation.  
- **Absences & Availability:** Formal absence requests with approval, and quick “set as unavailable” for specific days.  
- **Profile & Compliance:** Rich profile data, qualifications with expiry tracking, emergency contacts, and secure settings (2FA, support).  
- **Documents & Assets:** Documents sent to staff and physical/virtual assets assigned to them, with history.

These screens form the UX benchmark for our own **trainer dashboard and mobile experience**. All backend schemas and frontend flows we add for trainers should map cleanly back to the entities and behaviours described above.

