import React from 'react';
import ContactPageClient from './ContactPageClient';
import { ListPackagesUseCase } from '@/core/application/packages/useCases/ListPackagesUseCase';
import { ListServicesUseCase } from '@/core/application/services/useCases/ListServicesUseCase';
import { packageRepository } from '@/infrastructure/persistence/packages';
import { serviceRepository } from '@/infrastructure/persistence/services';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';
import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { Metadata } from 'next';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/utils/routes';
import { CONTACT_PAGE } from '@/app/(public)/constants/contactPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

async function fetchPackages() {
  const useCase = new ListPackagesUseCase(packageRepository);
  try {
    return await useCase.execute();
  } catch (error) {
    console.error('[ContactPage] Failed to load packages', error);
    return [];
  }
}

async function fetchServices() {
  const useCase = new ListServicesUseCase(serviceRepository);
  try {
    return await useCase.execute();
  } catch (error) {
    console.error('[ContactPage] Failed to load services', error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: CONTACT_PAGE.META_TITLE,
      description: CONTACT_PAGE.META_DESCRIPTION,
      path: ROUTES.CONTACT,
      imageAlt: CONTACT_PAGE.OG_IMAGE_ALT,
    },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function ContactPage() {
  // Use timeout utilities for fast failure - don't block page render
  const [siteSettingsResult, packagesResult, servicesResult] = await Promise.allSettled([
    withTimeoutFallback(getSiteSettings(), 3000, null),
    withTimeoutFallback(fetchPackages(), 2000, []), // 2s timeout – don't block contact page on slow packages API
    withTimeoutFallback(fetchServices(), 2000, []), // 2s timeout – don't block contact page on slow services API
  ]);
  
  const siteSettings: SiteSetting | null = siteSettingsResult.status === 'fulfilled' ? siteSettingsResult.value : null;
  const packages = packagesResult.status === 'fulfilled' ? packagesResult.value : [];
  const services = servicesResult.status === 'fulfilled' ? servicesResult.value : [];

  const contactInfo = {
    phone: siteSettings?.contact.phone ?? '',
    email: siteSettings?.contact.email ?? '',
    address: siteSettings?.contact.address ?? '',
    mapEmbedUrl: siteSettings?.contact.mapEmbedUrl ?? '',
    whatsappUrl: siteSettings?.contact.whatsappUrl ?? '',
  };

  return (
    <ContactPageClient
      packages={packages}
      services={services}
      contactInfo={contactInfo}
    />
  );
}

