import { INotificationService } from '@/core/application/booking/ports/INotificationService';

/**
 * Mock Notification Service
 * Implements INotificationService for development/testing
 */
export class MockNotificationService implements INotificationService {
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    template?: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    // Log email in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Notification:', {
        to,
        subject,
        body,
        template,
        data,
      });
    }
    return true;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    // Log SMS in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS Notification:', {
        to,
        message,
      });
    }
    return true;
  }

  async sendBookingConfirmation(
    bookingReference: string,
    parentEmail: string,
    bookingDetails: Record<string, any>
  ): Promise<boolean> {
    return await this.sendEmail(
      parentEmail,
      `Booking Confirmation: ${bookingReference}`,
      `Your booking ${bookingReference} has been confirmed.`,
      'booking-confirmation',
      bookingDetails
    );
  }

  async sendBookingCancellation(
    bookingReference: string,
    parentEmail: string,
    cancellationReason: string
  ): Promise<boolean> {
    return await this.sendEmail(
      parentEmail,
      `Booking Cancellation: ${bookingReference}`,
      `Your booking ${bookingReference} has been cancelled. Reason: ${cancellationReason}`,
      'booking-cancellation',
      { bookingReference, cancellationReason }
    );
  }
}

export const mockNotificationService = new MockNotificationService();


