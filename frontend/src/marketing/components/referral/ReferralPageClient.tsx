"use client";

import type { FormEvent, ReactElement } from "react";
import { useId, useState } from "react";
import { Button } from "@/marketing/components/ui/button";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT } from "@/marketing/components/shared/page-layout";
import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";
import { useReferralForm } from "@/interfaces/web/hooks/referrals/useReferralForm";

const PROCESS_STEPS: ReadonlyArray<{
  number: string;
  icon: CamsIconName;
  title: string;
  text: string;
}> = [
  {
    number: "1",
    icon: "clipboardList",
    title: "Submit Referral",
    text: "Fill out our referral form with details about the young person and their needs."
  },
  {
    number: "2",
    icon: "phoneCall",
    title: "Initial Chat",
    text: "We contact you within 24 hours to discuss context and confirm next steps."
  },
  {
    number: "3",
    icon: "heartHandshake",
    title: "Match & Start",
    text: "We match with a suitable mentor and schedule first sessions quickly."
  },
  {
    number: "4",
    icon: "lineChart",
    title: "Progress & Updates",
    text: "Regular updates, progress reports, and ongoing communication."
  }
];

const ELIGIBILITY_POINTS: ReadonlyArray<string> = [
  "Young people aged 5-18",
  "Those struggling with engagement",
  "Challenging behaviour concerns",
  "Emotional regulation difficulties",
  "SEN & additional needs",
  "Looked after children",
  "Young people in schools & settings"
];

const QUICK_ANSWER_POINTS: ReadonlyArray<string> = [
  "Referral assessment within 24 hours",
  "Start date within 1 week (usually)",
  "100% DBS checked mentors",
  "Flexible package options",
  "Payment within 14 days",
  "Regular progress updates",
  "Flexible cancellation policy"
];

const SERVICE_STANDARDS: ReadonlyArray<{
  title: string;
  detail: string;
  icon: CamsIconName;
}> = [
  {
    title: "24-hour triage response",
    detail: "Initial review and follow-up call within one working day.",
    icon: "phoneCall"
  },
  {
    title: "DBS-checked mentors",
    detail: "Every mentor is fully vetted and suitability matched.",
    icon: "heartHandshake"
  },
  {
    title: "Outcome-focused reporting",
    detail: "Planned milestones with regular written progress updates.",
    icon: "lineChart"
  },
  {
    title: "Clear delivery process",
    detail: "Defined steps, transparent timelines and consistent communication.",
    icon: "clipboardList"
  }
];

