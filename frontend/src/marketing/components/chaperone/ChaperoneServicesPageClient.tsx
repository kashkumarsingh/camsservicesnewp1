import type { ReactElement } from 'react';
import Link from 'next/link';
import { Button } from '@/marketing/components/ui/button';
import { PageCtaSection } from '@/marketing/components/shared/PageCtaSection';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { PAGE_LAYOUT } from '@/marketing/components/shared/page-layout';
import { CHAPERONE_SERVICES_PAGE } from '@/marketing/content/chaperone-services-page';
import { PagePrimaryImageSection } from '@/marketing/components/seo/PagePrimaryImageSection';
import { LOCATION_AREAS } from '@/marketing/content/locations';
import { ROUTES } from '@/shared/utils/routes';
import { CAMS_CONTACT, camsTelHref } from '@/marketing/mock/cams-services-catalog';

export function ChaperoneServicesPageClient(): ReactElement {
  const featuredAreas = LOCATION_AREAS.slice(0, 8);

  return (
    <div className="bg-cams-soft">
      <section className="border-b border-slate-200/80 bg-gradient-to-br from-cams-primary/10 via-white to-cams-secondary/10 px-4 py-16 md:py-24">
        <div className={`${PAGE_LAYOUT.container} max-w-3xl`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
            {CHAPERONE_SERVICES_PAGE.heroEyebrow}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-cams-ink md:text-5xl">
            {CHAPERONE_SERVICES_PAGE.heroTitle}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-cams-ink-secondary">
            {CHAPERONE_SERVICES_PAGE.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.REFERRAL} variant="primary" size="lg">
              Make a referral
            </Button>
            <Button href={ROUTES.CONTACT} variant="secondary" size="lg">
              Book a consultation
            </Button>
          </div>
        </div>
      </section>

      <div className={PAGE_LAYOUT.container}>
        <PagePrimaryImageSection pagePath={ROUTES.CHAPERONE_SERVICES} />
      </div>

      <section className="px-4 py-14 md:py-20">
        <div className={PAGE_LAYOUT.container}>
          <PageSeoProse
            variant="section"
            titleAs="h2"
            title="What our chaperone services include"
            headingId="chaperone-services-overview"
            paragraphs={CHAPERONE_SERVICES_PAGE.paragraphs}
            links={CHAPERONE_SERVICES_PAGE.links}
          />
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white px-4 py-14 md:py-20">
        <div className={PAGE_LAYOUT.container}>
          <header className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-secondary">
              Near you
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-cams-ink md:text-4xl">
              Chaperone service &amp; chaperoning services by borough
            </h2>
            <p className="mt-4 text-cams-ink-secondary">
              Searching chaperone service Ealing, chaperoning services Hounslow, or chaperone service near your
              postcode? Each borough page explains local delivery, neighbourhoods and how to refer.
            </p>
          </header>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredAreas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={ROUTES.AREA_BY_SLUG(area.slug)}
                  className="block rounded-2xl border border-slate-200/90 bg-cams-soft/60 px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/30 hover:bg-white"
                >
                  Chaperone service &amp; chaperoning services in {area.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link href={ROUTES.AREAS} className="font-semibold text-cams-primary underline-offset-2 hover:underline">
              View all service areas →
            </Link>
          </p>
        </div>
      </section>

      <section className="px-4 py-14 md:py-20" aria-labelledby="chaperone-faq-heading">
        <div className={`${PAGE_LAYOUT.container} max-w-3xl`}>
          <h2 id="chaperone-faq-heading" className="font-heading text-3xl font-bold text-cams-ink">
            Chaperone services: frequently asked questions
          </h2>
          <dl className="mt-8 space-y-6">
            {CHAPERONE_SERVICES_PAGE.faq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <dt className="font-heading text-lg font-bold text-cams-ink">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-cams-ink-secondary">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <PageCtaSection
        heading="Commission chaperone services with CAMS"
        description="Submit a referral with schedule and safeguarding details, or call our team to discuss chaperone service capacity."
        actions={[
          { href: ROUTES.REFERRAL, label: 'Make a referral', variant: 'primary' },
          { href: camsTelHref(CAMS_CONTACT.phone), label: 'Call us', variant: 'secondary' },
          { href: ROUTES.CONTACT, label: 'Contact form', variant: 'secondary' },
        ]}
      />
    </div>
  );
}
