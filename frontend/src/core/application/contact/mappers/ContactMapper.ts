/**
 * Contact Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { ContactSubmission } from '../../../domain/contact/entities/ContactSubmission';
import { NewsletterSubscription } from '../../../domain/contact/entities/NewsletterSubscription';
import { ContactSubmissionDTO } from '../dto/ContactSubmissionDTO';
import { NewsletterSubscriptionDTO } from '../dto/NewsletterSubscriptionDTO';

export class ContactMapper {
  static submissionToDTO(submission: ContactSubmission): ContactSubmissionDTO {
    return {
      id: submission.id,
      name: submission.name,
      email: submission.email.value,
      phone: submission.phone?.value,
      childAge: submission.childAge,
      inquiryType: submission.inquiryType,
      inquiryDetails: submission.inquiryDetails,
      urgency: submission.urgency,
      preferredContact: submission.preferredContact,
      message: submission.message,
      newsletter: submission.newsletter,
      sourcePage: submission.sourcePage,
      status: submission.status,
      assignedTo: submission.assignedTo,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    };
  }

  static subscriptionToDTO(subscription: NewsletterSubscription): NewsletterSubscriptionDTO {
    return {
      id: subscription.id,
      email: subscription.email.value,
      name: subscription.name,
      active: subscription.active,
      subscribedAt: subscription.subscribedAt.toISOString(),
      unsubscribedAt: subscription.unsubscribedAt?.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }
}


