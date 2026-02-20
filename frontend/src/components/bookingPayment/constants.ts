/**
 * Booking payment page — user-facing copy. Single source of truth for public payment view.
 */

export const BOOKING_PAYMENT_LOADING = {
  message: 'Loading booking details...',
} as const;

export const BOOKING_PAYMENT_ERROR = {
  title: 'Error Loading Booking',
  goBack: 'Go Back',
  goToDashboard: 'Go to Dashboard',
} as const;

export const BOOKING_PAYMENT_NOT_FOUND = {
  title: 'Booking Not Found',
  description:
    "The booking you're looking for doesn't exist or you don't have access to it.",
  goBack: 'Go Back',
  goToDashboard: 'Go to Dashboard',
} as const;

export const BOOKING_PAYMENT_HEADER = {
  backToBooking: 'Back to Booking Details',
  titleComplete: 'Complete Payment',
  titleStatus: 'Payment Status',
  referenceLabel: 'Booking Reference:',
  fullyPaid: 'Fully Paid',
} as const;

export const BOOKING_PAYMENT_SUMMARY = {
  packageFallback: 'Package',
  created: 'Created:',
  totalPrice: 'Total Price',
  paid: 'Paid',
  outstanding: 'Outstanding',
} as const;

export const BOOKING_PAYMENT_CANCELLED = {
  title: 'Booking Cancelled',
  description: 'This booking has been cancelled and cannot be paid.',
} as const;

export const BOOKING_PAYMENT_COMPLETE = {
  title: 'Payment Complete',
  description:
    'This booking has been fully paid. No further payment is required.',
  paymentStatusLabel: 'Payment Status:',
  paid: 'Paid',
  amountPaid: 'Amount Paid:',
  viewBookingDetails: 'View Booking Details',
  goToDashboard: 'Go to Dashboard',
} as const;

export const BOOKING_PAYMENT_FORM = {
  title: 'Payment Details',
  description: (amount: string) =>
    `Pay the outstanding amount of ${amount} to confirm your booking.`,
  secureTitle: 'Secure Payment',
  secureDescription:
    'Your payment is processed securely through Stripe. We never store your card details.',
} as const;

export const BOOKING_PAYMENT_ACTIONS = {
  backToBookingDetails: 'Back to Booking Details',
} as const;
