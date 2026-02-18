# API Routes Reference

**Base URL:** `{API_BASE}/api/v1`  
**Source:** `backend/routes/api.php` · **Frontend constants:** `frontend/src/infrastructure/http/apiEndpoints.ts`  
**Last updated:** 2025-02-06

---

## 1. Health & Utility

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check; returns status, DB/cache status, request_id. |

**Frontend:** `API_ENDPOINTS.HEALTH`

---

## 2. Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register new user. |
| POST | `/auth/login` | No | Login; returns token / session. |
| GET | `/auth/user` | Sanctum | Current authenticated user. |
| POST | `/auth/logout` | Sanctum | Logout. |

**Frontend:** `AUTH_REGISTER`, `AUTH_LOGIN`, `AUTH_LOGOUT`, `AUTH_USER`

---

## 3. Authenticated – Parent / User (auth:sanctum)

### Parent profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/user/profile` | Get parent profile. |
| PUT | `/user/profile` | Update parent profile. |

**Frontend:** `PARENT_PROFILE`

### Children

| Method | Path | Description |
|--------|------|-------------|
| GET | `/children` | List children. |
| GET | `/children/{id}` | Show child. |
| POST | `/children` | Create child. |
| PUT | `/children/{id}` | Update child. |
| DELETE | `/children/{id}` | Delete child. |
| POST | `/children/{id}/archive` | Archive child. |

**Frontend:** `CHILDREN`, `CHILD_BY_ID(id)`

### Child checklist

| Method | Path | Description |
|--------|------|-------------|
| GET | `/children/{childId}/checklist` | Get checklist. |
| POST | `/children/{childId}/checklist` | Create/update checklist. |
| PUT | `/children/{childId}/checklist` | Create/update checklist. |

**Frontend:** `CHILD_CHECKLIST(childId)`

### User checklist

| Method | Path | Description |
|--------|------|-------------|
| GET | `/user/checklist` | Get user checklist. |
| POST | `/user/checklist` | Create/update. |
| PUT | `/user/checklist` | Create/update. |

**Frontend:** `USER_CHECKLIST`

### Dashboard (parent)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Dashboard stats. |
| GET | `/dashboard/session-notes` | Session notes (trainer notes for completed sessions). |
| POST | `/dashboard/safeguarding-concerns` | Submit safeguarding concern. |

**Frontend:** `DASHBOARD_STATS`, `DASHBOARD_SESSION_NOTES`, `DASHBOARD_SAFEGUARDING_CONCERNS`

### Approvals (admin only – middleware: admin)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/approvals/users/{userId}/approve` | Approve user. |
| POST | `/approvals/users/{userId}/reject` | Reject user. |
| POST | `/approvals/children/{childId}/approve` | Approve child. |
| POST | `/approvals/children/{childId}/reject` | Reject child. |

**Frontend:** `APPROVE_USER`, `REJECT_USER`, `APPROVE_CHILD`, `REJECT_CHILD`

---

## 4. Trainer API (auth:sanctum + trainer)

All under prefix **`/trainer`**.

### Bookings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/bookings` | List trainer bookings. |
| GET | `/trainer/bookings/stats` | Booking stats. |
| GET | `/trainer/bookings/{id}` | Show booking. |
| POST | `/trainer/bookings/{bookingId}/schedules` | Book session (create schedule). |
| PUT | `/trainer/bookings/{bookingId}/schedules/{scheduleId}/status` | Update schedule status. |

**Frontend:** `TRAINER_BOOKINGS`, `TRAINER_BOOKINGS_STATS`, `TRAINER_BOOKING_BY_ID`, `TRAINER_UPDATE_SCHEDULE_STATUS`, `TRAINER_BOOK_SESSION`

### Schedules

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/schedules` | List schedules. |
| PUT | `/trainer/schedules/{scheduleId}/attendance` | Mark attendance. |
| GET | `/trainer/schedules/{scheduleId}/notes` | Get notes. |
| POST | `/trainer/schedules/{scheduleId}/notes` | Create note. |

**Frontend:** `TRAINER_SCHEDULES`, `TRAINER_SCHEDULE_ATTENDANCE`, `TRAINER_SCHEDULE_NOTES`

### Schedule activities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/schedules/{scheduleId}/activities` | Get session activities. |
| POST | `/trainer/schedules/{scheduleId}/activities` | Assign activity. |
| POST | `/trainer/schedules/{scheduleId}/activities/confirm` | Confirm activities. |
| PUT | `/trainer/schedules/{scheduleId}/activities/override` | Override activity count. |
| DELETE | `/trainer/schedules/{scheduleId}/activities/override` | Remove override. |
| DELETE | `/trainer/schedules/{scheduleId}/activities/{activityId}` | Remove activity. |

