'use client';

import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { PageShell } from '@/marketing/components/shared/PageShell';
import { PageCtaSection } from '@/marketing/components/shared/PageCtaSection';
import { Button } from '@/marketing/components/ui/button';
import { PAGE_LAYOUT, PAGE_SURFACES } from '@/marketing/components/shared/page-layout';
import { PRACTITIONER_PAGE } from '@/app/(public)/constants/practitionerPageConstants';
import { PractitionerContactSidebar } from '@/marketing/components/practitioners/PractitionerContactSidebar';
import type { PractitionerProfile } from '@/marketing/content/practitioners/types';
import { ROUTES } from '@/shared/utils/routes';

type PractitionerProfilePageClientProps = {
  profile: PractitionerProfile;
};

function ProfileSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section id={id} className={`${PAGE_LAYOUT.panel} scroll-mt-28 p-5 sm:p-6 md:p-10`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-heading text-2xl font-bold text-cams-ink sm:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function PractitionerProfilePageClient({ profile }: PractitionerProfilePageClientProps): ReactElement {
  const firstName = profile.name.split(' ')[0];

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <section className="border-b border-slate-200/80 bg-gradient-to-br from-cams-primary/[0.08] via-white to-cams-secondary/[0.08] px-4 py-14 md:py-20">
        <div className={`${PAGE_LAYOUT.container} max-w-3xl`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
            {profile.heroEyebrow}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-cams-ink md:text-5xl">
            Meet <span className="text-cams-primary">{profile.name}</span>
          </h1>
          <p className="mt-4 text-base font-semibold text-cams-ink md:text-lg">
            {profile.role} | {profile.company}
          </p>
          <p className="mt-4 text-base leading-relaxed text-cams-ink-secondary md:text-lg">
            {profile.heroSubtitle}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {profile.servicesSummary.map((service) => (
              <li
                key={service}
                className="rounded-full border border-cams-primary/15 bg-white px-3 py-1 text-xs font-semibold text-cams-ink-secondary shadow-sm"
              >
                {service}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={ROUTES.CONTACT} variant="primary">
              Book this practitioner
            </Button>
            <Button href={ROUTES.REFERRAL} variant="secondary">
              Make a referral
            </Button>
            <a
              href={PRACTITIONER_PAGE.INFORMATION_PACK_PDF_PATH}
              download={PRACTITIONER_PAGE.INFORMATION_PACK_FILENAME}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-cams-primary px-4 py-2 text-sm font-semibold text-cams-primary transition hover:bg-cams-primary/10"
            >
              Download information pack
            </a>
          </div>
        </div>
      </section>

      <div className={`${PAGE_LAYOUT.splitGrid} mt-10 lg:mt-12`}>
        <div className="order-2 space-y-10 lg:order-1">
          <ProfileSection id="about" eyebrow="About me" title={`About ${firstName}`}>
            <div className="space-y-4 text-sm leading-7 text-cams-ink-secondary md:text-base">
              {profile.aboutParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection id="experience" eyebrow="Background" title="Experience">
            <p className="text-sm leading-7 text-cams-ink-secondary md:text-base">{profile.experienceIntro}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {profile.experienceItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-cams-ink-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cams-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection id="approach" eyebrow="Practice" title="My approach">
            <p className="text-sm leading-7 text-cams-ink-secondary md:text-base">{profile.approachIntro}</p>
            <ul className="mt-5 space-y-2">
              {profile.approachItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-cams-ink-secondary md:text-base">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cams-secondary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-cams-ink-secondary md:text-base">
              Sessions are always tailored around the individual rather than following a fixed programme.
            </p>
          </ProfileSection>

          <ProfileSection id="qualifications" eyebrow="Safeguarding" title="Qualifications and training">
            <p className="text-sm leading-7 text-cams-ink-secondary md:text-base">{profile.qualificationsIntro}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {profile.qualifications.map((item) => (
                <li
                  key={item}
                  className={`${PAGE_SURFACES.cardMuted} px-3 py-2.5 text-sm font-medium text-cams-ink`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection id="interests" eyebrow="Connection" title="Interests">
            <p className="text-sm leading-7 text-cams-ink-secondary md:text-base">{profile.interestsIntro}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-cams-ink-secondary"
                >
                  {interest}
                </li>
              ))}
            </ul>
            {profile.interestsFooter ? (
              <p className="mt-5 text-sm leading-7 text-cams-ink-secondary md:text-base">{profile.interestsFooter}</p>
            ) : null}
          </ProfileSection>

          <ProfileSection id="families" eyebrow="What to expect" title="What families can expect">
            <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-cams-soft/80 p-5 md:p-6">
              {profile.familiesExpectParagraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-7 text-cams-ink-secondary md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection id="documents" eyebrow="Commissioners" title="Professional documents">
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-amber-950">Secure access for authorised professionals</p>
                  <p className="mt-2 text-sm leading-6 text-amber-900/90">{profile.professionalDocumentsIntro}</p>
                  <p className="mt-3">
                    <Link
                      href={ROUTES.LOGIN}
                      className="text-sm font-semibold text-cams-primary underline underline-offset-2"
                    >
                      Sign in to request documents
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {profile.professionalDocuments.map((doc) => (
                <li
                  key={doc}
                  className="flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm text-cams-ink-secondary"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0 text-cams-slate" aria-hidden />
                  {doc}
                </li>
              ))}
            </ul>
          </ProfileSection>
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <PractitionerContactSidebar profile={profile} />
        </aside>
      </div>

      <PageCtaSection
        className="mt-10"
        heading={`Enquire about ${profile.name}`}
        description="Parents, carers, schools, social workers and commissioners contact CAMS Services for referrals and bookings. Practitioner personal numbers are not published."
        actions={[
          { href: ROUTES.CONTACT, label: 'Contact CAMS Services', variant: 'primary' },
          { href: ROUTES.REFERRAL, label: 'Make a Referral', variant: 'secondary' },
        ]}
      />
    </PageShell>
  );
}
