/**
 * Contact Policy
 * 
 * Business rules for contact submissions.
 */

import { ContactSubmission } from '../entities/ContactSubmission';

export class ContactPolicy {
  /**
   * Check if submission requires immediate attention
   */
  static requiresImmediateAttention(submission: ContactSubmission): boolean {
    return submission.isUrgent() || submission.requiresPhoneContact();
  }

  /**
   * Check if submission can be auto-responded
   */
  static canAutoRespond(submission: ContactSubmission): boolean {
    return !submission.isUrgent() && submission.preferredContact === 'email';
  }

  /**
   * Get priority score (higher = more urgent)
   */
  static getPriorityScore(submission: ContactSubmission): number {
    let score = 0;

    if (submission.urgency === 'urgent') score += 10;
    if (submission.urgency === 'soon') score += 5;
    if (submission.requiresPhoneContact()) score += 3;
    if (submission.inquiryType === 'package') score += 2;
    if (submission.inquiryType === 'service') score += 1;

    return score;
  }
}


