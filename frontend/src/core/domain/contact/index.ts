/**
 * Contact Domain - Barrel Exports
 */

export { ContactSubmission, type InquiryType, type UrgencyLevel, type PreferredContactMethod } from './entities/ContactSubmission';
export { NewsletterSubscription } from './entities/NewsletterSubscription';
export { Email } from './valueObjects/Email';
export { PhoneNumber } from './valueObjects/PhoneNumber';
export { ContactValidator } from './services/ContactValidator';
export { ContactPolicy } from './policies/ContactPolicy';
export { 
  ContactSubmittedEvent, 
  NewsletterSubscribedEvent,
  NewsletterUnsubscribedEvent
} from './events/ContactSubmittedEvent';


