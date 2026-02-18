/**
 * Contact Application Layer - Barrel Exports
 */

// Use Cases
export { SubmitContactFormUseCase } from './useCases/SubmitContactFormUseCase';
export { SubscribeNewsletterUseCase } from './useCases/SubscribeNewsletterUseCase';
export { UnsubscribeNewsletterUseCase } from './useCases/UnsubscribeNewsletterUseCase';

// Factories
export { ContactSubmissionFactory } from './factories/ContactSubmissionFactory';
export { NewsletterSubscriptionFactory } from './factories/NewsletterSubscriptionFactory';

// DTOs
export type { ContactSubmissionDTO } from './dto/ContactSubmissionDTO';
export type { CreateContactSubmissionDTO } from './dto/CreateContactSubmissionDTO';
export type { NewsletterSubscriptionDTO } from './dto/NewsletterSubscriptionDTO';
export type { CreateNewsletterSubscriptionDTO } from './dto/CreateNewsletterSubscriptionDTO';

// Mappers
export { ContactMapper } from './mappers/ContactMapper';

// Ports
export type { IContactRepository, INewsletterRepository } from './ports/IContactRepository';


