## Trainer Dashboard - Complete Master Specification

## All features identified (from client's reference app)

Your client has shown you a **complete trainer dashboard** with all these features:

---

## **Feature matrix: what needs to be built**

| Feature | Type | Priority | Status |
|---------|------|----------|--------|
| **Schedule Calendar** | Navigation | 🔴 CRITICAL | Core |
| **Today's Sessions** | Hero Section | 🔴 CRITICAL | Core |
| **Session Details** | Display | 🔴 CRITICAL | Core |
| **Time Tracking (Clock In/Out)** | Action | 🔴 CRITICAL | Core |
| **Approval Workflow** | Workflow | 🟠 HIGH | Core |
| **Payment Info** | Display | 🟠 HIGH | Core |
| **Past Session History** | Display | 🟠 HIGH | Core |
| **Absence Request** | Action | 🟠 HIGH | New |
| **Mark Unavailable** | Quick Action | 🟠 HIGH | New |
| **Clock History** | Display | 🟡 MEDIUM | New |
| **Profile Management** | Display | 🟡 MEDIUM | New |
| **Qualifications Tracking** | Compliance | 🔴 **CRITICAL** | New |
| **Emergency Contacts** | Display | 🟡 MEDIUM | New |
| **Responsive Design** | UX | 🟠 HIGH | All |

---

## **Complete tab structure**

### **Tab 1: Schedule 📅** (multi‑view calendar)

**View 1: Future dates**

```text
Click future date (e.g., Feb 12)
├─ Show "All day"
├─ Two options:
│  ├─ [Request Absence] → Formal request (approval needed)
│  └─ [Mark Unavailable] → Quick block (no approval)
└─ If Request Absence selected:
   ├─ Form: Type / From / To / Reason / Attachment
   ├─ Submit → Status: "Waiting for approval"
   ├─ Can [Cancel request]
   └─ Shows on calendar as orange ⊘
```

**View 2: Today/upcoming**

```text
TODAY'S SESSIONS (Hero Section)
├─ ● 12:15 LeHi (Flexi 1:1)
│  [Clock In] [Details]
├─ ● 15:30 Test Child (Training)
│  [View Details]
│
SESSION DETAIL (when clicked)
├─ Time: Scheduled vs Actual
├─ Work Info: Hours, Clock History
├─ Approval: Trainer ✓ / Supervisor ⏳
├─ Pay: Rate + Total (calculated)
└─ Actions: [Clock In] [Approve Hours]
```

**View 3: Past dates**

```text
PAST SESSIONS (Historical)
├─ ✓ 09:00-12:00 OliT
│  CANCELLED - Charge / Pay
│  [1 NOTE]
├─ ✓ 12:15-15:15 LeHi
│  COMPLETED
│  [View Receipt]
└─ Earnings: £85
```

---

### **Tab 2: Time Clock ⏰** (history)

```text
CLOCK HISTORY

▶ Clocked in
  You at 1 Dec 09:00

◼ Clocked out
  You at 1 Dec 11:12

[More entries...]
```

---

### **Tab 3: More ≡** (profile & admin)

**Section A: My profile**

```text
[KH Avatar]
Kenneth Holder

Email: mrkennethholder@outlook.com
DOB: 11 October 1979
Gender: Male
Mobile: 07939990587
Driving licence: Yes
Car access: No

[✏️ Edit Profile]
```

**Section B: Qualifications** – most critical

```text
QUALIFICATIONS

🟫 Driving Licence
   Expires: 26 May 2030

🟥 Public Liability Insurance
   Fish Insurance
   Expired: 23 Oct 2025 ⚠️

🟨 First Aid
   Expires: 21 Jul 2026

🟥 KCSIE 2024
   Expired: 31 Aug 2025 ⚠️

🟦 Safeguarding (annual renewal)
   Expires: 21 Jul 2026

Colour codes:
🟩 Green = Valid (>3 months)
🟨 Yellow = Expiring (< 3 months)
🟥 Red = Expired/Overdue
🟦 Blue = Pending/Neutral
```

**Section C: Emergency contacts**

```text
Name
Relationship
Phone
Email (optional)

[Add Contact]
```

---

