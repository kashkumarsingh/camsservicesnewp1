import { BUSINESS_NAP } from '@/marketing/constants/businessNap';

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
  email: BUSINESS_NAP.email,
  phone: BUSINESS_NAP.phone,
  whatsapp: `https://wa.me/${BUSINESS_NAP.phoneTelHref.replace('+', '')}`,
  address: BUSINESS_NAP.shortAddress,
  fullAddress: BUSINESS_NAP.fullAddress,
  mapEmbedUrl: BUSINESS_NAP.mapsEmbedUrl,
  mapsSearchUrl: BUSINESS_NAP.mapsPlaceUrl,
} as const;
