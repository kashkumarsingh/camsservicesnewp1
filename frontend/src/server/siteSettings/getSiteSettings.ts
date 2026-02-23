import 'server-only';

import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { SiteSettingsDTO } from '@/core/application/siteSettings/dto/SiteSettingsDTO';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getApiBaseUrl } from '@/infrastructure/http/apiBaseUrl';
import { CACHE_TAGS, REVALIDATION_TIMES } from '@/utils/revalidationConstants';
import { ROUTES } from '@/utils/routes';

function buildFallbackSiteSettings(): SiteSetting {
  const dto: SiteSettingsDTO = {
    id: 'fallback-site-settings',
    contact: {
      phone: '+44 20 1234 5678',
      email: 'info@camsservices.co.uk',
      address: 'Buckhurst Hill, England',
      fullAddress: '123 Example Street, Buckhurst Hill, England, IG9 1AB',
      whatsappUrl: 'https://wa.me/442012345678',
      mapEmbedUrl: undefined,
    },
    social: {
      links: [
        { platform: 'Facebook', url: 'https://facebook.com/camsservices', icon: 'facebook' },
        { platform: 'Instagram', url: 'https://instagram.com/camsservices', icon: 'instagram' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/company/camsservices', icon: 'linkedin' },
      ],
    },
    company: {
      name: 'CAMS Services Ltd.',
      description: 'Specialist SEN & trauma-informed care supporting families across the UK.',
      registrationNumber: '12345678',
    },
    trustIndicators: [
      { label: 'Families', value: '500+', icon: 'users' },
      { label: 'Years', value: '10+', icon: 'clock' },
      { label: 'Rating', value: '4.9/5', icon: 'star' },
    ],
    certifications: {
      ofstedRegistered: true,
      list: [
        'DBS Checked Team',
        'Paediatric First Aid',
        'Trauma-Informed Care Training',
      ],
    },
    navigation: {
      links: [
        { href: ROUTES.ABOUT, label: 'Who We Are' },
        { href: ROUTES.SERVICES, label: 'What We Do' },
        { href: ROUTES.PACKAGES, label: 'Our Packages' },
        { href: ROUTES.TRAINERS, label: 'Meet Our Team' },
        { href: ROUTES.BLOG, label: 'Blog' },
        { href: ROUTES.CONTACT, label: "Let's Connect" },
      ],
      logoPath: '/logos/cams-services-logo.webp',
    },
    footer: {
      quickLinks: [
        { href: ROUTES.ABOUT, label: 'About Us' },
        { href: ROUTES.SERVICES, label: 'Our Services' },
        { href: ROUTES.PACKAGES, label: 'Packages' },
        { href: ROUTES.TRAINERS, label: 'Our Team' },
        { href: ROUTES.BLOG, label: 'Blog & Resources' },
        { href: ROUTES.FAQ, label: 'FAQs' },
      ],
    },
    support: {
      emails: ['support@camsservices.co.uk'],
      whatsappNumbers: ['+442012345678'],
    },
    packageBenefits: [
      {
        icon: 'heart',
        title: 'Personalized Care',
        description: "Tailored to your child's unique needs and goals",
        gradient: 'from-primary-blue to-light-blue-cyan',
      },
      {
        icon: 'trending-up',
        title: 'Proven Results',
        description: '95% of families see improvement within 4 weeks',
        gradient: 'from-primary-blue to-light-blue-cyan',
      },
      {
        icon: 'users',
        title: 'Expert Team',
        description: 'Highly qualified, DBS-checked professionals',
        gradient: 'from-light-blue-cyan to-primary-blue',
      },
      {
        icon: 'clock',
        title: 'Flexible Scheduling',
        description: 'Evenings, weekends, and custom timing available',
        gradient: 'from-light-blue-cyan to-primary-blue',
      },
    ],
    copyright: {
      text: '© {year} CAMS Services Ltd. All rights reserved.',
    },
    updatedAt: new Date().toISOString(),
  };

  return SiteSettingsMapper.toDomain(dto);
}

export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    // Resolve API URL at runtime, not at module load time
    const apiBase = getApiBaseUrl({ serverSide: true });
    const siteSettingsUrl = `${apiBase}${API_ENDPOINTS.SITE_SETTINGS}`;
    
    // Use Next.js fetch with timeout via AbortController
    // Increased timeout for Docker network communication
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds for Docker network
    
    try {
      // Next.js extends fetch with 'next' option for caching
      const response = await fetch(siteSettingsUrl, {
        headers: {
          Accept: 'application/json',
        },
        next: {
          revalidate: REVALIDATION_TIMES.SITE_SETTINGS,
          tags: [CACHE_TAGS.SITE_SETTINGS],
        },
        signal: controller.signal,
      } as RequestInit);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `[getSiteSettings] Unexpected response (${response.status}) when fetching site settings. Falling back to defaults.`,
        );
        return buildFallbackSiteSettings();
      }

      const payload = await response.json();
      const dto = (payload.data ?? payload) as SiteSettingsDTO;

      return SiteSettingsMapper.toDomain(dto);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const err = fetchError as { name?: string; message?: string };
      if (err?.name === 'AbortError' || err?.message?.includes('timed out')) {
        console.warn('[getSiteSettings] Request timed out, using fallback data.');
      } else {
        console.warn('[getSiteSettings] Failed to fetch site settings, using fallback data.', fetchError);
      }
      return buildFallbackSiteSettings();
    }
  } catch (error: unknown) {
    // Handle any other errors
    console.warn('[getSiteSettings] Unexpected error, using fallback data.', error);
    return buildFallbackSiteSettings();
  }
}
