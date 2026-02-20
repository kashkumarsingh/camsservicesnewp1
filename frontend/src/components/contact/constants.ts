/**
 * Contact page UI strings and config.
 * Never hardcode these in JSX — use these constants or config from CMS.
 */

export const CONTACT_HERO = {
  TITLE: 'Get in touch',
  SUBTITLE: 'Book a free consultation and discover how our trauma-informed care can help your child thrive.',
  BADGE_RATING: '4.9/5 rating',
  BADGE_DBS: 'DBS checked',
  BADGE_OFSTED: 'Ofsted registered',
  CTA_PRIMARY: 'Book a consultation',
  CTA_CALL: 'Call us',
  CTA_NUMBER_COMING_SOON: 'Number coming soon',
} as const;

export const CONTACT_STATS = [
  { value: '500+', label: 'Happy families' },
  { value: '10+', label: 'Years experience' },
  { value: '98%', label: 'Satisfaction' },
  { value: '24h', label: 'Response time' },
] as const;

export const CONTACT_FORM = {
  TITLE: 'Book a consultation',
  SUBTITLE: "Fill out the form below and we'll get back to you within 24 hours. No obligation.",
  LABEL_NAME: 'Your name *',
  LABEL_EMAIL: 'Email Address *',
  LABEL_PHONE: 'Phone Number *',
  LABEL_CHILDREN: 'Children *',
  ADD_ANOTHER_CHILD: 'Add Another Child',
  CHILD_N: 'Child',
  REMOVE: 'Remove',
  LABEL_FULL_NAME: 'Full Name *',
  LABEL_AGE: 'Age *',
  LABEL_ADDRESS: 'Address (Optional)',
  LABEL_POSTAL_CODE: 'Postal Code (Optional)',
  LABEL_INTERESTED_IN: "I'm Interested In *",
  LABEL_URGENCY: 'When do you need support? *',
  LABEL_PREFERRED_CONTACT: 'Best way to reach you? *',
  LABEL_MESSAGE: 'Tell us about your needs (Optional)',
  PLACEHOLDER_NAME: 'John Smith',
  PLACEHOLDER_EMAIL: 'john@example.com',
  PLACEHOLDER_PHONE: '07123 456789 or 020 1234 5678',
  PLACEHOLDER_ADDRESS: 'e.g., 123 High Street, Town',
  PLACEHOLDER_POSTCODE: 'e.g., IG9 5BT',
  PLACEHOLDER_AGE: 'e.g., 8',
  PLACEHOLDER_MESSAGE: 'Any specific needs or questions? Let us know so we can better help you...',
  SELECT_SERVICE_OR_PACKAGE: 'Select a service or package...',
  OPTGROUP_PACKAGES: 'Popular Packages',
  OPTGROUP_SERVICES: 'Individual Services',
  OPTION_GENERAL: 'Just have a question',
  SELECT_TIMEFRAME: 'Select timeframe...',
  URGENCY_URGENT: 'Urgent - Within a week',
  URGENCY_SOON: 'Soon - Within 2-4 weeks',
  URGENCY_EXPLORING: 'Just exploring options',
  PREFERRED_EMAIL: 'Email',
  PREFERRED_PHONE: 'Phone',
  PREFERRED_WHATSAPP: 'WhatsApp',
  SUBMIT: 'Get My FREE Consultation',
  SENDING: 'Sending...',
  SECURITY_NOTE: 'Your information is 100% secure. We hate spam too.',
  ERROR_SELECT_OPTION: 'Please select an option',
  ERROR_SELECT_TIMEFRAME: 'Please select a timeframe',
  SUCCESS_MESSAGE: 'Thank you! Your message has been sent successfully.',
  ERROR_GENERIC: 'Something went wrong. Please try again or contact us directly.',
  ERROR_WAIT: 'Please wait a few moments before trying again. This helps prevent duplicate submissions.',
  ERROR_ALTERNATIVE: 'You can also reach us by phone at',
  ERROR_ALTERNATIVE_SUFFIX: 'or WhatsApp for immediate assistance.',
} as const;

export const CONTACT_SIDEBAR = {
  WHY_TITLE: 'Why families choose us',
  BENEFITS: [
    'FREE initial consultation (worth £50)',
    'Tailored support plans for each child',
    'Fully qualified & DBS-checked mentors',
    'Flexible scheduling (evenings & weekends)',
    'Regular progress updates & reports',
    'Proven track record with 500+ families',
  ] as const,
  PREFER_TALK_TITLE: 'Prefer to talk?',
  PREFER_TALK_DESCRIPTION: 'Choose your preferred contact method:',
  CALL_US: 'Call us',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  OFFICE_HOURS_TITLE: 'Office hours',
  MONDAY_FRIDAY: 'Monday – Friday',
  MONDAY_FRIDAY_HOURS: '9:00 – 18:00',
  SATURDAY: 'Saturday',
  SATURDAY_HOURS: '10:00 – 16:00',
  SUNDAY: 'Sunday',
  SUNDAY_HOURS: 'Closed',
  AFTER_HOURS: "After-hours? Submit the form and we'll respond within 24 hours.",
} as const;

export const CONTACT_VISIT = {
  TITLE: 'Visit our centre',
  SUBTITLE: "Located in Buckhurst Hill, we're easily accessible and offer a welcoming, safe environment.",
  MAP_COMING_SOON: 'Map coming soon',
  MAP_TITLE: 'Location of CAMS Services',
  ADDRESS_LABEL: 'Address',
  ADDRESS_COMING_SOON: 'Address coming soon',
  GET_DIRECTIONS: 'Get directions',
  PARKING_LABEL: 'Parking & access',
  PARKING_DESCRIPTION: 'Free parking. Wheelchair accessible. Near public transport.',
  BOOK_VISIT_LABEL: 'Book a visit',
  BOOK_VISIT_DESCRIPTION: 'Schedule a tour of our centre.',
  SCHEDULE_TOUR: 'Schedule tour',
} as const;

export const CONTACT_CTA = {
  TITLE: 'Ready to take the first step?',
  SUBTITLE: "Join hundreds of families who trust us with their children's development.",
  CTA_PRIMARY: 'Book a consultation',
  CTA_CALL: 'Call us',
  PHONE_COMING_SOON: 'Phone coming soon',
  FOOTER: '100% satisfaction guaranteed · No long-term commitment · Cancel anytime',
} as const;

export const CONTACT_VALIDATION_FALLBACKS = {
  NAME: 'Please enter both first and last name',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid UK phone number',
  ADDRESS_REQUIRED: 'Address is required',
  ADDRESS_INVALID: 'Address must start with a door number',
  POSTCODE_REQUIRED: 'Postal code is required',
  POSTCODE_INVALID: 'Please enter a valid UK postal code',
  AGE: 'Please enter a valid age (0-25)',
  PASSWORD: 'Password is invalid',
} as const;
