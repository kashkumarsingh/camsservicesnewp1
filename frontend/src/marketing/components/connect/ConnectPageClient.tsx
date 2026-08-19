import type { ReactElement, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Button } from '@/marketing/components/ui/button';
import { InterventionPackageIcon } from '@/marketing/components/shared/CamsIcon';
import { PageShell } from '@/marketing/components/shared/PageShell';
import { PAGE_SURFACES } from '@/marketing/components/shared/page-layout';
import { ConnectSharePanel } from '@/marketing/components/connect/ConnectSharePanel';
import {
  CONNECT_DIRECTORY_LINKS,
  CONNECT_LAUNCH_DATE_LABEL,
  CONNECT_MEMBER_ACTIONS,
  CONNECT_MEMBERSHIP_TIERS,
  CONNECT_OPPORTUNITY_AREAS,
  CONNECT_PRIMARY_BUTTONS,
  CONNECT_WORK_ACTIONS,
} from '@/marketing/content/connect-hub';
import { ROUTES } from '@/shared/utils/routes';

const DIRECTORY_ICONS: Record<string, typeof Globe> = {
  website: Globe,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  yell: Globe,
  gbp: Globe,
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
};

type ConnectPageClientProps = {
  intro?: ReactNode;
};

export function ConnectPageClient({ intro }: ConnectPageClientProps): ReactElement {
  return (
    <PageShell maxWidthClassName="max-w-3xl" className="pb-16 pt-8 md:pb-24">
      <header className="overflow-hidden rounded-3xl bg-cams-dark px-6 py-10 text-center text-white shadow-[0_30px_60px_-36px_rgba(2,12,27,0.8)] sm:px-10">
        <Image
          src="/logos/cams-services-logo.webp"
          alt="CAMS Services"
          width={198}
          height={44}
          className="mx-auto h-12 w-auto brightness-0 invert"
          priority
        />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-cams-secondary">
          Launching {CONNECT_LAUNCH_DATE_LABEL}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">CAMS Services</h1>
        <p className="mt-2 text-sm font-semibold text-white/80">Chaperone Activity Mentor Support</p>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
          Structured chaperone, mentoring, activity, community engagement and family support for
          children and young people aged 8 and above. One link for families, foster carers, schools,
          children’s homes and local staff.
        </p>
        <p className="mt-5 text-sm font-semibold text-cams-secondary">Connect first. Then support change.</p>
      </header>

      <nav aria-label="CAMS pathways" className="grid gap-3">
        {CONNECT_PRIMARY_BUTTONS.map((button, index) => (
          <Button
            key={button.label}
            href={button.href}
            variant={index < 2 ? 'ctaPrimary' : 'ctaSecondary'}
            size="lg"
            className="w-full justify-center"
          >
            {button.label}
          </Button>
        ))}
      </nav>

      {intro}

      <section id="member" className={`${PAGE_SURFACES.cardBase} scroll-mt-24 p-6 md:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">For families</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-cams-ink">Become a CAMS Member</h2>
        <p className="mt-3 text-sm leading-6 text-cams-ink-secondary md:text-base">
          CAMS stands for Chaperone Activity Mentor Support. We provide structured chaperone,
          mentoring, activity, community engagement and family support for children and young people
          aged 8 and above. This pathway is for parents, foster carers, schools, children’s homes and
          families who know a child or young person who may need this type of support.
        </p>
        <p className="mt-3 text-sm leading-6 text-cams-ink-secondary">
          Register your interest before the planned launch on {CONNECT_LAUNCH_DATE_LABEL}. You can
          learn about CAMS, compare monthly subscriptions, create a family account and access the
          CAMS Member Portal from the links below.
        </p>

        <h3 className="mt-8 font-heading text-lg font-bold text-cams-ink">
          Mercury, Venus, Earth and Jupiter subscriptions
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CONNECT_MEMBERSHIP_TIERS.map((tier) => (
            <li key={tier.id}>
              <Link
                href={tier.href}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-cams-primary/40 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <InterventionPackageIcon packageId={tier.id} size={28} />
                  <div>
                    <p className="font-heading text-lg font-bold text-cams-ink">{tier.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-cams-primary">
                      {tier.hours} included
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-cams-ink-secondary">{tier.summary}</p>
                <p className="mt-4 text-base font-semibold text-cams-ink">{tier.price}</p>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-2">
          {CONNECT_MEMBER_ACTIONS.map((action) => (
            <li key={action.label}>
              <Link
                href={action.href}
                className="text-sm font-semibold text-cams-primary underline-offset-4 hover:underline"
              >
                {action.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="work" className={`${PAGE_SURFACES.cardBase} scroll-mt-24 p-6 md:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">For local staff</p>
        <h2 className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold text-cams-ink">
          <Briefcase size={22} aria-hidden className="text-cams-primary" />
          Work With CAMS
        </h2>
        <p className="mt-3 text-sm leading-6 text-cams-ink-secondary md:text-base">
          For people interested in becoming a CAMS Chaperone, CAMS Mentor or CAMS Support Worker in
          their local area. Register your interest, create a staff profile, upload DBS, training,
          identification and other required documents, then enter the CAMS assessment, safeguarding
          and staff matching process.
        </p>

        <h3 className="mt-8 flex items-center gap-2 font-heading text-lg font-bold text-cams-ink">
          <MapPin size={18} aria-hidden className="text-cams-primary" />
          Areas where support opportunities may become available
        </h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {CONNECT_OPPORTUNITY_AREAS.map((area) => (
            <li key={area.href}>
              <Link
                href={area.href}
                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/40 hover:text-cams-primary"
              >
                {area.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={ROUTES.AREAS}
              className="inline-flex rounded-full border border-cams-primary/30 bg-cams-soft px-3 py-1.5 text-sm font-semibold text-cams-primary"
            >
              All CAMS areas
            </Link>
          </li>
        </ul>

        <ul className="mt-6 space-y-2">
          {CONNECT_WORK_ACTIONS.map((action) => (
            <li key={action.label}>
              <Link
                href={action.href}
                className="text-sm font-semibold text-cams-primary underline-offset-4 hover:underline"
              >
                {action.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ConnectSharePanel />

      <section aria-labelledby="follow-cams-heading" className={`${PAGE_SURFACES.cardBase} p-6 md:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">Follow and contact</p>
        <h2 id="follow-cams-heading" className="mt-2 font-heading text-2xl font-bold text-cams-ink">
          CAMS information, social media and contact
        </h2>
        <p className="mt-3 text-sm leading-6 text-cams-ink-secondary">
          View CAMS information pages, follow us, or contact the team directly from this link.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {CONNECT_DIRECTORY_LINKS.map((link) => {
            const Icon = DIRECTORY_ICONS[link.id] ?? Globe;
            return (
              <li key={link.id}>
                <a
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-cams-ink transition hover:border-cams-primary/40 hover:bg-cams-soft"
                >
                  <Icon size={18} className="shrink-0 text-cams-primary" aria-hidden />
                  <span>{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
}
