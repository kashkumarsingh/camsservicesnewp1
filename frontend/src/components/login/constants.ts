/**
 * Login page UI strings.
 * Never hardcode these in JSX — use these constants.
 */

export const LOGIN_FORM = {
  PAGE_TITLE: 'Welcome Back',
  SUBTITLE: 'Sign in to your account',
  LABEL_EMAIL: 'Email Address *',
  LABEL_PASSWORD: 'Password *',
  PLACEHOLDER_EMAIL: 'john@example.com',
  PLACEHOLDER_PASSWORD: 'Enter your password',
  SUBMIT: 'Sign In',
  SENDING: 'Signing in…',
  NO_ACCOUNT: "Don't have an account?",
  REQUEST_ACCESS: 'Create one',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',
} as const;

export const LOGIN_VALIDATION_FALLBACKS = {
  EMAIL: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
} as const;
