'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getApiBaseUrl } from '@/infrastructure/http/apiBaseUrl';
import { 
  MessageCircle,
  Phone, 
  Mail, 
  MapPin,
  Award,
  Users,
  Clock,
  ArrowRight,
  Star,
} from 'lucide-react';
import { 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube, 
  FaXTwitter,
  FaGithub
} from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { useServices } from '@/interfaces/web/hooks/services/useServices';
import { usePolicies } from '@/interfaces/web/hooks/policies/usePolicies';
import { FooterSkeleton } from '@/components/ui/Skeleton';
import { SiteSettingsDTO } from '@/core/application/siteSettings/dto/SiteSettingsDTO';
import { ROUTES } from '@/utils/routes';
import { FOOTER } from '@/utils/footerConstants';

/**
 * Social Media Icon Resolver
 * Maps icon/platform names to React Icons brand components
 * Uses react-icons for proper brand icons (FaFacebook, FaInstagram, etc.)
 */
const SOCIAL_ICONS: Record<string, IconType> = {
  // Brand icons from react-icons
  facebook: FaFacebook,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  twitter: FaXTwitter,
  x: FaXTwitter, // X (formerly Twitter)
  github: FaGithub,
};

/**
 * Get Icon Component from Icon Name or Platform
 * Priority: iconName (from site settings) > platform name > MessageCircle
 * Returns React Icon component for social media, Lucide icon for fallback
 */
function getIconComponent(iconName?: string, platform?: string): IconType | import('@/types/icons').IconComponent {
  // Primary: Use icon name from site settings
  if (iconName) {
    const normalized = iconName.trim().toLowerCase().replace(/[-\s_]/g, '');
    const icon = SOCIAL_ICONS[normalized];
    if (icon) return icon;
  }
  
  // Fallback: Use platform name
  if (platform) {
    const normalized = platform.trim().toLowerCase().replace(/[-\s_]/g, '');
    return SOCIAL_ICONS[normalized] || MessageCircle;
  }
  
  // Default fallback
  return MessageCircle;
}

/**
 * Trust Indicator Icon Mapping
 * Maps icon names to Lucide React icon components
 */
const trustIconMap: Record<string, import('@/types/icons').IconComponent> = {
  'users': Users,
  'clock': Clock,
  'star': Star,
  'award': Award,
};

/**
 * Footer Component
 * 
 * Clean Architecture Layer: Interface (Web/React Component)
 * 
 * Displays site footer with dynamic data from the backend API.
 * All content is managed through the CMS (admin dashboard).
 * 
 * Plain English: This component displays the footer at the bottom of every page.
 * It receives CMS-managed data (contact info, social links, company info, etc.)
 * from the server layout so content stays consistent across the app.
 * 
 * Docker Command: No specific command needed - this runs in the frontend container
 */

/**
 * Convert logo path to full URL
 * Handles both local paths (starting with /) and backend storage paths
 */
function getLogoUrl(logoPath: string | undefined): string {
  // Default fallback logo
  const defaultLogo = '/logos/cams-services-logo.webp';
  
  if (!logoPath || logoPath.trim() === '') {
    return defaultLogo;
  }
  
  // If path starts with /, it's a local file path - use as-is
  if (logoPath.startsWith('/')) {
    return logoPath;
  }
  
  // If path starts with http:// or https://, it's already a full URL - use as-is
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  // Otherwise, it's a backend storage path - convert to full URL
  // Backend storage files are served at /storage/{path}
  const apiBase = getApiBaseUrl({ serverSide: false });
  const backendUrl = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  
  // Files are stored in storage/app/logos/{filename}
  // Extract just the filename (remove any directory prefixes)
  let filename = logoPath;
  
  // Remove any storage/app/logos/ prefix if present
  filename = filename.replace(/^(storage\/app\/logos\/|logos\/|storage\/app\/|app\/)/i, '');
  filename = filename.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
  filename = filename.trim();
  
  // If empty after cleaning, use default
  if (!filename) {
    return defaultLogo;
  }
  
  // Construct URL: {backendUrl}/storage/logos/{filename} (Railway in production)
  const fullUrl = `${backendUrl}/storage/logos/${filename}`;
  
  // Validate URL format
  try {
    new URL(fullUrl);
    return fullUrl;
  } catch (e) {
    console.warn('[getLogoUrl] Invalid URL constructed, using default logo:', fullUrl);
    return defaultLogo;
  }
}

interface FooterClientProps {
  settings: SiteSettingsDTO | null;
}

