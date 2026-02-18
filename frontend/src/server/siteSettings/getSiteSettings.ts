import 'server-only';

import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { SiteSettingsDTO } from '@/core/application/siteSettings/dto/SiteSettingsDTO';
import { SiteSettingsMapper } from '@/core/application/siteSettings/mappers/SiteSettingsMapper';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/** Ensures the base URL ends with /api/v1 so requests hit Laravel's API routes. */
function ensureApiV1Base(base: string): string {
  const trimmed = base.replace(/\/$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
}

const resolveApiBase = (): string => {
  // Server-side: process is always available (Node.js environment)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (globalThis as any).process?.env || (typeof process !== 'undefined' ? process.env : {});
  
  // Priority 1: API_URL (for server-side in Docker, may be backend base only e.g. http://backend:80)
  const serverBase = env.API_URL?.replace(/\/$/, '');
  if (serverBase) {
    return ensureApiV1Base(serverBase);
  }

  // Priority 2: NEXT_PUBLIC_API_URL (fallback, but usually for client-side)
  const publicBase = env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (publicBase) {
    return ensureApiV1Base(publicBase);
  }

  // Priority 3: Runtime fallback - Detect environment
  const nodeEnv = env.NODE_ENV || 'development';
  
  // Check if we're in Docker (Docker sets HOSTNAME to container name)
  const hostname = env.HOSTNAME || '';
  const isDocker = hostname.includes('kidzrunz') || env.DOCKER === 'true';
  
  // Docker Compose: use service name for internal communication
  if (isDocker && nodeEnv === 'development') {
    return 'http://backend:80/api/v1';
  }
  
  // Local development (not in Docker): use localhost
  if (nodeEnv === 'development' || env.LOCAL_DEV === 'true') {
    return 'http://localhost:9080/api/v1';
  }
  
  // Render.com production
  const renderUrl = env.RENDER_EXTERNAL_URL;
  if (renderUrl && renderUrl.includes('onrender.com')) {
    return 'https://cams-backend-1q6w.onrender.com/api/v1';
  }

  // Default: Docker service name for dev, Render for production
  return nodeEnv === 'production' 
    ? 'https://cams-backend-1q6w.onrender.com/api/v1'
    : 'http://backend:80/api/v1'; // Use Docker service name as default
};

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
        { href: '/about', label: 'Who We Are' },
        { href: '/services', label: 'What We Do' },
        { href: '/packages', label: 'Our Packages' },
        { href: '/trainers', label: 'Meet Our Team' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: "Let's Connect" },
      ],
      logoPath: '/logos/cams-services-logo.webp',
    },
    footer: {
      quickLinks: [
        { href: '/about', label: 'About Us' },
        { href: '/services', label: 'Our Services' },
        { href: '/packages', label: 'Packages' },
        { href: '/trainers', label: 'Our Team' },
        { href: '/blog', label: 'Blog & Resources' },
        { href: '/faq', label: 'FAQs' },
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
        gradient: 'from-[#0080FF] to-[#00D4FF]',
      },
      {
        icon: 'trending-up',
        title: 'Proven Results',
        description: '95% of families see improvement within 4 weeks',
        gradient: 'from-[#0080FF] to-[#00D4FF]',
      },
      {
        icon: 'users',
        title: 'Expert Team',
        description: 'Highly qualified, DBS-checked professionals',
        gradient: 'from-[#00D4FF] to-[#0080FF]',
      },
      {
        icon: 'clock',
        title: 'Flexible Scheduling',
        description: 'Evenings, weekends, and custom timing available',
        gradient: 'from-[#00D4FF] to-[#0080FF]',
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
    const apiBase = resolveApiBase();
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
          revalidate: 3600,
          tags: ['site-settings'],
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
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle abort (timeout) and other errors gracefully
      if (fetchError?.name === 'AbortError' || fetchError?.message?.includes('timed out')) {
        console.warn('[getSiteSettings] Request timed out, using fallback data.');
      } else {
        console.warn('[getSiteSettings] Failed to fetch site settings, using fallback data.', fetchError);
      }
      return buildFallbackSiteSettings();
    }
  } catch (error: any) {
    // Handle any other errors
    console.warn('[getSiteSettings] Unexpected error, using fallback data.', error);
    return buildFallbackSiteSettings();
  }
}
