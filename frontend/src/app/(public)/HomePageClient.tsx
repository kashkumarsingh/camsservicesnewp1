'use client';

import React, { Fragment } from 'react';
import { useHomePageState } from '@/interfaces/web/hooks/useHomePageState';
import type { HomePageSection } from '@/core/domain/pages/valueObjects/homePageSections';
import type { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import type { ServiceDTO } from '@/core/application/services';

export interface HomePageClientProps {
  sections: HomePageSection[];
  packages: PackageDTO[];
  services: ServiceDTO[];
}

export default function HomePageClient({
  sections,
  packages,
  services,
}: HomePageClientProps) {
  const { sectionOrder, sectionsByType } = useHomePageState(
    sections,
    packages,
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
