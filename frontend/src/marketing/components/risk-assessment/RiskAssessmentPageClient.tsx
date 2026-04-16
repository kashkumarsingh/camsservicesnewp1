import type { ReactElement } from "react";
import Image from "next/image";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { Button } from "@/marketing/components/ui/button";
import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";
import { PAGE_LAYOUT, PAGE_TYPOGRAPHY } from "@/marketing/components/shared/page-layout";

const RISK_CATEGORIES = [
  {
    level: "HIGH RISK",
    levelClassName: "bg-red-100 text-red-600",
    title: "Immediate Safety Concerns",
    description:
      "Young people presenting with active suicidal ideation, severe self-harm, serious mental health crises, or acute safeguarding concerns require immediate intervention and specialist services.",
    indicators: [
      "Active suicidal or self-harm ideation",
      "Severe mental health crisis (psychosis, severe depression)",
      "Recent serious harm incidents",
      "Severe child exploitation or abuse",
      "Acute safeguarding concerns (domestic violence, neglect)",
      "Active substance abuse requiring detoxification"
    ],
    actions: [
      "Referral to immediate specialist services (mental health crisis team)",
      "Liaison with local authority safeguarding teams",
      "Contact with emergency services where appropriate",
      "Support coordination with existing mental health providers",
      "Close communication with parents/carers and professionals",
      "CAMS mentoring as supplementary support only after acute crisis stabilisation"
    ]
  },
  {
    level: "MEDIUM RISK",
    levelClassName: "bg-amber-100 text-amber-600",
    title: "Significant Behavioral or Emotional Concerns",
    description:
      "Young people with moderate behavioral, emotional, or social difficulties who require structured support and close monitoring but are not in immediate acute danger.",
    indicators: [
      "Chronic self-harm or suicidal thoughts (not current emergency)",
      "Serious behavioral problems with risk of harm",
      "Moderate mental health concerns (depression, anxiety)",
      "History of exploitation or abuse (stabilised)",
      "Substance misuse (but not acute crisis)",
      "School exclusion or serious truancy"
    ],
    actions: [
      "Comprehensive assessment and consultation with existing services",
      "Mentoring with close oversight and regular reviews",
      "Monthly safeguarding supervision for mentors",
      "Regular communication with parents/carers and professionals",
      "Clear escalation protocols if risk increases",
      "Ongoing support coordination with relevant agencies"
    ]
  },
  {
    level: "LOW RISK",
    levelClassName: "bg-emerald-100 text-emerald-600",
    title: "Engagement and Development Needs",
    description:
      "Young people with primarily behavioral, educational, or social development needs without significant safeguarding concerns. Ideal candidates for mentoring intervention.",
    indicators: [
      "Low engagement with education or activities",
      "Mild to moderate behavioral concerns",
      "Social skills development needs",
      "Confidence and self-esteem building",
      "Need for positive role modeling",
      "Structure and routine support"
    ],
    actions: [
      "Standard mentoring with appropriate activity matching",
      "Quarterly safeguarding supervision for mentors",
      "Regular progress reviews (every 4-6 weeks)",
      "Communication with parents/carers",
      "Standard escalation protocols if concerns arise",
      "Continuation of mentoring as primary support"
    ]
  }
] as const;

