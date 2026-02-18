/**
 * API Contact Repository
 * 
 * Infrastructure implementation using Laravel backend API.
 */

import { IContactRepository, INewsletterRepository } from '@/core/application/contact/ports/IContactRepository';
import { ContactSubmission } from '@/core/domain/contact/entities/ContactSubmission';
import { NewsletterSubscription } from '@/core/domain/contact/entities/NewsletterSubscription';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

interface RemoteContactSubmissionResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  child_age?: string;
  inquiry_type: string;
  inquiry_details?: string;
  urgency: string;
  preferred_contact: string;
  message?: string;
  newsletter: boolean;
  source_page?: string;
  status: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface RemoteNewsletterSubscriptionResponse {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export class ApiContactRepository implements IContactRepository {
  private toApi(submission: ContactSubmission): Partial<RemoteContactSubmissionResponse> {
    return {
      name: submission.name,
      email: submission.email.value,
      phone: submission.phone?.value,
      address: submission.address,
      postal_code: submission.postalCode,
      child_age: submission.childAge,
      inquiry_type: submission.inquiryType,
      inquiry_details: submission.inquiryDetails,
      urgency: submission.urgency,
      preferred_contact: submission.preferredContact,
      message: submission.message,
      newsletter: submission.newsletter,
      source_page: submission.sourcePage,
      status: submission.status,
    };
  }

  async saveSubmission(submission: ContactSubmission): Promise<void> {
    const apiData = this.toApi(submission);

    try {
      await apiClient.post<RemoteContactSubmissionResponse>(
        API_ENDPOINTS.CONTACT_SUBMISSIONS,
        apiData
      );
    } catch (error: any) {
      // Extract error message from API response - handle multiple error formats
      let errorMessage = 'Failed to save contact submission';
      let statusCode: number | undefined;
      let errorCode: string | undefined;

      // Check for ApiClient error structure
      if (error?.response) {
        statusCode = error.response.status;
        const responseData = error.response.data;
        
        // Try different message locations
        errorMessage = responseData?.message 
          || responseData?.error 
          || error.message 
          || 'Failed to save contact submission';
        
        errorCode = responseData?.error || responseData?.code;
      } else if (error?.message) {
        // Direct error message
        errorMessage = error.message;
      }

      // Preserve the original error for duplicate/rate limit cases
      if (statusCode === 429) {
        const apiError = new Error(errorMessage);
        (apiError as any).status = 429;
        (apiError as any).code = errorCode;
        throw apiError;
      }
      
      // For other errors, include status code if available
      const finalError = new Error(errorMessage);
      if (statusCode) {
        (finalError as any).status = statusCode;
      }
      if (errorCode) {
        (finalError as any).code = errorCode;
      }
      throw finalError;
    }
  }
}

export class ApiNewsletterRepository implements INewsletterRepository {
  private toDomain(response: RemoteNewsletterSubscriptionResponse): NewsletterSubscription {
    return NewsletterSubscription.restore({
      id: String(response.id),
      email: response.email,
      name: response.name,
      active: response.active,
      subscribedAt: response.subscribed_at,
      unsubscribedAt: response.unsubscribed_at,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    });
  }

  async subscribe(subscription: NewsletterSubscription): Promise<NewsletterSubscription> {
    try {
      const response = await apiClient.post<RemoteNewsletterSubscriptionResponse>(
        API_ENDPOINTS.NEWSLETTER_SUBSCRIBE,
        {
          email: subscription.email.value,
          name: subscription.name,
          source: 'contact-page',
        }
      );

      return this.toDomain(response.data);
    } catch (error) {
      throw new Error(
        `Failed to subscribe to newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async unsubscribe(email: string): Promise<NewsletterSubscription | null> {
    try {
      const response = await apiClient.post<RemoteNewsletterSubscriptionResponse>(
        API_ENDPOINTS.NEWSLETTER_UNSUBSCRIBE,
        {
          email,
        }
      );

      return response.data ? this.toDomain(response.data) : null;
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null;
      }

      throw new Error(
        `Failed to unsubscribe from newsletter: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}