## **Responsive layout**

### Desktop (1200px+)

```text
┌──────────┬──────────────┬──────────────┐
│ TABS     │ CONTENT      │ ACTIONS      │
│ ────     │ ─────────    │ ──────────   │
│ [📅]     │ Calendar +   │ [Clock In]   │
│ [⏰]     │ Sessions +   │ [Approve]    │
│ [≡]      │ Detail       │ Earnings     │
│          │              │ Performance  │
│          │              │ Pending      │
└──────────┴──────────────┴──────────────┘
```

### Tablet (768px)

```text
┌────────────────────────────┐
│ [📅][⏰][≡]                 │
├────────────────────────────┤
│ Content (full width)       │
├────────────────────────────┤
│ Right sidebar (drawer)     │
└────────────────────────────┘
```

### Mobile (375px)

```text
┌──────────────────┐
│ [📅][⏰][≡]       │
├──────────────────┤
│ Content (stacked)│
├──────────────────┤
│ [Swipe for more] │
└──────────────────┘
```

---

## **Database tables needed**

### New tables

1. `time_entries` — clock in/out records  
2. `trainer_qualifications` — certifications with expiry  
3. `emergency_contacts` — emergency contact info  
4. `trainer_availability` — unavailable dates  
5. `absence_requests` — formal absence requests  
6. `session_statuses` — session history (completed/cancelled)  

### Updated tables

1. `trainers` — add: `dob`, `gender`, `driving_licence`, `car_access`, `avatar`  
2. `bookings` — add: `status`, `cancellation_reason`, `cancelled_at`, `absence_request_id`  

---

## **Implementation timeline**

| Phase | What | Days | Priority |
|-------|------|------|----------|
| 1 | Calendar + date selection | 3 | 🔴 |
| 2 | Time tracking (clock in/out) | 2 | 🔴 |
| 3 | Approval workflow + payment | 2 | 🔴 |
| 4 | Past session history + status | 2 | 🟠 |
| 5 | Mark unavailable + calendar visual | 2 | 🟠 |
| 6 | Absence request form + approval | 3 | 🟠 |
| 7 | Clock history tab | 2 | 🟠 |
| 8 | Profile section | 2 | 🟡 |
| 9 | Qualifications (with expiry tracking) | 3 | 🔴 |
| 10 | Emergency contacts | 1 | 🟡 |
| 11 | Responsive testing + polish | 2 | 🟠 |
| **Total** | **Complete professional dashboard** | **~25 days (3‑4 weeks)** | |

---

## **Critical success factors**

### Must have (cannot ship without)

- **Calendar navigation**  
- **Time tracking (proof of work)**  
- **Qualifications tracking (compliance/safety)**  
- **Session history with status (transparency)**  
- **Approval workflow (accountability)**  

### Should have (important)

- **Absence management (proper scheduling)**  
- **Payment transparency (trainer trust)**  
- **Profile management (completeness)**  
- **Mobile responsiveness (accessibility)**  

### Nice to have (future)

- Notes/documents on absences  
- Automated compliance alerts  
- Earnings forecasting  
- Integration with payroll  

---

## **What makes this enterprise‑grade**

This dashboard matches professional workforce platforms such as Parim because it includes:

- **Time tracking** — accountability and proof of work  
- **Approval workflows** — trust and verification  
- **Compliance management** — safety and regulations  
- **Session history** — transparency and auditing  
- **Absence management** — proper scheduling  
- **Payment visibility** — trainer confidence  
- **Performance metrics** — feedback and improvement  
- **Mobile‑first design** — accessibility  
- **User‑centric UX** — ease of use  

---

## **Client‑facing summary**

We have reviewed all reference materials and defined the complete trainer dashboard we will build:

- **Schedule tab**
  - Calendar with future dates
  - Mark unavailable (quick) or request absence (formal)
  - Today's sessions with time tracking
  - Past sessions with status and earnings

- **Time clock tab**
  - Complete clock history

- **More tab**
  - Profile management
  - Qualifications with compliance tracking
  - Emergency contacts

**Timeline:** 3–4 weeks  
**Quality:** Enterprise‑grade  
**Readiness:** Production‑ready specification for implementation  

