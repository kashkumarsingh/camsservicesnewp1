import type { ReactElement } from "react";
import Image from "next/image";
import { Button } from "@/marketing/components/ui/button";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";

type RoleMetaItem = { icon: CamsIconName; text: string };

type RoleItem = {
  icon: CamsIconName;
  title: string;
  meta: readonly RoleMetaItem[];
  description: string;
  requirements: readonly string[];
  ctaHref: string;
  ctaLabel: string;
};

const CAREERS_HERO_IMAGE = camsUnsplashPhotoUrl("1517048676732-d65bc937f952", 1600, 1000);

const ROLES: readonly RoleItem[] = [
  {
    icon: "heartHandshake",
    title: "Mentoring Trainer",
    meta: [
      { icon: "mapPin", text: "London & Essex" },
      { icon: "clock", text: "Flexible" }
    ],
    description:
      "Provide one-to-one mentoring to young people, deliver structured activities, and track progress.",
    requirements: [
      "Experience working with young people",
      "DBS check (we arrange)",
      "Reliable and enthusiastic",
      "£20-25/hour"
    ],
    ctaHref: "/become-a-trainer",
    ctaLabel: "Start trainer pathway"
  },
  {
    icon: "dumbbell",
    title: "Fitness and Wellbeing Trainer",
    meta: [
      { icon: "mapPin", text: "London" },
      { icon: "clock", text: "Flexible" }
    ],
    description:
      "Lead boxing and fitness activities for young people while combining activity with mentoring.",
    requirements: [
      "Boxing, martial arts, or fitness qualifications",
      "Youth coaching experience",
      "DBS check (we arrange)",
      "£22-28/hour"
    ],
    ctaHref: "/become-a-trainer",
    ctaLabel: "Apply as activity trainer"
  },
  {
    icon: "barChart",
    title: "Senior Programme Manager",
    meta: [
      { icon: "mapPin", text: "London" },
      { icon: "clock", text: "Full-time" }
    ],
    description:
      "Oversee mentoring programmes, manage mentors, track outcomes, and ensure quality delivery.",
    requirements: [
      "3+ years in youth/education services",
      "Management experience",
      "Data tracking and reporting",
      "Competitive salary + benefits"
    ],
    ctaHref: "/contact",
    ctaLabel: "Enquire about operations role"
  }
];

const BENEFITS: ReadonlyArray<readonly [CamsIconName, string, string]> = [
  ["wallet", "Competitive Pay", "Transparent rates, dependable payments, and clear assignment terms."],
  ["clock", "Flexible Hours", "Match opportunities based on your availability and travel preferences."],
  [
    "bookOpen",
    "Training & Development",
    "Continuous quality support for delivery standards and communication."
  ],
  [
    "graduationCap",
    "Qualifications Support",
    "Guidance on safeguarding, insurance, and role-specific UK delivery standards."
  ],
  ["users", "Supportive Team", "Operations support to reduce admin load and keep focus on outcomes."],
  ["star", "Meaningful Impact", "Work that improves confidence, behaviour, and long-term progression."]
];

const QUALITY_SIGNALS: ReadonlyArray<{ icon: CamsIconName; label: string; value: string }> = [
  { icon: "timer", label: "Fast-track review", value: "2 business days" },
  { icon: "listChecks", label: "Typical matching speed", value: "48 hours" },
  { icon: "target", label: "Delivery standard", value: "Safeguarding-led" }
];

