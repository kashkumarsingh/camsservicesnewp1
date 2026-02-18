/**
 * Notification Service Interface
 * Defines the contract for sending notifications
 */
export interface INotificationService {
  /**
   * Send email notification
   */
  sendEmail(
    to: string,
    subject: string,
    body: string,
    template?: string,
    data?: Record<string, any>
  ): Promise<boolean>;

  /**
   * Send SMS notification
   */
  sendSMS(
    to: string,
    message: string
  ): Promise<boolean>;

  /**
   * Send booking confirmation
   */
  sendBookingConfirmation(
    bookingReference: string,
    parentEmail: string,
    bookingDetails: Record<string, any>
  ): Promise<boolean>;

  /**
   * Send booking cancellation
   */
  sendBookingCancellation(
    bookingReference: string,
    parentEmail: string,
    cancellationReason: string
  ): Promise<boolean>;
}


