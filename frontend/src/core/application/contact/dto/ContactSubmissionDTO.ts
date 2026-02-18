/**
 * Contact Submission DTO
 * 
 * Data transfer object for contact submissions.
 */

import { InquiryType, UrgencyLevel, PreferredContactMethod } from '../../../domain/contact/entities/ContactSubmission';

export interface ContactSubmissionDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  childAge?: string;
  inquiryType: InquiryType;
  inquiryDetails?: string;
  urgency: UrgencyLevel;
  preferredContact: PreferredContactMethod;
  message?: string;
  newsletter: boolean;
  sourcePage?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'archived';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}


