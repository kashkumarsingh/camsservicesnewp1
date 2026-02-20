/**
 * Booking detail page — user-facing copy. Single source of truth for public booking detail view.
 */

export const BOOKING_DETAIL_LOADING = {
  message: 'Loading booking details...',
} as const;

export const BOOKING_DETAIL_ERROR = {
  title: 'Error Loading Booking',
  goBack: 'Go Back',
  goToDashboard: 'Go to Dashboard',
} as const;

export const BOOKING_DETAIL_NOT_FOUND = {
  title: 'Booking Not Found',
  description: "The booking you're looking for doesn't exist or you don't have access to it.",
  goBack: 'Go Back',
  goToDashboard: 'Go to Dashboard',
} as const;

export const BOOKING_DETAIL_HEADER = {
  backToDashboard: 'Back to Dashboard',
  title: 'Booking Details',
  referenceLabel: 'Reference:',
} as const;

export const BOOKING_DETAIL_FINANCIAL = {
  totalPrice: 'Total Price',
  paid: 'Paid',
  outstanding: 'Outstanding',
} as const;

export const BOOKING_DETAIL_SECTIONS = {
  packageInfo: 'Package Information',
  viewPackageDetails: 'View Package Details',
  participants: (count: number) => `Participants (${count})`,
  parentGuardian: 'Parent/Guardian Information',
  medicalInfo: 'Medical Info:',
  specialNeeds: 'Special Needs:',
  dob: 'DOB:',
  emergency: 'Emergency:',
  schedule: (count: number) => `Schedule (${count} session${count !== 1 ? 's' : ''})`,
  trainerId: 'Trainer ID:',
  activities: 'Activities:',
  notes: 'Notes',
  cancellation: 'Cancellation Information',
  cancelledOn: 'Cancelled on:',
} as const;

export const BOOKING_DETAIL_PAYMENT_REFRESH = {
  title: 'Payment Processing',
  description:
    "We received your payment, but it's still being processed. This usually takes just a few moments. Click the button below to check if your payment has been confirmed.",
  buttonCheck: 'Check Payment Status',
  buttonChecking: 'Checking...',
} as const;

export const BOOKING_DETAIL_ACTIONS = {
  payOutstanding: (amount: string) => `Pay Outstanding (${amount})`,
  backToDashboard: 'Back to Dashboard',
} as const;

/** Display labels for booking status — use with getStatusBadgeClasses from statusBadgeHelpers. */
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  draft: 'Draft',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  completed: 'Completed',
};

/** Display labels for payment status — use with getPaymentStatusBadgeClasses from statusBadgeHelpers. */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  partial: 'Partial Payment',
  pending: 'Pending Payment',
  failed: 'Payment Failed',
  refunded: 'Refunded',
};
