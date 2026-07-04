import type { ReactElement } from 'react';
import Link from 'next/link';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { PACKAGES_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { INTERVENTION_PACKAGES } from '@/marketing/mock/intervention-packages';
import { packageDetailHref } from '@/marketing/lib/package-detail-slug';

/** Server-rendered intro for /packages (crawlable word count). Renders after the hero. */
export function PackagesSeoIntro(): ReactElement {
  return (
    <PageSeoProse {...PACKAGES_INDEX_SEO_PROSE} headingId="packages-seo-intro-heading">
      <p className="text-base leading-7 text-cams-ink-secondary">
        Browse programme pages for{' '}
        {INTERVENTION_PACKAGES.map((pkg, index) => (
          <span key={pkg.id}>
            {index > 0 ? (index === INTERVENTION_PACKAGES.length - 1 ? ', and ' : ', ') : null}
            <Link
              href={packageDetailHref(pkg.id)}
              className="font-semibold text-cams-primary underline underline-offset-2"
            >
              {pkg.name}
            </Link>
          </span>
        ))}
        .
      </p>
    </PageSeoProse>
  );
}
