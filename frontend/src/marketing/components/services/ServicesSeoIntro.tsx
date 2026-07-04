import type { ReactElement } from 'react';
import Link from 'next/link';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { SERVICES_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { SERVICE_PROGRAMME_LIST } from '@/marketing/mock/services-programmes';

/** Server-rendered intro for /services (crawlable text-HTML ratio). */
export function ServicesSeoIntro(): ReactElement {
  return (
    <PageSeoProse
      eyebrow={SERVICES_INDEX_SEO_PROSE.eyebrow}
      title={SERVICES_INDEX_SEO_PROSE.title}
      titleAs={SERVICES_INDEX_SEO_PROSE.titleAs}
      paragraphs={SERVICES_INDEX_SEO_PROSE.paragraphs}
      links={SERVICES_INDEX_SEO_PROSE.links}
      className="border-b border-slate-200"
    >
      <nav className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6" aria-label="CAMS services programmes">
        <h2 className="text-lg font-bold text-navy-blue">All programmes</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SERVICE_PROGRAMME_LIST.map((programme) => (
            <li key={programme.href}>
              <Link href={programme.href} className="text-sm font-semibold text-primary-blue underline underline-offset-2">
                {programme.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PageSeoProse>
  );
}
