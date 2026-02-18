import { FAQItem } from '@/components/features/faq/FAQAccordion';

/**
 * Booking-specific FAQs
 * Used on the booking page to answer common questions
 */
export const bookingFAQs: FAQItem[] = [
  {
    question: 'Can I change my booking?',
    answer: 'Yes! Free changes up to 24h before start.\n\nYou can modify dates, times, or activities through your booking dashboard. Changes made less than 24 hours before the session may be subject to availability.',
    category: 'Booking',
  },
  {
    question: 'What if my child is sick?',
    answer: 'Pause your package anytime, no questions asked.\n\nWe understand kids get ill! Simply contact us and we\'ll freeze your remaining hours. You can resume when your child is feeling better - no expiry date.',
    category: 'Flexibility',
  },
  {
    question: 'Are trainers DBS checked?',
    answer: '100% - all trainers are fully vetted & insured.\n\nEvery trainer undergoes:\n• Enhanced DBS background check\n• Safeguarding training\n• First aid certification\n• Public liability insurance\n• Regular re-verification',
    category: 'Safety',
  },
  {
    question: 'How do I pay?',
    answer: 'We accept all major credit/debit cards and PayPal.\n\nPayment is 100% secure with bank-level 256-bit SSL encryption. You\'ll receive an instant confirmation email and SMS once payment is processed.',
    category: 'Payment',
  },
  {
    question: 'What if I need to cancel?',
    answer: 'Full refund if you cancel 48+ hours before your first session.\n\nAfter your first session starts:\n• Cancel 48h+ before next session: Full refund for unused hours\n• Cancel 24-48h before: 50% refund\n• Cancel <24h: No refund (but you can pause instead!)',
    category: 'Cancellation',
  },
  {
    question: 'Can I book for multiple children?',
    answer: 'Absolutely! Add as many children as you need during booking.\n\nEach child can have their own schedule, activities, and preferences. Siblings can share sessions or have separate ones - totally flexible!',
    category: 'Booking',
  },
  {
    question: 'What activities are included?',
    answer: 'All activities are included in the package price - no hidden fees!\n\nChoose from 20+ activities including:\n• Sports (football, tennis, swimming)\n• Creative (arts, crafts, music)\n• Educational (STEM, coding, languages)\n• Outdoor (nature, exploration)\n\nYou can mix and match freely!',
    category: 'Activities',
  },
  {
    question: 'Do you provide equipment?',
    answer: 'Yes! All equipment is provided at no extra cost.\n\nTrainers bring everything needed for the activities. Just make sure your child wears comfortable clothes and brings water!',
    category: 'Equipment',
  },
  {
    question: 'Where do sessions take place?',
    answer: 'Sessions can be at your home, local park, or community center.\n\nYou choose the location during booking! For outdoor activities, we\'ll suggest nearby parks. For indoor activities, we can come to your home or use local facilities.',
    category: 'Location',
  },
  {
    question: 'How long are sessions?',
    answer: 'Sessions are flexible from 30 minutes to 12 hours.\n\nMost families book 1-3 hour sessions, but you can customize based on your child\'s age, attention span, and schedule. Perfect for after-school, weekends, or school holidays!',
    category: 'Timing',
  },
];

/**
 * Quick FAQs - 4 most common questions
 * Used for inline FAQ sections
 */
export const quickBookingFAQs: FAQItem[] = bookingFAQs.slice(0, 4);