const FooterClient: React.FC<FooterClientProps> = ({ settings }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Fetch services for dynamic footer links (skip on login/register to avoid unnecessary API calls)
  const { services: footerServices, loading: servicesLoading } = useServices({
    limit: 6,
    sortBy: 'views',
    sortOrder: 'desc',
    enabled: !isAuthPage,
  });
  // Fetch published policies for footer legal links
  const { policies: footerPolicies, loading: policiesLoading } = usePolicies({ 
    published: true,
    sortBy: 'title',
    sortOrder: 'asc'
  });

  if (!settings) {
    return <FooterSkeleton />;
  }

  // Get social media links from settings
  const socialLinks = settings.social.links || [];
  
  // Get quick links from settings
  const quickLinks = settings.footer.quickLinks || [];
  
  // Get logo URL (convert backend storage path to full URL if needed)
  const logoUrl = getLogoUrl(settings.navigation.logoPath);
  
  // Legal links - dynamically fetched from policies API
  // Convert policies to footer link format
  const legalLinks = footerPolicies.map(policy => ({
    href: `/policies/${policy.slug}`,
    label: policy.title,
  }));

  // Get trust indicators from settings
  const trustIndicators = settings.trustIndicators || [];

  // Get contact information
  const contact = settings.contact;
  const company = settings.company;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const defaultQuickLinks = [
    { href: ROUTES.ABOUT, label: 'About Us' },
    { href: ROUTES.SERVICES, label: 'Our Services' },
    { href: ROUTES.PACKAGES, label: 'Packages' },
    { href: ROUTES.TRAINERS, label: 'Our Team' },
    { href: ROUTES.BLOG, label: 'Blog & Resources' },
    { href: ROUTES.FAQ, label: 'FAQs' },
  ];
  const footerQuickLinks = quickLinks.length > 0 ? quickLinks : defaultQuickLinks;

  const whatsappHref = contact.whatsappUrl ?? ROUTES.CONTACT;

  return (
    <footer className="bg-navy-blue dark:bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Logo, description, social */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <div className="relative w-[160px] h-[51px]">
                <Image 
                  src={logoUrl} 
                  alt={`${company.name} Logo`} 
                  fill
                  sizes="160px"
                  className="object-contain"
                  unoptimized={logoUrl.startsWith('http')}
                />
              </div>
            </Link>
            {company.description && (
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {company.description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((link, index) => {
                  const IconComponent = getIconComponent(link.icon, link.platform);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/90 transition-colors"
                      aria-label={link.platform}
                    >
                      <IconComponent size={22} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-white mb-5">{FOOTER.QUICK_LINKS_HEADING}</h3>
            <ul className="space-y-3">
              {footerQuickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h3 className="text-base font-semibold text-white mb-5">{FOOTER.OUR_SERVICES_HEADING}</h3>
            <ul className="space-y-3">
              {!servicesLoading && footerServices.length > 0 && (
                footerServices.slice(0, 4).map((service) => (
                  <li key={service.id}>
                    <Link 
                      href={ROUTES.SERVICE_BY_SLUG(service.slug)} 
                      className="text-gray-300 hover:text-white text-sm transition-colors"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))
              )}
              <li>
                <Link 
                  href={ROUTES.SERVICES} 
                  className="text-sm font-semibold text-white hover:text-light-blue-cyan transition-colors inline-flex items-center gap-1 group"
                >
                  {FOOTER.VIEW_ALL_LABEL}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get in Touch + CTAs */}
          <div>
            <h3 className="text-base font-semibold text-white mb-5">{FOOTER.GET_IN_TOUCH_HEADING}</h3>
            <ul className="space-y-4 mb-6">
              {contact.phone && (
                <li>
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="flex items-center gap-3 group"
                  >
                    <Phone size={18} className="text-white/90 flex-shrink-0" aria-hidden />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a 
                    href={`mailto:${contact.email}`} 
                    className="flex items-center gap-3 group"
                  >
                    <Mail size={18} className="text-white/90 flex-shrink-0" aria-hidden />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors break-all">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-white/90 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="text-sm text-gray-300">{contact.address}</span>
                  </div>
                </li>
              )}
            </ul>
            <div className="flex flex-col gap-3">
              <Link
                href={ROUTES.CONTACT}
                className="rounded-full px-6 py-3.5 text-center font-semibold text-sm bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white hover:opacity-95 transition-all duration-300 hover:shadow-lg inline-flex items-center justify-center"
              >
                {FOOTER.BOOK_FREE_CALL}
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-6 py-3.5 text-center font-semibold text-sm bg-nebula-gray hover:bg-nebula-gray/90 text-white transition-all duration-300 inline-flex items-center justify-center border border-white/10"
                aria-label="Contact us on WhatsApp"
              >
                {FOOTER.WHATSAPP_US}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar: copyright, legal links, Back to Top */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left order-2 md:order-1">
              <p className="text-sm text-gray-300">
                {settings.copyright.text
                  ? settings.copyright.text.replace('{year}', new Date().getFullYear().toString())
                  : `© ${new Date().getFullYear()} ${company.name}. All rights reserved.`}
              </p>
              {company.registrationNumber && (
                <p className="text-xs text-gray-400 mt-1">
                  Company No. {company.registrationNumber}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 order-1 md:order-2">
              {!policiesLoading && legalLinks.length > 0 && legalLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!policiesLoading && legalLinks.length > 0 && (
                <span className="text-gray-500 hidden md:inline" aria-hidden>|</span>
              )}
              <button
                type="button"
                onClick={scrollToTop}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                aria-label="Back to top"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterClient;