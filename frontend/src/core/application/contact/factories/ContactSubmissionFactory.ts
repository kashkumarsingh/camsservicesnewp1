/**
 * Contact Submission Factory
 * 
 * Factory for creating contact submissions.
 */

import { ContactSubmission } from '../../../domain/contact/entities/ContactSubmission';
import { CreateContactSubmissionDTO } from '../dto/CreateContactSubmissionDTO';
import { IIdGenerator } from '../../faq/ports/IIdGenerator';

export class ContactSubmissionFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateContactSubmissionDTO): ContactSubmission {
    // Generate ID
    const id = this.idGenerator.generate();

    // Create submission with business rules enforced
    return ContactSubmission.create(
      id,
      input.name,
      input.email,
      input.urgency,
      input.preferredContact,
      input.newsletter,
      input.inquiryType || 'general',
      input.message,
      input.phone,
      input.address,
      input.postalCode,
      input.childAge,
      input.inquiryDetails,
      input.sourcePage
    );
  }
}


