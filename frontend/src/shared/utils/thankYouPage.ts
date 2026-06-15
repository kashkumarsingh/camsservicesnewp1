import { ROUTES } from '@/shared/utils/routes';

/** Supported `?type=` values for /contact/thank-you personalization */
export type ThankYouPageType = 'contact' | 'referral' | 'trainer' | 'register';

export type ThankYouPageVariant = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  headingSmall: string;
  heroTitle: string;
  heroDescription: string;
  nextStepsIntro: string;
};

const THANK_YOU_VARIANTS: Record<ThankYouPageType, ThankYouPageVariant> = {
  contact: {
    metaTitle: "Thank You – We'll Be in Touch | CAMS Services",
    metaDescription:
      'Your enquiry has been received. Our team will review your request and get back to you within 24 hours.',
    badge: 'Message Received Successfully',
    headingSmall: "We've Got Your Message",
    heroTitle: 'Thank you for sharing your story with us.',
    heroDescription:
      "We've sent a confirmation email to your inbox. Our safeguarding team is reviewing your enquiry now and we'll be in touch within 24 hours with your next steps.",
    nextStepsIntro:
      'Your enquiry is routed to our specialist mentors instantly. We follow a simple three-step process so you always know what comes next.',
  },
  referral: {
    metaTitle: 'Thank You – Referral Received | CAMS Services',
    metaDescription:
      'Your referral has been received. Our team will review it and contact you within one working day.',
    badge: 'Referral Received Successfully',
    headingSmall: "We've Got Your Referral",
    heroTitle: 'Thank you for your referral.',
    heroDescription:
      "We've sent a confirmation email to your inbox. Our team is reviewing the referral details and will contact you within one working day to discuss next steps.",
    nextStepsIntro:
      'Your referral is routed to our safeguarding and programme leads. We follow a clear process so you always know what happens next.',
  },
  trainer: {
    metaTitle: 'Thank You – Application Received | CAMS Services',
    metaDescription:
      'Your trainer application has been received. Our team will review it and email you next steps within 2–3 working days.',
    badge: 'Application Received Successfully',
    headingSmall: "We've Got Your Application",
    heroTitle: 'Thank you — your application was received.',
    heroDescription:
      "We've sent a confirmation email to your inbox. Our team will review your profile, safeguarding documents, and experience, then email you next steps within 2–3 working days.",
    nextStepsIntro:
      'Your application is reviewed by our operations and safeguarding team. We follow a structured process so you know exactly where you stand.',
  },
  register: {
    metaTitle: 'Thank You – Registration Received | CAMS Services',
    metaDescription:
      'Your parent account registration has been received and is pending approval. We will email you once your account is approved.',
    badge: 'Registration Received Successfully',
    headingSmall: "We've Got Your Registration",
    heroTitle: 'Thank you for registering with CAMS.',
    heroDescription:
      "We've sent a confirmation email to your inbox. Your account is pending approval — our team will review it within 24–48 hours and email you as soon as you can sign in.",
    nextStepsIntro:
      'While your account is reviewed, you can explore our programmes and resources. Once approved, you can add children and start booking sessions.',
  },
};

const DEFAULT_TYPE: ThankYouPageType = 'contact';

export function isThankYouPageType(value: string | null | undefined): value is ThankYouPageType {
  return value === 'contact' || value === 'referral' || value === 'trainer' || value === 'register';
}

export function resolveThankYouPageType(type: string | null | undefined): ThankYouPageType {
  return isThankYouPageType(type) ? type : DEFAULT_TYPE;
}

export function getThankYouPageVariant(type: string | null | undefined): ThankYouPageVariant {
  return THANK_YOU_VARIANTS[resolveThankYouPageType(type)];
}

export function thankYouPageUrl(type: ThankYouPageType): string {
  return `${ROUTES.CONTACT_THANK_YOU}?type=${type}`;
}
