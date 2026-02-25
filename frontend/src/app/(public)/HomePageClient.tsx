'use client';

import React, { Fragment } from 'react';
import { useHomePageState } from '@/interfaces/web/hooks/useHomePageState';
import type { HomePageSection } from '@/core/domain/pages/valueObjects/homePageSections';
import type { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import type { ServiceDTO } from '@/core/application/services';

export interface HomePageClientProps {
  sections: HomePageSection[];
  packages: PackageDTO[];
  /** Server-side packages fetch error message when initial load failed (so client can show it before/without client refetch). */
  packagesError?: string | null;
  services: ServiceDTO[];
}

export default function HomePageClient({
  sections,
  packages,
  packagesError = null,
  services,
}: HomePageClientProps) {
  const { sectionOrder, sectionsByType } = useHomePageState(
    sections,
    packages,
    packagesError,
    services
  );

  return (
    <div>
      {sectionOrder.map((sectionType: HomePageSection['type'], index: number) => {
        const node = sectionsByType[sectionType];
        if (!node) return null;
        return (
          <Fragment key={`${sectionType}-${index}`}>{node}</Fragment>
        );
      })}
    </div>
  );
}
