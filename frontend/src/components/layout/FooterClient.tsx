'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Type declaration for Node.js process (available in Next.js runtime)
declare const process: {
  env: Record<string, string | undefined>;
} | undefined;
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
  // Resolve backend URL from NEXT_PUBLIC_API_URL at runtime
  const getBackendUrl = (): string => {
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          // Remove /api/v1 suffix if present, and trailing slashes
          return apiUrl.replace('/api/v1', '').replace(/\/$/, '');
        }
      } catch (e) {
        console.warn('[getLogoUrl] Failed to read NEXT_PUBLIC_API_URL, using Render backend');
      }
    }
    
    // Runtime fallback: Detect environment
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      const origin = window.location.origin;
      
      // Local development: localhost, 127.0.0.1, or local IP
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
        return 'http://localhost:9080';
      }
      
      // Render.com production
      if (origin.includes('onrender.com')) {
        return 'https://cams-backend-oj5x.onrender.com';
      }
    }
    
    // Default: localhost for development
    return 'http://localhost:9080';
  };
  
  const backendUrl = getBackendUrl();
  
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
  
  // Construct URL: https://cams-backend-oj5x.onrender.com/storage/logos/{filename}
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
  // Fetch services for dynamic footer links (limit to 6 most recent/popular)
  const { services: footerServices, loading: servicesLoading } = useServices({ 
    limit: 6,
    sortBy: 'views',
    sortOrder: 'desc'
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

  return (
    <footer className="bg-[#102A4C] dark:bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          
          {/* Company Info & Social */}
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
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={link.platform}
                    >
                      <IconComponent size={22} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {quickLinks.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-white mb-5">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
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
          )}

          {/* Services */}
          <div>
            <h3 className="text-base font-semibold text-white mb-5">Our Services</h3>
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
                  View All
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className="text-base font-semibold text-white mb-5">Get in Touch</h3>
            <ul className="space-y-4">
              {contact.phone && (
                <li>
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="flex items-center gap-3 group"
                  >
                    <Phone size={18} className="text-gray-400 group-hover:text-light-blue-cyan transition-colors" />
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
                    <Mail size={18} className="text-gray-400 group-hover:text-light-blue-cyan transition-colors" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors break-all">{contact.email}</span>
                  </a>
                </li>
              )}
              {contact.address && (
                <li>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{contact.address}</span>
                  </div>
                </li>
              )}
            </ul>
             {/* CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Link 
                href={ROUTES.CONTACT} 
                className="w-full text-center px-4 py-3 bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white font-bold rounded-lg hover:from-primary-blue/90 hover:to-light-blue-cyan/90 transition-all text-sm"
              >
                Book a FREE Call
              </Link>
              {contact.whatsappUrl && (
                <a 
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center px-4 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-sm"
                >
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Sub-Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
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
            
            {!policiesLoading && legalLinks.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-4 gap-y-2">
                {legalLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterClient;