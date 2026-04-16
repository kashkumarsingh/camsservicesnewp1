/**
 * Forgot password and reset password page UI strings.
 * Single source of truth — do not hardcode in JSX.
 */

export const FORGOT_PASSWORD_FORM = {
  PAGE_TITLE: 'Forgot your password?',
  SUBTITLE: 'Enter your email and we’ll send you a link to reset your password.',
  LABEL_EMAIL: 'Email Address *',
  PLACEHOLDER_EMAIL: 'john@example.com',
  SUBMIT: 'Send reset link',
  SENDING: 'Sending…',
  BACK_TO_LOGIN: 'Back to sign in',
  SUCCESS_MESSAGE:
    'We’ve sent a password reset link to your email. Check your inbox and spam folder.',
  /** Full message for API comparison; use PREFIX + link + SUFFIX in UI so "create an account" is a link. */
  EMAIL_NOT_REGISTERED: 'This email is not registered with us. Please check the address or create an account.',
  EMAIL_NOT_REGISTERED_PREFIX: 'This email is not registered with us. Please check the address or ',
  EMAIL_NOT_REGISTERED_LINK: 'create an account',
  EMAIL_NOT_REGISTERED_SUFFIX: '.',
} as const;

export const RESET_PASSWORD_FORM = {
  PAGE_TITLE: 'Reset your password',
  SUBTITLE: 'Enter your new password below.',
  LABEL_PASSWORD: 'New password *',
  LABEL_PASSWORD_CONFIRM: 'Confirm new password *',
  PLACEHOLDER_PASSWORD: 'Min 8 chars, 1 number, 1 letter, 1 special',
  PLACEHOLDER_PASSWORD_CONFIRM: 'Re-enter your new password',
  SUBMIT: 'Reset password',
  SENDING: 'Resetting…',
  BACK_TO_LOGIN: 'Back to sign in',
  SUCCESS_MESSAGE: 'Your password has been reset. You can now sign in.',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',
} as const;

export const PASSWORD_RESET_VALIDATION_FALLBACKS = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_INVALID: 'Password is invalid',
  PASSWORD_MISMATCH: 'Passwords do not match',
  TOKEN_MISSING: 'Reset link is invalid or expired. Please request a new one.',
} as const;
