/**
 * Register page UI strings and config.
 * Never hardcode these in JSX — use these constants.
 */

export const REGISTER_FORM = {
  PAGE_TITLE: 'Create Account',
  SUBTITLE: 'Register to book packages and services',
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
  PLACEHOLDER_POSTCODE: 'e.g., IG9 SBL',
  PLACEHOLDER_PASSWORD: 'Min 8 chars, 1 number, 1 letter, 1 special',
  PLACEHOLDER_PASSWORD_CONFIRM: 'Re-enter your password',
  SUBMIT: 'Create Account',
  SENDING: 'Creating account…',
  ALREADY_ACCOUNT: 'Already have an account?',
  SIGN_IN: 'Sign in',
  POST_SUBMIT_NOTE:
    "Note: After registration, your account will be pending admin approval. You'll be notified once approved and can then add children and book packages.",
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
