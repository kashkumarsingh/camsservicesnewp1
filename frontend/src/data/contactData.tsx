export const BUSINESS_HOURS = {
  /** Matches Yell / Google Business Profile listing */
  display: 'Open 24 hours, Monday to Sunday',
  displayShort: '24 hours, Mon–Sun',
  schema: {
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ] as const,
    opens: '00:00',
    closes: '23:59',
  },
} as const;

export const contactData = {
  email: 'info@camsservices.co.uk',
  phone: '+44 7939 990587',
  whatsapp: 'https://wa.me/447939990587',
  address: '51 Eastmead Avenue, UB6 9RD',
  fullAddress: '51 Eastmead Avenue, Greenford, UB6 9RD, United Kingdom',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=51+Eastmead+Avenue,+UB6+9RD,+UK&hl=en&z=17&output=embed',
  mapsSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=51+Eastmead+Avenue,+UB6+9RD,+UK',
} as const;