**Frontend:** `TRAINER_SCHEDULE_ACTIVITIES`, `TRAINER_SCHEDULE_ACTIVITIES_CONFIRM`, `TRAINER_SCHEDULE_ACTIVITIES_OVERRIDE`, `TRAINER_SCHEDULE_ACTIVITY_REMOVE`

### Activity logs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/activity-logs` | List activity logs. |
| GET | `/trainer/activity-logs/children/{childId}` | Logs for a child. |
| GET | `/trainer/activity-logs/{id}` | Show log. |
| POST | `/trainer/activity-logs` | Create log. |
| PUT | `/trainer/activity-logs/{id}` | Update log. |
| POST | `/trainer/activity-logs/{id}/photos` | Upload photo. |

**Frontend:** `TRAINER_ACTIVITY_LOGS`, `TRAINER_CHILD_ACTIVITY_LOGS`, `TRAINER_ACTIVITY_LOG_BY_ID`, `TRAINER_ACTIVITY_LOG_UPLOAD_PHOTO`, `TRAINER_SCHEDULE_ACTIVITY_LOGS` (client may use schedule notes or activity logs for session-scoped logs)

### Time entries (clock in/out)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/time-entries` | List time entries (query: `date_from`, `date_to`, `booking_schedule_id`). |
| POST | `/trainer/schedules/{scheduleId}/clock-in` | Clock in for schedule. |
| POST | `/trainer/schedules/{scheduleId}/clock-out` | Clock out for schedule. |

**Frontend:** `TRAINER_TIME_ENTRIES`, `TRAINER_SCHEDULE_CLOCK_IN(scheduleId)`, `TRAINER_SCHEDULE_CLOCK_OUT(scheduleId)`

### Trainer profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/profile` | Get trainer profile. |
| PUT | `/trainer/profile` | Update profile. |
| POST | `/trainer/profile/image` | Upload profile image. |
| POST | `/trainer/profile/qualifications` | Upload qualification (body: `file`, `name`, optional `year`, `issuer`, `expiry_date`). |
| DELETE | `/trainer/profile/qualifications/{certificationId}` | Delete qualification. |
| PUT | `/trainer/profile/availability` | Update availability. |

**Frontend:** `TRAINER_PROFILE`, `TRAINER_PROFILE_IMAGE`, `TRAINER_PROFILE_QUALIFICATIONS`, `TRAINER_PROFILE_QUALIFICATION_DELETE`, `TRAINER_PROFILE_AVAILABILITY`

### Trainer emergency contacts

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/profile/emergency-contacts` | List emergency contacts. |
| POST | `/trainer/profile/emergency-contacts` | Create contact. |
| PUT | `/trainer/profile/emergency-contacts/{id}` | Update contact. |
| DELETE | `/trainer/profile/emergency-contacts/{id}` | Delete contact. |

**Frontend:** `TRAINER_PROFILE_EMERGENCY_CONTACTS`, `TRAINER_PROFILE_EMERGENCY_CONTACT_BY_ID`

### Trainer safeguarding concerns

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/safeguarding-concerns` | List concerns (trainer’s related children). |
| PATCH | `/trainer/safeguarding-concerns/{id}` | Update concern. |

**Frontend:** `TRAINER_SAFEGUARDING_CONCERNS`, `TRAINER_SAFEGUARDING_CONCERN_UPDATE`

---

## 5. Public API (cached – middleware: api.cache)

