/**
 * Create Contact Submission DTO
 * 
 * Input DTO for creating contact submissions.
 */

import { InquiryType, UrgencyLevel, PreferredContactMethod } from '../../../domain/contact/entities/ContactSubmission';

export interface CreateContactSubmissionDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  childAge?: string;
  inquiryType?: InquiryType;
  inquiryDetails?: string;
  urgency: UrgencyLevel;
  preferredContact: PreferredContactMethod;
  message?: string;
  newsletter: boolean;
  sourcePage?: string;
}


