/**
 * Login page UI strings.
 * Never hardcode these in JSX — use these constants.
 */

export const LOGIN_HERO = {
  TITLE: 'Sign in to CAMS',
  SUBTITLE:
    'Secure access for parents, trainers and commissioning partners. Use your work or registered email address.',
} as const;

/** Benefit bullets for the sign-in left column (icon + title + description). */
export const LOGIN_FEATURES = [
  {
    title: 'Secure access',
    description: 'Sign in with confidence. Your credentials and session are protected.',
  },
  {
    title: 'One place for everyone',
    description: 'Parents, trainers and commissioning partners use the same secure portal.',
  },
  {
    title: 'Manage bookings and progress',
    description: 'View sessions, update details and track progress from your dashboard.',
  },
] as const;

export const LOGIN_NOTICE = {
  PARENTS_TITLE: 'Parents & carers:',
  PARENTS_BODY:
    'use the email you registered with when purchasing a package or booking sessions.',
  SCHOOLS_TITLE: 'Local authorities & schools:',
  SCHOOLS_BODY:
    'sign in with the account set up by our team. Contact us if you need your access resetting.',
} as const;

export const LOGIN_FORM = {
  PAGE_TITLE: 'Sign in',
  SECTION_TITLE: 'Account credentials',
  REQUIRED_NOTE: 'All fields are required.',
  LABEL_EMAIL: 'Email Address *',
  LABEL_PASSWORD: 'Password *',
  PLACEHOLDER_EMAIL: 'name@organisation.co.uk',
  PLACEHOLDER_PASSWORD: 'Enter your password',
  SUBMIT: 'Sign in',
  SENDING: 'Signing in…',
  NO_ACCOUNT: "Don't have an account?",
  REQUEST_ACCESS: 'Request access',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',
} as const;

export const LOGIN_VALIDATION_FALLBACKS = {
  EMAIL: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
} as const;