export function ReferralPageClient(): ReactElement {
  const baseId = useId();
  const { submit, loading, error } = useReferralForm();
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    referrerName: "",
    referrerRole: "",
    referrerEmail: "",
    referrerPhone: "",
    youngPersonName: "",
    youngPersonAge: "",
    schoolSetting: "",
    primaryConcern: "",
    backgroundContext: "",
    successOutcome: "",
    preferredPackage: "",
    additionalInfo: "",
  });

  const field = (name: string): string => `${baseId}-${name}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      await submit({
        referrer_name: values.referrerName.trim(),
        referrer_role: values.referrerRole.trim(),
        referrer_email: values.referrerEmail.trim(),
        referrer_phone: values.referrerPhone.trim(),
        young_person_name: values.youngPersonName.trim(),
        young_person_age: values.youngPersonAge.trim(),
        school_setting: values.schoolSetting.trim() || undefined,
        primary_concern: values.primaryConcern.trim(),
        background_context: values.backgroundContext.trim(),
        success_outcome: values.successOutcome.trim(),
        preferred_package: values.preferredPackage.trim(),
        additional_info: values.additionalInfo.trim() || undefined,
      });
      setSubmitted(true);
      setValues({
        referrerName: "",
        referrerRole: "",
        referrerEmail: "",
        referrerPhone: "",
        youngPersonName: "",
        youngPersonAge: "",
        schoolSetting: "",
        primaryConcern: "",
        backgroundContext: "",
        successOutcome: "",
        preferredPackage: "",
        additionalInfo: "",
      });
    } catch {
      setSubmitted(false);
    }
  }

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Make a <span className="text-cams-primary">Referral</span>
          </>
        }
        description="Simple 4-step process to get a young person the support they need. We handle the rest."
      />

      <section className={`${PAGE_LAYOUT.panelCompact} p-6 sm:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-2xl font-bold text-cams-navy sm:text-3xl">Professional Standards</h2>
          <p className="text-sm text-cams-slate">Built for schools, local authorities, and family support teams.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SERVICE_STANDARDS.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2">
                <CamsIcon name={item.icon} surface="muted" size={22} />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-cams-navy">{item.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-cams-slate">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-center font-mono text-4xl font-bold">
          The <span className="text-cams-primary">Process</span>
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step) => (
            <article key={step.number} className="relative rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-cams-primary hover:shadow-lg">
              <div className="absolute -top-4 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cams-primary to-cams-secondary font-mono text-xl font-bold text-white">
                {step.number}
              </div>
              <div className="mt-4 flex justify-center">
                <CamsIcon name={step.icon} size={40} />
              </div>
              <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cams-slate">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panelCompact} p-8`}>
        <h2 className="text-center font-mono text-4xl font-bold">
          Referral <span className="text-cams-primary">Form</span>
        </h2>
        <p className="mx-auto mt-4 max-w-4xl text-center text-sm leading-7 text-cams-slate">
          Please complete the key details below. Required fields are marked with an asterisk, and our team will contact you with next steps after review.
        </p>
        {submitted ? (
          <div className="mx-auto mt-8 max-w-4xl space-y-4">
            <p className="rounded-lg border border-cams-primary/30 bg-cams-primary/5 px-4 py-3 text-sm text-cams-dark">
              Thank you. Your referral request has been submitted. A CAMS team member will contact you
              within one working day.
            </p>
            <Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>
              Submit another referral
            </Button>
          </div>
        ) : (
        <form className="mx-auto mt-8 max-w-4xl space-y-8" onSubmit={handleSubmit}>
          <fieldset className="space-y-4">
            <legend className="text-xl font-bold">Your Information</legend>
            <div className="space-y-2">
              <label htmlFor={field("referrerName")} className="text-sm font-semibold text-cams-navy">Full name *</label>
              <input id={field("referrerName")} required value={values.referrerName} onChange={(event) => setValues((previous) => ({ ...previous, referrerName: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="e.g. Sarah Ahmed" />
            </div>
            <div className="space-y-2">
              <label htmlFor={field("referrerRole")} className="text-sm font-semibold text-cams-navy">Role *</label>
              <input id={field("referrerRole")} required value={values.referrerRole} onChange={(event) => setValues((previous) => ({ ...previous, referrerRole: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="e.g. DSL, SENCO, parent/carer" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor={field("referrerEmail")} className="text-sm font-semibold text-cams-navy">Email address *</label>
                <input id={field("referrerEmail")} type="email" required value={values.referrerEmail} onChange={(event) => setValues((previous) => ({ ...previous, referrerEmail: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="name@organisation.co.uk" />
              </div>
              <div className="space-y-2">
                <label htmlFor={field("referrerPhone")} className="text-sm font-semibold text-cams-navy">Phone number *</label>
                <input id={field("referrerPhone")} required value={values.referrerPhone} onChange={(event) => setValues((previous) => ({ ...previous, referrerPhone: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="Best contact number" />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-xl font-bold">About the Young Person</legend>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor={field("youngPersonName")} className="text-sm font-semibold text-cams-navy">Young person&apos;s name *</label>
                <input id={field("youngPersonName")} required value={values.youngPersonName} onChange={(event) => setValues((previous) => ({ ...previous, youngPersonName: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <label htmlFor={field("youngPersonAge")} className="text-sm font-semibold text-cams-navy">Age *</label>
                <input id={field("youngPersonAge")} required value={values.youngPersonAge} onChange={(event) => setValues((previous) => ({ ...previous, youngPersonAge: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="Age in years" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor={field("schoolSetting")} className="text-sm font-semibold text-cams-navy">School/setting name</label>
              <input id={field("schoolSetting")} value={values.schoolSetting} onChange={(event) => setValues((previous) => ({ ...previous, schoolSetting: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="School, provision, or organisation" />
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-xl font-bold">Main Needs & Challenges</legend>
            <div className="space-y-2">
              <label htmlFor={field("primaryConcern")} className="text-sm font-semibold text-cams-navy">Primary concern *</label>
              <select id={field("primaryConcern")} required value={values.primaryConcern} onChange={(event) => setValues((previous) => ({ ...previous, primaryConcern: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-cams-slate focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20">
                <option value="" disabled>Select the main presenting need</option>
                <option>Challenging Behaviour</option>
                <option>Low Engagement/Disengagement</option>
                <option>Emotional Regulation</option>
                <option>Low Confidence/Self-Esteem</option>
                <option>Relationship Issues</option>
                <option>Difficulty with Structure/Routine</option>
                <option>SEN/Additional Needs</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor={field("backgroundContext")} className="text-sm font-semibold text-cams-navy">Background and context *</label>
              <textarea id={field("backgroundContext")} required value={values.backgroundContext} onChange={(event) => setValues((previous) => ({ ...previous, backgroundContext: event.target.value }))} className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="Include relevant behaviour patterns, support history, and current concerns." />
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-xl font-bold">Intervention Goals</legend>
            <div className="space-y-2">
              <label htmlFor={field("successOutcome")} className="text-sm font-semibold text-cams-navy">What would success look like? *</label>
              <textarea id={field("successOutcome")} required value={values.successOutcome} onChange={(event) => setValues((previous) => ({ ...previous, successOutcome: event.target.value }))} className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20" placeholder="Describe measurable changes you would like to see over the intervention period." />
            </div>
            <div className="space-y-2">
              <label htmlFor={field("preferredPackage")} className="text-sm font-semibold text-cams-navy">Preferred package *</label>
              <select id={field("preferredPackage")} required value={values.preferredPackage} onChange={(event) => setValues((previous) => ({ ...previous, preferredPackage: event.target.value }))} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-cams-slate focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20">
                <option value="" disabled>Select a package option</option>
                {INTERVENTION_PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}, {pkg.price} ({pkg.frequencyLine})
                  </option>
                ))}
                <option value="unsure">Not sure - I&apos;d like advice</option>
              </select>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-slate-200 pt-6">
            <legend className="text-xl font-bold">Additional Information</legend>
            <div className="space-y-2">
              <label htmlFor={field("additionalInfo")} className="text-sm font-semibold text-cams-navy">Anything else we should know?</label>
              <textarea
                id={field("additionalInfo")}
                value={values.additionalInfo}
                onChange={(event) => setValues((previous) => ({ ...previous, additionalInfo: event.target.value }))}
                className="min-h-24 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                placeholder="Any safeguarding, scheduling, or communication considerations."
              />
            </div>
          </fieldset>

          <div className="rounded-xl border border-cams-primary/20 bg-cams-primary/5 p-4 text-sm text-cams-slate">
            <p className="font-semibold text-cams-navy">Data & safeguarding note</p>
            <p className="mt-1 leading-6">
              Information is handled confidentially and only used for referral triage, mentor matching, and service planning. A named team member will confirm details before intervention begins.
            </p>
          </div>

          <Button type="submit" className="w-full py-3 text-base font-semibold">
            {loading ? "Submitting referral..." : "Submit Referral Request"}
          </Button>
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error.message}
            </p>
          ) : null}
        </form>
        )}
      </section>

      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/40 to-white p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-16 h-44 w-44 rounded-full bg-cams-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-12 h-44 w-44 rounded-full bg-cams-secondary/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full border border-cams-primary/20 bg-cams-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
            Eligibility & FAQs
          </p>
          <h2 className="mt-4 font-mono text-4xl font-bold leading-tight sm:text-5xl">
            Right support, <span className="text-cams-primary">without delay</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-cams-slate sm:text-base">
            Transparent eligibility and practical answers up front, so schools, families and professionals can make quick, confident referral decisions.
          </p>
        </div>

        <div className="relative z-10 mt-10 grid gap-6 lg:grid-cols-2">
          <article className="group rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_40px_-25px_rgba(15,23,42,0.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-26px_rgba(15,23,42,0.45)]">
            <h3 className="flex items-center gap-3 text-2xl font-bold">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cams-primary/10 text-cams-primary">
                <CamsIcon name="listChecks" size={24} />
              </span>
              We Work With
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-cams-slate sm:text-base">
              {ELIGIBILITY_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cams-secondary/15 text-xs font-bold text-cams-secondary">
                    ✓
                  </span>
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="group rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_40px_-25px_rgba(15,23,42,0.35)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-26px_rgba(15,23,42,0.45)]">
            <h3 className="flex items-center gap-3 text-2xl font-bold">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cams-secondary/10 text-cams-secondary">
                <CamsIcon name="circleHelp" size={24} />
              </span>
              Quick Answers
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-cams-slate sm:text-base">
              {QUICK_ANSWER_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cams-primary/15 text-xs font-bold text-cams-primary">
                    ✓
                  </span>
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <PageCtaSection
        heading="Still deciding on the right pathway?"
        description="Compare delivery options and pricing, or speak to the team before you submit full referral details."
        actions={[
          { href: "/risk-assessment", label: "Start with risk assessment", variant: "primary" },
          { href: "/services", label: "Explore services", variant: "primary" },
          { href: "/packages", label: "View packages", variant: "secondary" },
          { href: "/contact", label: "Contact us", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