export function CareersPageClient(): ReactElement {
  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Join Our <span className="text-cams-primary">Team</span>
          </>
        }
        description="CAMS careers in the UK: join as a trainer or programme leader and help young people progress through structured, safeguarding-led delivery."
      />

      <section className="relative overflow-hidden rounded-2xl border border-cams-primary/20 bg-slate-950 shadow-[0_30px_60px_-36px_rgba(2,12,27,0.8)]">
        <Image
          src={CAREERS_HERO_IMAGE}
          alt="CAMS team members delivering mentoring and activity sessions"
          className="h-[390px] w-full object-cover md:h-[470px]"
          width={1600}
          height={1000}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-cams-primary/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/82 via-transparent to-transparent" />
        <div className="absolute inset-0 p-6 md:p-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-slate-950/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-md">
              <CamsIcon name="briefcase" size={14} className="text-white" />
              UK Careers
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              Premium, mission-led roles with clear growth pathways
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/95 md:text-base">
              Whether you are coaching directly with families or leading programme quality, CAMS
              offers a high-accountability environment with meaningful support.
            </p>
            <div className={PAGE_LAYOUT.ctaRow}>
              <Button href="/become-a-trainer">Apply as trainer</Button>
              <Button
                href="/contact"
                variant="secondary"
                className="border-white/60 bg-white/15 text-white hover:bg-white/25"
              >
                Enquire about leadership roles
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-2 overflow-hidden rounded-2xl border border-cams-primary/20 bg-gradient-to-r from-cams-primary/[0.08] via-white to-cams-secondary/[0.08] p-5 shadow-[0_24px_55px_-35px_rgba(10,99,255,0.55)] md:p-6">
        <div className="pointer-events-none absolute -left-16 -top-14 h-36 w-36 rounded-full bg-cams-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-cams-secondary/20 blur-3xl" />
        <div className={PAGE_LAYOUT.threeColGrid}>
          {QUALITY_SIGNALS.map((item) => (
            <article
              key={item.label}
              className="rounded-xl border border-white/70 bg-white/75 p-4 shadow-[0_18px_35px_-28px_rgba(2,12,27,0.45)] backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <CamsIcon name={item.icon} size={18} className="text-cams-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cams-slate">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-cams-ink">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-center font-mono text-4xl font-bold">
          Open <span className="text-cams-primary">Positions</span>
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-base text-cams-slate">
          Select the pathway that best fits your background. Trainer roles route through our
          structured application flow, while leadership roles start with a direct conversation.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {ROLES.map((role) => (
            <article
              key={role.title}
              className={`${PAGE_SURFACES.cardBase} p-7 shadow-[0_14px_34px_-24px_rgba(2,12,27,0.4)] transition hover:-translate-y-1 hover:border-cams-primary/50 hover:shadow-[0_24px_44px_-28px_rgba(10,99,255,0.5)]`}
            >
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                <CamsIcon name={role.icon} size={28} />
                {role.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-cams-slate">
                {role.meta.map((item) => (
                  <span key={item.text} className="inline-flex items-center gap-1.5">
                    <CamsIcon name={item.icon} surface="muted" size={14} strokeWidth={2} />
                    {item.text}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-cams-slate">{role.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-cams-slate">
                {role.requirements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-bold text-cams-secondary">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button href={role.ctaHref} className="mt-6 w-full">
                {role.ctaLabel}
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-center font-mono text-4xl font-bold">
          Why Join <span className="text-cams-primary">CAMS</span>?
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(([icon, label, detail]) => (
            <article
              key={label}
              className={`${PAGE_SURFACES.cardBase} rounded-xl p-6 shadow-[0_14px_34px_-26px_rgba(2,12,27,0.35)]`}
            >
              <div className="flex justify-center">
                <CamsIcon name={icon} size={36} />
              </div>
              <h3 className="mt-3 text-center text-xl font-bold text-cams-ink">{label}</h3>
              <p className="mt-2 text-center text-sm leading-6 text-cams-slate">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-cams-primary/20 bg-gradient-to-br from-cams-soft/65 via-white to-cams-soft/50 p-8 shadow-[0_20px_45px_-30px_rgba(10,99,255,0.5)]">
        <h2 className="text-center font-mono text-4xl font-bold">
          Application <span className="text-cams-primary">Routes</span>
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-base text-cams-slate">
          We replaced the generic form with clearer pathways to reduce drop-off and route applicants
          to the right process first time.
        </p>
        <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
          <article className={`${PAGE_SURFACES.cardBase} p-6 shadow-[0_14px_30px_-24px_rgba(2,12,27,0.35)]`}>
            <h3 className="flex items-center gap-2 text-xl font-bold text-cams-ink">
              <CamsIcon name="users" size={22} />
              Trainer pathway
            </h3>
            <p className="mt-3 text-sm leading-6 text-cams-slate">
              For mentoring and activity trainers. Includes safeguarding, coverage, and compliance
              checks in one guided UK-focused journey.
            </p>
            <div className="mt-5">
              <Button href="/become-a-trainer" className="w-full">
                Continue to trainer application
              </Button>
            </div>
          </article>
          <article className={`${PAGE_SURFACES.cardBase} p-6 shadow-[0_14px_30px_-24px_rgba(2,12,27,0.35)]`}>
            <h3 className="flex items-center gap-2 text-xl font-bold text-cams-ink">
              <CamsIcon name="briefcase" size={22} />
              Leadership and operations pathway
            </h3>
            <p className="mt-3 text-sm leading-6 text-cams-slate">
              For programme, operations, and quality roles. Start with a focused enquiry and CV so we
              can direct you to suitable opportunities.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/contact" className="flex-1">
                Submit role enquiry
              </Button>
              <Button href="/about" variant="secondary" className="flex-1">
                Learn how CAMS works
              </Button>
            </div>
          </article>
        </div>
        <div className="mx-auto mt-6 max-w-5xl rounded-xl border border-cams-primary/25 bg-white/80 p-4">
          <p className="text-sm text-cams-slate">
            Prefer a quick conversation first? Email{" "}
            <a href="mailto:careers@camsservices.co.uk" className="font-semibold text-cams-primary underline">
              careers@camsservices.co.uk
            </a>{" "}
            and include your role interest, location, and availability.
          </p>
        </div>
      </section>

      <PageCtaSection
        heading={
          <>
            Looking for mentoring support, not a <span className="text-cams-secondary">role</span>?
          </>
        }
        description="Refer a young person or explore programmes, and we keep hiring and delivery on one trusted safeguarding-led platform."
        actions={[
          { href: "/referral", label: "Make a referral", variant: "primary" },
          { href: "/services", label: "View services", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
