/**
 * Route path constants — single source of truth for app route strings.
 * Use these instead of hardcoding '/dashboard', '/admin', '/packages', etc. in components.
 * @see .cursor/rules/constants-ownership.mdc
 */

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  PACKAGES: '/packages',
  PACKAGE_BY_SLUG: (slug: string) => `/packages/${slug}`,
  BOOK_BY_SLUG: (slug: string) => `/book/${slug}`,
  BOOK_RETRIEVE: '/book/retrieve',
  SERVICES: '/services',
  SERVICE_BY_SLUG: (slug: string) => `/services/${slug}`,
  BLOG: '/blog',
  BLOG_POST_BY_SLUG: (slug: string) => `/blog/${slug}`,
  TRAINERS: '/trainers',
  TRAINER_BY_SLUG: (slug: string) => `/trainers/${slug}`,
  FAQ: '/faq',
  FAQ_BY_SLUG: (slug: string) => `/faq/${slug}`,
  POLICIES: '/policies',
  POLICIES_BY_SLUG: (slug: string) => `/policies/${slug}`,
  /** Page Builder: CMS-composed pages by slug */
  PAGE_BY_SLUG: (slug: string) => `/page/${slug}`,
  CONTACT: '/contact',
  CONTACT_THANK_YOU: '/contact/thank-you',
  LOGIN: '/login',
  REGISTER: '/register',
  ACCOUNT: '/account',
  BECOME_A_TRAINER: '/become-a-trainer',
  BOOKINGS: '/bookings',
  BOOKING_BY_REFERENCE: (reference: string) => `/bookings/${reference}`,
  BOOKING_PAYMENT: (reference: string) => `/bookings/${reference}/payment`,
  CHECKOUT: '/checkout',

  // Dashboard (base)
  DASHBOARD: '/dashboard',

  // Parent
  DASHBOARD_PARENT: '/dashboard/parent',
  DASHBOARD_PARENT_BOOKINGS: '/dashboard/parent/bookings',
  DASHBOARD_PARENT_CHILDREN: '/dashboard/parent/children',
  DASHBOARD_PARENT_PROGRESS: '/dashboard/parent/progress',
  DASHBOARD_PARENT_SETTINGS: '/dashboard/parent/settings',
  /** Schedule merged into Overview; kept for redirect compatibility. Use DASHBOARD_PARENT for calendar. */
  DASHBOARD_PARENT_SCHEDULE: '/dashboard/parent',

  // Trainer
  DASHBOARD_TRAINER: '/dashboard/trainer',
  DASHBOARD_TRAINER_BOOKINGS: '/dashboard/trainer/bookings',
  DASHBOARD_TRAINER_BOOKING_BY_ID: (id: string) => `/dashboard/trainer/bookings/${id}`,
  DASHBOARD_TRAINER_SCHEDULE: '/dashboard/trainer/schedule',
  DASHBOARD_TRAINER_SCHEDULES: '/dashboard/trainer/schedules',
  DASHBOARD_TRAINER_AVAILABILITY: '/dashboard/trainer/availability',
  DASHBOARD_TRAINER_SETTINGS: '/dashboard/trainer/settings',
  DASHBOARD_TRAINER_TIMESHEETS: '/dashboard/trainer/timesheets',

  // Admin
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_ADMIN_BOOKINGS: '/dashboard/admin/bookings',
  DASHBOARD_ADMIN_TRAINERS: '/dashboard/admin/trainers',
  DASHBOARD_ADMIN_PARENTS: '/dashboard/admin/parents',
  DASHBOARD_ADMIN_CHILDREN: '/dashboard/admin/children',
  DASHBOARD_ADMIN_PACKAGES: '/dashboard/admin/packages',
  DASHBOARD_ADMIN_TRAINER_APPLICATIONS: '/dashboard/admin/trainer-applications',
  DASHBOARD_ADMIN_PUBLIC_PAGES: '/dashboard/admin/public-pages',
  DASHBOARD_ADMIN_SETTINGS: '/dashboard/admin/settings',
} as const;
