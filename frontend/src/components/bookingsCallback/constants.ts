/**
 * Bookings callback (payment return) page UI strings.
 * Never hardcode these in JSX — use these constants.
 */

export const CALLBACK_LOADING = {
  TITLE: 'Processing Your Payment',
  SUBTITLE: 'Please wait while we confirm your payment status...',
  SECURE: 'Secure payment processing',
  CONFIRMING: 'Confirming your payment...',
} as const;

export const CALLBACK_SUCCESS = {
  HEADING: 'Payment Successful! 🎉',
  MESSAGE_DEFAULT:
    'Your payment was processed successfully! Your booking is now confirmed and ready to use.',
  MESSAGE_FALLBACK:
    "Your payment was processed successfully! If your booking status hasn't updated yet, it will update shortly. Please check your dashboard.",
  MESSAGE_NO_SESSION:
    'Your payment was processed successfully! Your booking is now confirmed.',
  REFERENCE_TITLE: 'Your Booking Reference',
  REFERENCE_HELP: 'Save this number for your records',
  COPY_TO_CLIPBOARD: '📋 Click to copy',
  WHATS_NEXT_TITLE: "What Happens Next?",
  WHATS_NEXT_SUBTITLE: 'Your journey with CAMS',
  BOOK_SESSIONS_TITLE: '📅 Book Your Sessions',
  BOOK_SESSIONS_BODY:
    'Schedule your activities now. You can book sessions anytime from your dashboard.',
  SESSIONS_BOOKED_TITLE: '✅ Sessions Already Booked',
  SESSIONS_BOOKED_BODY: 'Your sessions are scheduled! View them in your dashboard.',
  CONFIRMATION_EMAIL_TITLE: '📧 Confirmation Email',
  CONFIRMATION_EMAIL_BODY:
    'A confirmation email with all details has been sent to your email address.',
  CTA_BOOK_SESSIONS: 'Book Your Sessions Now',
  CTA_DASHBOARD: 'Go to Dashboard',
  CTA_BOOK_ANOTHER: 'Book Another Package',
} as const;

export const CALLBACK_CANCELED = {
  TITLE: 'Payment Incomplete',
  SUBTITLE: 'Your booking is ready to go!',
  LOADING_BOOKING: 'Loading booking details...',
  NO_DETAILS: 'Booking details will be available once payment is completed.',
  RECOVERY_MESSAGE:
    "Your booking is ready to go! Complete your payment whenever you're ready. Your booking will be confirmed as soon as payment is received.",
  CTA_COMPLETE_PAYMENT: 'Complete Payment',
  CTA_DASHBOARD: 'Go to Dashboard',
  PACKAGE_LABEL: 'Package',
  FOR_LABEL: 'For:',
} as const;

export const CALLBACK_ERROR = {
  TITLE: 'Payment Status Unknown',
  MESSAGE: 'Unable to determine payment status. Please check your dashboard for booking details.',
  CTA_DASHBOARD: 'Go to Dashboard',
  CTA_BOOK_PACKAGE: 'Book a Package',
} as const;

export const TOAST_COPY_SUCCESS = 'Booking reference copied to clipboard!';
