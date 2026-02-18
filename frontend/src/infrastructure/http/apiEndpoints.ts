/**
 * Centralized API Endpoints
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Single source of truth for all API endpoints
 * Location: frontend/src/infrastructure/http/apiEndpoints.ts
 * 
 * All API endpoints MUST be defined here - no hardcoded strings in repositories
 */

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Authentication
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_USER: '/auth/user',
  
  // Children
  CHILDREN: '/children',
  CHILD_BY_ID: (id: string | number) => `/children/${id}`,
  CHILD_CHECKLIST: (childId: string | number) => `/children/${childId}/checklist`,
  CHILD_BOOKED_DATES: (childId: string | number) => `/children/${childId}/booked-dates`,
  
  // User Checklist
  USER_CHECKLIST: '/user/checklist',
  
  // Parent Profile
  PARENT_PROFILE: '/user/profile',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_SESSION_NOTES: '/dashboard/session-notes',
  DASHBOARD_ACTIVITY_LOGS: '/dashboard/activity-logs',
  DASHBOARD_SCHEDULE_DETAIL: (scheduleId: string | number) => `/dashboard/schedules/${scheduleId}`,
  DASHBOARD_SAFEGUARDING_CONCERNS: '/dashboard/safeguarding-concerns',

  // Centralised dashboard notifications (bell) – parents, trainers, admin
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_MARK_READ: (id: string | number) => `/notifications/${id}/read`,
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
  LIVE_REFRESH: '/live-refresh',

  // Admin Dashboard
  ADMIN_DASHBOARD_STATS: '/admin/dashboard/stats',

  // Admin Public Pages
  ADMIN_PUBLIC_PAGES: '/admin/public-pages',

  // Admin Services (full CRUD)
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SERVICE_BY_ID: (id: string | number) => `/admin/services/${id}`,

  // Admin Packages (full CRUD)
  ADMIN_PACKAGES: '/admin/packages',
  ADMIN_PACKAGE_BY_ID: (id: string | number) => `/admin/packages/${id}`,

  // Admin Activities (full CRUD)
  ADMIN_ACTIVITIES: '/admin/activities',
  ADMIN_ACTIVITY_BY_ID: (id: string | number) => `/admin/activities/${id}`,

  // Admin Users (full CRUD + approve/reject)
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id: string | number) => `/admin/users/${id}`,
  ADMIN_USER_APPROVE: (id: string | number) => `/admin/users/${id}/approve`,
  ADMIN_USER_REJECT: (id: string | number) => `/admin/users/${id}/reject`,

  // Admin Children
  ADMIN_CHILDREN: '/admin/children',
  ADMIN_CHILD_APPROVE: (id: string | number) => `/admin/children/${id}/approve`,
  ADMIN_CHILD_COMPLETE_CHECKLIST: (id: string | number) => `/admin/children/${id}/complete-checklist`,
  ADMIN_CHILD_NOTIFY_PARENT: (id: string | number) => `/admin/children/${id}/notify-parent`,

  // Admin Bookings (full CRUD + status updates + trainer assignment + bulk operations)
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_BY_ID: (id: string | number) => `/admin/bookings/${id}`,
  ADMIN_BOOKING_UPDATE_STATUS: (id: string | number) => `/admin/bookings/${id}/status`,
  ADMIN_BOOKING_UPDATE_NOTES: (id: string | number) => `/admin/bookings/${id}/notes`,
  ADMIN_BOOKING_AVAILABLE_TRAINERS: (sessionId: string | number) =>
    `/admin/bookings/sessions/${sessionId}/available-trainers`,
  ADMIN_BOOKING_ASSIGN_TRAINER: (sessionId: string | number) => `/admin/bookings/sessions/${sessionId}/trainer`,
  ADMIN_BOOKING_SESSION_ACTIVITY_LOGS: (sessionId: string | number) =>
    `/admin/bookings/sessions/${sessionId}/activity-logs`,
  ADMIN_BOOKINGS_BULK_CANCEL: '/admin/bookings/bulk-cancel',
  ADMIN_BOOKINGS_BULK_CONFIRM: '/admin/bookings/bulk-confirm',
  ADMIN_BOOKINGS_EXPORT: '/admin/bookings/export',

  // Admin Trainers (full CRUD + activate/deactivate + export)
  ADMIN_TRAINERS: '/admin/trainers',
  /** Trainer availability for date range (admin schedule timeline). Query: date_from, date_to */
  ADMIN_TRAINERS_AVAILABILITY: '/admin/trainers/availability',
  /** Bulk: absence dates for all active trainers in range. Query: date_from, date_to */
  ADMIN_TRAINERS_ABSENCE_DATES: '/admin/trainers/absence-dates',
  ADMIN_TRAINER_BY_ID: (id: string | number) => `/admin/trainers/${id}`,
  ADMIN_TRAINER_ACTIVATE: (id: string | number) => `/admin/trainers/${id}/activate`,
  ADMIN_TRAINER_IMAGE: (id: string | number) => `/admin/trainers/${id}/image`,
  ADMIN_TRAINER_QUALIFICATIONS: (id: string | number) => `/admin/trainers/${id}/qualifications`,
  ADMIN_TRAINER_QUALIFICATION_DELETE: (trainerId: string | number, certificationId: string | number) =>
    `/admin/trainers/${trainerId}/qualifications/${certificationId}`,
  ADMIN_TRAINERS_EXPORT: '/admin/trainers/export',
  ADMIN_TRAINER_SCHEDULES: (trainerId: string | number) => `/admin/trainers/${trainerId}/schedules`,
  ADMIN_TRAINER_SCHEDULE_BY_ID: (trainerId: string | number, scheduleId: string | number) =>
    `/admin/trainers/${trainerId}/schedules/${scheduleId}`,
  /** Sync from trainer dashboard: get availability dates for one trainer (read-only). Query: date_from, date_to */
  ADMIN_TRAINER_AVAILABILITY_DATES: (trainerId: string | number) =>
    `/admin/trainers/${trainerId}/availability-dates`,
  /** Absence dates (approved + pending) for one trainer; admin calendar sync. Query: date_from, date_to */
  ADMIN_TRAINER_ABSENCE_DATES: (trainerId: string | number) =>
    `/admin/trainers/${trainerId}/absence-dates`,

  // Admin Trainer Applications (list, show, approve, reject)
  ADMIN_TRAINER_APPLICATIONS: '/admin/trainer-applications',
  ADMIN_TRAINER_APPLICATION_BY_ID: (id: string | number) => `/admin/trainer-applications/${id}`,
  ADMIN_TRAINER_APPLICATION_APPROVE: (id: string | number) => `/admin/trainer-applications/${id}/approve`,
  ADMIN_TRAINER_APPLICATION_REJECT: (id: string | number) => `/admin/trainer-applications/${id}/reject`,
  ADMIN_TRAINER_ABSENCE_REQUESTS: '/admin/trainer-absence-requests',
  ADMIN_TRAINER_ABSENCE_APPROVE: (id: string | number) => `/admin/trainer-absence-requests/${id}/approve`,
  ADMIN_TRAINER_ABSENCE_REJECT: (id: string | number) => `/admin/trainer-absence-requests/${id}/reject`,

  // Legacy Approvals (kept for backward compatibility)
  APPROVE_USER: (userId: string | number) => `/approvals/users/${userId}/approve`,
  REJECT_USER: (userId: string | number) => `/approvals/users/${userId}/reject`,
  APPROVE_CHILD: (childId: string | number) => `/approvals/children/${childId}/approve`,
  REJECT_CHILD: (childId: string | number) => `/approvals/children/${childId}/reject`,
  
  // Trainer Endpoints
  TRAINER_BOOKINGS: '/trainer/bookings',
  TRAINER_BOOKINGS_STATS: '/trainer/bookings/stats',
  TRAINER_BOOKING_BY_ID: (id: string | number) => `/trainer/bookings/${id}`,
  TRAINER_UPDATE_SCHEDULE_STATUS: (bookingId: string | number, scheduleId: string | number) => `/trainer/bookings/${bookingId}/schedules/${scheduleId}/status`,
  
  // Trainer Schedule Endpoints (Phase 2)
  TRAINER_SCHEDULES: '/trainer/schedules',
  TRAINER_SCHEDULE_BY_ID: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}`,
  TRAINER_SCHEDULE_CONFIRM_ASSIGNMENT: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/assignment/confirm`,
  TRAINER_SCHEDULE_DECLINE_ASSIGNMENT: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/assignment/decline`,
  TRAINER_SCHEDULE_ATTENDANCE: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/attendance`,
  TRAINER_SCHEDULE_CURRENT_ACTIVITY: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/current-activity`,
  TRAINER_SCHEDULE_NOTES: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/notes`,
  
  // Trainer Activity Assignment Endpoints (New Feature)
  TRAINER_SCHEDULE_ACTIVITIES: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/activities`,
  TRAINER_SCHEDULE_ACTIVITIES_CONFIRM: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/activities/confirm`,
  TRAINER_SCHEDULE_ACTIVITIES_OVERRIDE: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/activities/override`,
  TRAINER_SCHEDULE_ACTIVITY_REMOVE: (scheduleId: string | number, activityId: string | number) => `/trainer/schedules/${scheduleId}/activities/${activityId}`,
  
  // Trainer Activity Log Endpoints (Phase 3)
  TRAINER_ACTIVITY_LOGS: '/trainer/activity-logs',
  TRAINER_CHILD_ACTIVITY_LOGS: (childId: string | number) => `/trainer/activity-logs/children/${childId}`,
  TRAINER_ACTIVITY_LOG_BY_ID: (id: string | number) => `/trainer/activity-logs/${id}`,
  TRAINER_ACTIVITY_LOG_UPLOAD_PHOTO: (id: string | number) => `/trainer/activity-logs/${id}/photos`,
  TRAINER_SCHEDULE_ACTIVITY_LOGS: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/activity-logs`,
  
  // Trainer Time Tracking
  TRAINER_TIME_ENTRIES: '/trainer/time-entries',
  TRAINER_SCHEDULE_CLOCK_IN: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/clock-in`,
  TRAINER_SCHEDULE_CLOCK_OUT: (scheduleId: string | number) => `/trainer/schedules/${scheduleId}/clock-out`,
  
  // Trainer Profile Endpoints (Phase 5)
  TRAINER_PROFILE: '/trainer/profile',
  TRAINER_PROFILE_IMAGE: '/trainer/profile/image',
  TRAINER_PROFILE_QUALIFICATIONS: '/trainer/profile/qualifications',
  TRAINER_PROFILE_QUALIFICATION_DELETE: (certificationId: string) => `/trainer/profile/qualifications/${certificationId}`,
  TRAINER_PROFILE_AVAILABILITY: '/trainer/profile/availability',
  /** Availability by calendar dates (single/multi select on dashboard calendar) */
  TRAINER_AVAILABILITY_DATES: '/trainer/availability-dates',
  /** Absence requests (submit; list returns approved_dates + pending_dates for calendar) */
  TRAINER_ABSENCE_REQUESTS: '/trainer/absence-requests',
  TRAINER_PROFILE_EMERGENCY_CONTACTS: '/trainer/profile/emergency-contacts',
  TRAINER_PROFILE_EMERGENCY_CONTACT_BY_ID: (id: string | number) => `/trainer/profile/emergency-contacts/${id}`,
  TRAINER_SAFEGUARDING_CONCERNS: '/trainer/safeguarding-concerns',
  TRAINER_SAFEGUARDING_CONCERN_UPDATE: (id: string | number) => `/trainer/safeguarding-concerns/${id}`,
  
  // Packages
  PACKAGES: '/packages',
  PACKAGE_BY_SLUG: (slug: string) => `/packages/${slug}`,
  
  // Services
  SERVICES: '/services',
  SERVICE_BY_SLUG: (slug: string) => `/services/${slug}`,
  
  // Trainers
  TRAINERS: '/trainers',
  TRAINER_BY_SLUG: (slug: string) => `/trainers/${slug}`,
  
  // Activities
  ACTIVITIES: '/activities',
  ACTIVITY_BY_SLUG: (slug: string) => `/activities/${slug}`,
  
  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string | number) => `/bookings/${id}`,
  BOOKING_BY_REFERENCE: (reference: string) => `/bookings/reference/${reference}`,
  CREATE_BOOKING_AFTER_PAYMENT: '/bookings/create-after-payment', // Pay First → Book Later flow: Creates confirmed booking after payment
  BOOKING_REFRESH_PAYMENT: (bookingId: string | number) => `/bookings/${bookingId}/payments/refresh`,
  BOOKING_SCHEDULES: (bookingId: string | number) => `/bookings/${bookingId}/schedules`, // Pay First → Book Later: Parents book sessions from dashboard
  BOOKING_SCHEDULE_BY_ID: (id: string | number) => `/bookings/schedules/${id}`, // Update/delete individual sessions
  BOOKING_CANCEL: (id: string | number) => `/bookings/${id}/cancel`,
  BOOKING_TOP_UP: (id: string | number) => `/bookings/${id}/top-up`,
  BOOKING_SCHEDULE_CANCEL: (id: string | number) => `/bookings/schedules/${id}/cancel`,
  CHILD_ACTIVE_BOOKINGS: (childId: string | number) => `/children/${childId}/active-bookings`, // Get active bookings for a child
  
  // Payments
  CREATE_PAYMENT_INTENT: (bookingId: string | number) => `/bookings/${bookingId}/payments/create-intent`,
  GET_PAYMENT_INTENT_FROM_SESSION: '/payments/get-intent-from-session',
  CONFIRM_PAYMENT: '/payments/confirm',
  
  // Trainer Booking Endpoints (Pay First → Book Later)
  TRAINER_BOOK_SESSION: (bookingId: string | number) => `/trainer/bookings/${bookingId}/schedules`, // Trainers can book sessions for assigned bookings
  
  // Contact
  CONTACT_SUBMISSIONS: '/contact/submissions',
  
  // Newsletter
  NEWSLETTER_SUBSCRIBE: '/newsletter/subscribe',
  NEWSLETTER_UNSUBSCRIBE: '/newsletter/unsubscribe',
  
  // Trainer Applications
  TRAINER_APPLICATIONS: '/trainer-applications',
  
  // Pages
  PAGES: '/pages',
  PAGE_BY_SLUG: (slug: string) => `/pages/${slug}`,
  
  // FAQs
  FAQS: '/faqs',
  FAQ_BY_SLUG: (slug: string) => `/faqs/${slug}`,
  
  // Blog
  BLOG_POSTS: '/blog/posts',
  BLOG_POST_BY_SLUG: (slug: string) => `/blog/posts/${slug}`,
  
  // Reviews
  REVIEWS_AGGREGATE: '/reviews/aggregate',
  
  // Testimonials
  TESTIMONIALS: '/testimonials',
  TESTIMONIAL_BY_IDENTIFIER: (identifier: string) => `/testimonials/${identifier}`,
  
  // Site Settings
  SITE_SETTINGS: '/site-settings',
} as const;
