/**
 * Submit Contact Form Use Case
 * 
 * Orchestrates contact form submission.
 */

import { ContactSubmission } from '../../../domain/contact/entities/ContactSubmission';
import { IContactRepository } from '../ports/IContactRepository';
import { ContactSubmissionFactory } from '../factories/ContactSubmissionFactory';
import { ContactValidator } from '../../../domain/contact/services/ContactValidator';
import { ContactPolicy } from '../../../domain/contact/policies/ContactPolicy';
import { ContactMapper } from '../mappers/ContactMapper';
import { ContactSubmissionDTO } from '../dto/ContactSubmissionDTO';
import { CreateContactSubmissionDTO } from '../dto/CreateContactSubmissionDTO';

export class SubmitContactFormUseCase {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly submissionFactory: ContactSubmissionFactory
  ) {}

  async execute(input: CreateContactSubmissionDTO): Promise<ContactSubmissionDTO> {
    // Create submission
    const submission = this.submissionFactory.create(input);

    // Validate submission
    const validation = ContactValidator.validateSubmission(submission);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for spam
    if (ContactValidator.isSpam(submission)) {
      throw new Error('Submission flagged as spam');
    }

    // Check for duplicates (recent submissions from same email)
    if (typeof this.contactRepository.findSubmissionsByEmail === 'function') {
      const recentSubmissions = await this.contactRepository.findSubmissionsByEmail(
        submission.email.value,
        5
      );
      if (ContactValidator.isDuplicate(submission, recentSubmissions)) {
        throw new Error('Duplicate submission detected. Please wait before submitting again.');
      }
    }

    // Save submission
    await this.contactRepository.saveSubmission(submission);

    // Return DTO
    return ContactMapper.submissionToDTO(submission);
  }
}


