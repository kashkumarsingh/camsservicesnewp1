/**
 * Register page UI strings and config.
 * Never hardcode these in JSX — use these constants.
 */

export const REGISTER_HERO = {
  TITLE: 'Request access to CAMS',
  SUBTITLE:
    'Provide a few details so we can verify your identity, safeguarding requirements and the best way to support your family or organisation.',
} as const;

/** Benefit bullets for the register left column (icon + title + description). */
export const REGISTER_FEATURES = [
  {
    title: 'Quick verification',
    description: 'We review your details and get you set up so you can book and manage sessions.',
  },
  {
    title: 'One account for everything',
    description: 'Parents, carers and organisations use the same secure portal for bookings and progress.',
  },
  {
    title: 'Support when you need it',
    description: 'Our team is on hand to help with access, safeguarding and getting the most from CAMS.',
  },
] as const;

export const REGISTER_NOTICE = {
  PARENTS_TITLE: 'Parents & carers:',
  PARENTS_BODY:
    'we may contact you to confirm details before activating your account.',
  SCHOOLS_TITLE: 'Schools & local authorities:',
  SCHOOLS_BODY:
    'please use an official work email address so we can confirm your role.',
} as const;

export const REGISTER_FORM = {
  PAGE_TITLE: 'Create an account',
  SECTION_TITLE: 'Account details',
  REQUIRED_NOTE: 'All fields marked * are required.',
  LABEL_NAME: 'Full Name *',
  LABEL_EMAIL: 'Email Address *',
  LABEL_PHONE: 'Phone Number *',
  LABEL_ADDRESS: 'Address *',
  LABEL_POSTCODE: 'Postal Code *',
  LABEL_PASSWORD: 'Password *',
  LABEL_PASSWORD_CONFIRM: 'Confirm Password *',
  PLACEHOLDER_NAME: 'John Smith',
  PLACEHOLDER_EMAIL: 'john@example.com',
  PLACEHOLDER_PHONE: '07123 456789 or 020 1234 5678',
  PLACEHOLDER_ADDRESS: 'e.g., 123 High Street, Town',
  PLACEHOLDER_POSTCODE: 'e.g., IG9 5BT',
  PLACEHOLDER_PASSWORD: 'Min 8 chars, 1 number, 1 letter, 1 special',
  PLACEHOLDER_PASSWORD_CONFIRM: 'Re-enter your password',
  SUBMIT: 'Submit request',
  SENDING: 'Submitting request…',
  ALREADY_ACCOUNT: 'Already have an account?',
  SIGN_IN: 'Sign in',
  POST_SUBMIT_NOTE:
    'Once submitted, your request will be reviewed by our team. You will receive an email when your account is active and ready to use.',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',
} as const;

export const REGISTER_VALIDATION_FALLBACKS = {
  NAME: 'Please enter both first and last name',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid UK phone number',
  ADDRESS: 'Address must start with a door number',
  POSTCODE: 'Please enter a valid UK postal code',
  PASSWORD: 'Password is invalid',
  PASSWORD_MISMATCH: 'Passwords do not match',
  REGISTRATION_FAILED: 'Registration failed. Please check your details and try again.',
  REGISTRATION_FAILED_LATER: 'Registration failed. Please try again later.',
} as const;