Cache: 300s list, 600s detail unless noted.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/pages` | List pages. |
| GET | `/pages/{slug}` | Page by slug. |
| GET | `/packages` | List packages. |
| GET | `/packages/{slug}` | Package by slug. |
| GET | `/blog/posts` | List blog posts. |
| GET | `/blog/posts/{slug}` | Post by slug. |
| GET | `/trainers` | List trainers. |
| GET | `/trainers/{slug}` | Trainer by slug. |
| GET | `/activities` | List activities. |
| GET | `/activities/{slug}` | Activity by slug. |
| GET | `/services` | List services. |
| GET | `/services/{slug}` | Service by slug. |
| GET | `/faqs` | List FAQs. |
| GET | `/faqs/{slug}` | FAQ by slug. |
| GET | `/site-settings` | Site settings. |
| GET | `/testimonials` | List testimonials. |
| GET | `/testimonials/{identifier}` | Testimonial by identifier. |
| GET | `/reviews/aggregate` | Reviews aggregate. |

**Frontend:** `PAGES`, `PAGE_BY_SLUG`, `PACKAGES`, `PACKAGE_BY_SLUG`, `BLOG_POSTS`, `BLOG_POST_BY_SLUG`, `TRAINERS`, `TRAINER_BY_SLUG`, `ACTIVITIES`, `ACTIVITY_BY_SLUG`, `SERVICES`, `SERVICE_BY_SLUG`, `FAQS`, `FAQ_BY_SLUG`, `SITE_SETTINGS`, `TESTIMONIALS`, `TESTIMONIAL_BY_IDENTIFIER`, `REVIEWS_AGGREGATE`

---

## 6. Write Endpoints (no caching)

### Public write

| Method | Path | Throttle | Description |
|--------|------|----------|-------------|
| POST | `/contact/submissions` | contact-submissions | Contact form. |
| POST | `/newsletter/subscribe` | — | Subscribe. |
| POST | `/newsletter/unsubscribe` | — | Unsubscribe. |
| POST | `/trainer-applications` | — | Trainer application. |

**Frontend:** `CONTACT_SUBMISSIONS`, `NEWSLETTER_SUBSCRIBE`, `NEWSLETTER_UNSUBSCRIBE`, `TRAINER_APPLICATIONS`

### Bookings & schedules (auth:sanctum + require.approval)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bookings` | List parent bookings. |
| GET | `/bookings/reference/{reference}` | Booking by reference. |
| GET | `/bookings/{id}` | Show booking. |
| POST | `/bookings` | Create booking. |
| POST | `/bookings/create-after-payment` | Create confirmed booking after payment (Pay First → Book Later). |
| PUT | `/bookings/{id}` | Update booking. |
| POST | `/bookings/{id}/cancel` | Cancel booking. |
| GET | `/children/{childId}/booked-dates` | Booked dates for child. |
| GET | `/children/{childId}/active-bookings` | Active bookings for child. |
| POST | `/bookings/{bookingId}/schedules` | Create schedule (session). |
| PUT | `/bookings/schedules/{id}` | Update schedule. |
| DELETE | `/bookings/schedules/{id}` | Delete schedule. |
| POST | `/bookings/schedules/{id}/cancel` | Cancel schedule. |

**Frontend:** `BOOKINGS`, `BOOKING_BY_ID`, `BOOKING_BY_REFERENCE`, `CREATE_BOOKING_AFTER_PAYMENT`, `BOOKING_SCHEDULES`, `BOOKING_SCHEDULE_BY_ID`, `BOOKING_CANCEL`, `BOOKING_SCHEDULE_CANCEL`, `CHILD_BOOKED_DATES`, `CHILD_ACTIVE_BOOKINGS`

### Payments

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bookings/{bookingId}/payments/create-intent` | Create payment intent. |
| POST | `/bookings/{bookingId}/payments/refresh` | Refresh booking payment status. |
| POST | `/payments/get-intent-from-session` | Get intent from session. |
| POST | `/payments/confirm` | Confirm payment. |

**Frontend:** `CREATE_PAYMENT_INTENT`, `BOOKING_REFRESH_PAYMENT`, `GET_PAYMENT_INTENT_FROM_SESSION`, `CONFIRM_PAYMENT`

### Webhooks

| Method | Path | Throttle | Description |
|--------|------|----------|-------------|
| POST | `/webhooks/stripe` | 60/min | Stripe webhook (no CSRF). |

---

## 7. Summary

- **Health:** 1 route.
- **Auth:** 4 routes.
- **Authenticated (parent/user):** profile, children, checklists, dashboard, approvals.
- **Trainer:** bookings, schedules, activities, activity logs, time entries, profile, qualifications, emergency contacts, safeguarding.
- **Public (cached):** pages, packages, blog, trainers, activities, services, FAQs, site-settings, testimonials, reviews.
- **Write (no cache):** contact, newsletter, trainer applications, bookings/schedules, payments, Stripe webhook.

All routes are versioned under **`/api/v1`**. Use `frontend/src/infrastructure/http/apiEndpoints.ts` for path constants; never hardcode paths in repositories.
