import type { ReactElement } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/utils/routes';
import { POLICY_DOCUMENT_SLUGS, POLICY_DOCUMENT_LABELS } from '@/dashboard/utils/publicPageConstants';

/** Server-rendered intro for /policies (crawlable word count + H1). */
export function PoliciesSeoIntro(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-blue">Legal and safeguarding</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy-blue md:text-4xl">CAMS policies and legal documents</h1>
      <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-slate-600">
        <p>
          CAMS services Ltd maintains clear, accessible policies so families, schools, and commissioning teams
          understand how we handle data, safeguarding, cancellations, cookies, and payments. Our documents follow UK
          requirements including GDPR, safeguarding statutory guidance, and consumer rights for service bookings.
        </p>
        <p>
          Each policy below explains what you can expect when you refer a child, book an intervention package, or work
          with our mentors and chaperones. We review documents regularly and publish updates on this page. If you need
          help applying a policy to your referral, contact{' '}
          <a href="mailto:info@camsservices.co.uk" className="font-semibold text-primary-blue underline underline-offset-2">
            info@camsservices.co.uk
          </a>
          .
        </p>
        <p>
          Related pages:{' '}
          <Link href={ROUTES.FAQ} className="font-semibold text-primary-blue underline underline-offset-2">
            frequently asked questions
          </Link>
          ,{' '}
          <Link href={ROUTES.PACKAGES} className="font-semibold text-primary-blue underline underline-offset-2">
            intervention packages
          </Link>
          , and{' '}
          <Link href={ROUTES.REFERRAL} className="font-semibold text-primary-blue underline underline-offset-2">
            make a referral
          </Link>
          .
        </p>
      </div>
      <nav className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6" aria-label="Policy documents">
        <h2 className="text-lg font-bold text-navy-blue">Published policy documents</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {POLICY_DOCUMENT_SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                href={ROUTES.POLICIES_BY_SLUG(slug)}
                className="text-sm font-semibold text-primary-blue underline underline-offset-2"
              >
                {POLICY_DOCUMENT_LABELS[slug]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