export function RiskAssessmentPageClient(): ReactElement {
  return (
    <div className="w-full bg-slate-50">
      <PageShell className="pb-12 md:pb-16" maxWidthClassName="max-w-[1600px]">
        <PageHeroBand
          title={
            <>
              Risk Assessment & <span className="text-cams-primary">Safeguarding</span>
            </>
          }
          description="Understanding risk factors and CAMS safeguarding protocols. Professional guidance for referrers and partner agencies."
        />

        <section className={PAGE_LAYOUT.sectionPadding}>
          <div className={PAGE_LAYOUT.container}>
            <div className={`${PAGE_LAYOUT.panelCompact} p-6 md:p-10`}>
              <h2 className={`${PAGE_TYPOGRAPHY.cardHeading} text-cams-dark`}>
                Who this is for
              </h2>
              <p className={`mt-4 max-w-[920px] ${PAGE_TYPOGRAPHY.body}`}>
                This page helps schools, social workers, local authority professionals and
                parents decide whether CAMS mentoring is an appropriate intervention pathway.
                Use the triage matrix to identify current risk level, then follow the
                escalation flow to determine immediate next actions.
              </p>
              <div className={`mt-6 ${PAGE_LAYOUT.threeColGrid}`}>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-cams-dark">
                    Appropriate for CAMS
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-cams-slate md:text-base">
                    Behavioural, emotional, engagement, routine and confidence needs without
                    immediate psychiatric crisis.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-cams-dark">
                    Needs consultation
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-cams-slate md:text-base">
                    Mixed presentation where risk is unclear, or where existing services need
                    mentoring support to sit alongside their plan.
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-red-700">
                    Not first-line for CAMS
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-red-700/90 md:text-base">
                    Active suicidal intent, severe psychosis, acute safeguarding danger, or any
                    emergency requiring crisis team or emergency response.
                  </p>
                </div>
              </div>
            </div>

            <div className={`mt-8 ${PAGE_LAYOUT.twoColGrid}`}>
              <figure className={`overflow-hidden ${PAGE_LAYOUT.panelCompact}`}>
                <Image
                  src={camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.mentoring, 1200, 760)}
                  alt="Mentor and young person in a focused support session"
                  className="h-64 w-full object-cover md:h-72"
                  width={1200}
                  height={760}
                />
                <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-cams-slate">
                  Relationship-first mentoring with safeguarding oversight.
                </figcaption>
              </figure>
              <figure className={`overflow-hidden ${PAGE_LAYOUT.panelCompact}`}>
                <Image
                  src={camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.routine, 1200, 760)}
                  alt="Supported routine and structured learning activity"
                  className="h-64 w-full object-cover md:h-72"
                  width={1200}
                  height={760}
                />
                <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-cams-slate">
                  Structured sessions help reduce uncertainty and improve engagement.
                </figcaption>
              </figure>
            </div>

            <h2 className={`mt-16 text-center ${PAGE_TYPOGRAPHY.sectionHeading}`}>
              Triage <span className="text-cams-primary">Matrix</span>
            </h2>
            <div className="mt-10 space-y-8">
              {RISK_CATEGORIES.map((category) => (
                <article
                  key={category.level}
                  className={`${PAGE_LAYOUT.panelCompact} p-6 transition hover:shadow-md md:p-10`}
                >
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${category.levelClassName}`}
                  >
                    {category.level}
                  </p>
                  <h3 className="mt-4 text-2xl font-bold text-cams-dark md:text-3xl">{category.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-cams-slate md:text-base md:leading-8">
                    {category.description}
                  </p>

                  <div className="mt-6 rounded-md border-l-4 border-cams-primary bg-slate-50 p-5">
                    <h4 className="text-base font-bold text-cams-dark">Risk Indicators</h4>
                    <ul className="mt-3 space-y-2 text-sm text-cams-slate">
                      {category.indicators.map((indicator) => (
                        <li key={indicator} className="flex gap-2">
                          <span className="font-bold text-cams-primary">▪</span>
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 rounded-md border-l-4 border-emerald-500 bg-emerald-50/50 p-5">
                    <h4 className="text-base font-bold text-cams-dark">CAMS Action Protocol</h4>
                    <ul className="mt-3 space-y-2 text-sm text-cams-slate">
                      {category.actions.map((action) => (
                        <li key={action} className="flex gap-2">
                          <span className="font-bold text-emerald-600">✓</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            <div className={`mt-8 ${PAGE_LAYOUT.panelCompact} p-6 md:p-8`}>
              <h3 className="text-2xl font-bold text-cams-dark">Escalation flow</h3>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-700">Step 1</p>
                  <p className="mt-2 text-sm font-semibold text-red-700">Immediate danger?</p>
                  <p className="mt-2 text-sm leading-7 text-red-700/90 md:text-base">
                    Refer to emergency services, crisis team, or safeguarding duty team before
                    any mentoring allocation.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Step 2</p>
                  <p className="mt-2 text-sm font-semibold text-amber-700">Risk present but stable?</p>
                  <p className="mt-2 text-sm leading-7 text-amber-700/90 md:text-base">
                    Use CAMS with increased professional oversight, regular review, and clear
                    escalation triggers.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Step 3</p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">Low risk and suitable?</p>
                  <p className="mt-2 text-sm leading-7 text-emerald-700/90 md:text-base">
                    Start mentoring intervention with a tailored activity plan, progress reviews,
                    and transparent communication with carers/referrers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-cams-primary/5 to-cams-secondary/5 p-6 md:p-8">
              <h3 className="text-2xl font-bold text-cams-dark">Need a quick decision?</h3>
              <p className="mt-3 max-w-[860px] text-base leading-8 text-cams-slate">
                If you are unsure whether to refer, our team can triage suitability and advise on
                immediate next steps. We will tell you directly when specialist crisis services are
                the right first route.
              </p>
              <div className={PAGE_LAYOUT.ctaRow}>
                <Button href="/referral">Start a referral</Button>
                <Button href="/contact" variant="ghost">
                  Talk to safeguarding team
                </Button>
                <Button href="/services" variant="ghost">
                  Explore CAMS services
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    </div>
  );
}
