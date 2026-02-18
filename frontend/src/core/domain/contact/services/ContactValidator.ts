/**
 * Contact Validator
 * 
 * Domain service for validating contact submissions.
 */

import { ContactSubmission } from '../entities/ContactSubmission';
import { Email } from '../valueObjects/Email';

export class ContactValidator {
  static validateSubmission(submission: ContactSubmission): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!submission.name || submission.name.trim().length === 0) {
      errors.push('Name is required');
    }

    // Message is optional, but if provided, validate length
    if (submission.message && submission.message.length > 5000) {
      errors.push('Message cannot exceed 5000 characters');
    }

    try {
      Email.fromString(submission.email.value);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Invalid email');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static isSpam(submission: ContactSubmission): boolean {
    // Basic spam detection (only if message is provided)
    if (!submission.message) {
      return false;
    }
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner'];
    const messageLower = submission.message.toLowerCase();
    
    return spamKeywords.some(keyword => messageLower.includes(keyword));
  }

  static isDuplicate(submission: ContactSubmission, recentSubmissions: ContactSubmission[]): boolean {
    // Check if same email submitted within last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return recentSubmissions.some(recent => 
      recent.email.value === submission.email.value &&
      recent.createdAt > oneHourAgo
    );
  }
}


