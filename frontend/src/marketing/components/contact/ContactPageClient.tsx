"use client";

import type { FormEvent, ReactElement } from "react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/marketing/components/ui/button";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { useContactForm } from "@/interfaces/web/hooks/contact/useContactForm";

const CONTACT_CHANNELS: ReadonlyArray<{
  icon: CamsIconName;
  title: string;
  text: string;
  detail: string;
}> = [
  {
    icon: "mapPin",
    title: "Location",
    text: "CAMS Services Ltd, London, United Kingdom",
    detail: "Delivery across London and surrounding areas by arrangement."
  },
  {
    icon: "phone",
    title: "Call Back Request",
    text: "Request a call and we reply within one working day.",
    detail: "Phone support hours: Monday to Friday, 9:00 to 18:00."
  },
  {
    icon: "mail",
    title: "Email",
    text: "hello@camsservices.co.uk",
    detail: "Most enquiries are answered within 24 hours."
  },
  {
    icon: "clock",
    title: "Response Commitment",
    text: "Same-day acknowledgement during working hours.",
    detail: "Clear next-step message with owner and expected timeline."
  }
];

const CONTACT_AUDIENCE: ReadonlyArray<{ icon: CamsIconName; title: string; text: string }> = [
  {
    icon: "users",
    title: "Parents and carers",
    text: "Discuss behaviour, engagement, routine, confidence, or SEN support needs."
  },
  {
    icon: "graduationCap",
    title: "Schools and settings",
    text: "Coordinate referrals, safeguarding context, and delivery planning with your team."
  },
  {
    icon: "heartHandshake",
    title: "Partner professionals",
    text: "Align around intervention goals, timescales, and practical outcomes."
  }
];

const PROCESS_STEPS: ReadonlyArray<{
  icon: CamsIconName;
  title: string;
  text: string;
}> = [
  {
    icon: "messageCircle",
    title: "1. Initial triage",
    text: "We review your enquiry and identify the best pathway: contact advice, referral, or package guidance."
  },
  {
    icon: "phoneCall",
    title: "2. Clarification call",
    text: "If needed, we schedule a focused call to understand context, goals, and practical constraints."
  },
  {
    icon: "listChecks",
    title: "3. Recommended next step",
    text: "You receive a clear recommendation with timeline, expected outcomes, and route to start."
  }
];

type FormState = {
  fullName: string;
  organisation: string;
  email: string;
  phone: string;
  enquiryType: string;
  preferredContact: string;
  timeline: string;
  safeguardingContext: string;
  message: string;
};

const emptyForm: FormState = {
  fullName: "",
  organisation: "",
  email: "",
  phone: "",
  enquiryType: "",
  preferredContact: "",
  timeline: "",
  safeguardingContext: "",
  message: ""
};

export function ContactPageClient(): ReactElement {
  const baseId = useId();
  const [values, setValues] = useState<FormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const { submit, loading, error } = useContactForm();

  const mapInquiryType = (value: string): "package" | "service" | "general" | "other" => {
    if (value === "package-guidance") return "package";
    if (value === "new-referral" || value === "support-enquiry") return "service";
    if (value === "partnership" || value === "other") return "other";
    return "general";
  };

  const mapUrgency = (timeline: string, safeguardingContext: string): "urgent" | "soon" | "exploring" => {
    if (safeguardingContext === "urgent" || timeline === "asap") return "urgent";
    if (safeguardingContext === "some" || timeline === "this-month" || timeline === "next-term") return "soon";
    return "exploring";
  };

  const mapPreferredContact = (value: string): "email" | "phone" | "whatsapp" => {
    if (value === "phone") return "phone";
    return "email";
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const details: string[] = [];
    if (values.organisation.trim()) details.push(`Organisation: ${values.organisation.trim()}`);
    if (values.enquiryType.trim()) details.push(`Enquiry route: ${values.enquiryType.trim()}`);
    if (values.timeline.trim()) details.push(`Preferred timeline: ${values.timeline.trim()}`);
    if (values.safeguardingContext.trim()) details.push(`Safeguarding context: ${values.safeguardingContext.trim()}`);

    try {
      await submit({
        name: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        inquiryType: mapInquiryType(values.enquiryType),
        inquiryDetails: details.join(" | ") || undefined,
        urgency: mapUrgency(values.timeline, values.safeguardingContext),
        preferredContact: mapPreferredContact(values.preferredContact),
        message: values.message.trim() || undefined,
        newsletter: false,
        sourcePage: "/contact",
      });
      setSubmitted(true);
      setValues(emptyForm);
    } catch {
      setSubmitted(false);
    }
  }

  function handleResetEnquiry(): void {
    setSubmitted(false);
    setValues(emptyForm);
  }

  const field = (name: keyof FormState): string => `${baseId}-${name}`;

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Contact <span className="text-cams-primary">CAMS</span>
          </>
        }
        description="Tell us what is happening and where support is needed. We route each enquiry to the right next step quickly and clearly."
      />

      <section className={`relative overflow-hidden ${PAGE_LAYOUT.panelFrame} bg-gradient-to-b from-white to-slate-50/80 px-4 py-10 md:px-8 md:py-12`}>
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cams-secondary/[0.08] blur-3xl"
          aria-hidden
        />
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Who should contact us</p>
          <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">
            Built for <span className="text-cams-primary">real-world decisions</span>
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-cams-ink-secondary md:text-base">
            Whether you are making a first enquiry or arranging targeted support, this page helps you
            choose the right route without delays.
          </p>
        </header>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {CONTACT_AUDIENCE.map((item) => (
            <article
              key={item.title}
              className={`${PAGE_SURFACES.cardHoverLift} p-6`}
            >
              <div className="inline-flex rounded-xl border border-cams-secondary/25 bg-cams-secondary/[0.1] p-2.5">
                <CamsIcon name={item.icon} size={30} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-cams-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-cams-ink-secondary">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={PAGE_LAYOUT.splitGrid}>
        <section className={`relative overflow-hidden ${PAGE_LAYOUT.panel} p-8 md:p-10`}>
          <div
            className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-cams-primary/[0.08] blur-3xl"
            aria-hidden
          />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Enquiry</p>
          <h2 className="text-3xl font-bold">
            Start with a <span className="text-cams-primary">smarter intake</span>
          </h2>
          <p className="mt-2 text-sm text-cams-slate">
            Share the essentials once, and we will route your enquiry to the right person with the
            right response type.
          </p>

          {submitted ? (
            <div className="mt-6 space-y-4" role="status">
              <p className="rounded-lg border border-cams-primary/30 bg-cams-primary/5 px-4 py-3 text-sm text-cams-dark">
                Thank you. Your enquiry has been logged. A CAMS team member will respond with next steps
                within one working day.
              </p>
              <Button type="button" variant="secondary" onClick={handleResetEnquiry}>
                Send another message
              </Button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor={field("fullName")}>
                    Full name <span className="text-cams-primary">*</span>
                  </label>
                  <input
                    id={field("fullName")}
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    aria-required="true"
                    value={values.fullName}
                    onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor={field("organisation")}>
                    School, college, or service (optional)
                  </label>
                  <input
                    id={field("organisation")}
                    name="organisation"
                    type="text"
                    autoComplete="organization"
                    value={values.organisation}
                    onChange={(e) => setValues((v) => ({ ...v, organisation: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                    placeholder="Leave blank if you are a parent or carer"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor={field("email")}>
                    Email address <span className="text-cams-primary">*</span>
                  </label>
                  <input
                    id={field("email")}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    aria-required="true"
                    value={values.email}
                    onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor={field("phone")}>
                    Phone number
                  </label>
                  <input
                    id={field("phone")}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                    placeholder="Optional - for call back"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor={field("enquiryType")}>
                    Enquiry type <span className="text-cams-primary">*</span>
                  </label>
                  <select
                    id={field("enquiryType")}
                    name="enquiryType"
                    required
                    aria-required="true"
                    value={values.enquiryType}
                    onChange={(e) => setValues((v) => ({ ...v, enquiryType: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                  >
                    <option value="">Select an option</option>
                    <option value="support-enquiry">General support enquiry</option>
                    <option value="new-referral">New referral discussion</option>
                    <option value="package-guidance">Package and pricing guidance</option>
                    <option value="partnership">Partnership or commissioning enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor={field("preferredContact")}>
                    Preferred contact method
                  </label>
                  <select
                    id={field("preferredContact")}
                    name="preferredContact"
                    value={values.preferredContact}
                    onChange={(e) => setValues((v) => ({ ...v, preferredContact: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                  >
                    <option value="">No preference</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone call</option>
                    <option value="either">Either</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor={field("timeline")}>
                  Preferred start timeline
                </label>
                <select
                  id={field("timeline")}
                  name="timeline"
                  value={values.timeline}
                  onChange={(e) => setValues((v) => ({ ...v, timeline: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                >
                  <option value="">Select timeline (optional)</option>
                  <option value="asap">As soon as possible</option>
                  <option value="this-month">Within this month</option>
                  <option value="next-term">Next school term</option>
                  <option value="planning">Planning ahead</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor={field("safeguardingContext")}>
                  Any urgent safety concerns?
                </label>
                <select
                  id={field("safeguardingContext")}
                  name="safeguardingContext"
                  value={values.safeguardingContext}
                  onChange={(e) => setValues((v) => ({ ...v, safeguardingContext: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                >
                  <option value="">Prefer not to say</option>
                  <option value="none">No immediate concerns</option>
                  <option value="some">Yes - there are some concerns</option>
                  <option value="urgent">Yes - urgent concerns</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-cams-slate">
                  This helps us prioritise your enquiry. You can share details later by phone.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor={field("message")}>
                  How can we help? <span className="text-cams-primary">*</span>
                </label>
                <textarea
                  id={field("message")}
                  name="message"
                  required
                  aria-required="true"
                  rows={4}
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  className="min-h-32 w-full rounded-xl border border-slate-300/90 bg-white px-4 py-3 text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20"
                  placeholder="A short note is enough (2-3 lines). Example: 'My son is struggling in school and needs mentoring support.'"
                />
                <p className="mt-2 text-xs leading-5 text-cams-slate">No need to write full background at this stage.</p>
              </div>
              <Button type="submit" className="w-full py-3 shadow-lg shadow-cams-primary/20 transition hover:shadow-xl">
                {loading ? "Submitting..." : "Submit Enquiry"}
              </Button>
              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error.message}
                </p>
              ) : null}
            </form>
          )}
        </section>

        <div className="space-y-6">
          <div className="grid gap-4">
            {CONTACT_CHANNELS.map((card) => (
              <article
                key={card.title}
                className={`${PAGE_SURFACES.cardHoverLift} bg-gradient-to-br from-white to-slate-50/70 p-6`}
              >
                <div className="inline-flex rounded-xl border border-cams-primary/20 bg-cams-primary/[0.08] p-2.5">
                  <CamsIcon name={card.icon} size={28} />
                </div>
                <h3 className="mt-3 text-xl font-bold text-cams-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-cams-ink-secondary">{card.text}</p>
                <p className="mt-1 text-xs leading-6 text-cams-slate">{card.detail}</p>
              </article>
            ))}
          </div>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-cams-ink">Need a faster route?</h3>
            <p className="mt-2 text-sm leading-7 text-cams-ink-secondary">
              For immediate pathway decisions, these pages usually answer the next question fastest.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <Link href="/referral" className="block rounded-lg border border-slate-200 px-3 py-2 font-semibold text-cams-primary transition hover:border-cams-primary/40">
                View referral process
              </Link>
              <Link href="/packages" className="block rounded-lg border border-slate-200 px-3 py-2 font-semibold text-cams-primary transition hover:border-cams-primary/40">
                Compare support packages
              </Link>
              <Link href="/services" className="block rounded-lg border border-slate-200 px-3 py-2 font-semibold text-cams-primary transition hover:border-cams-primary/40">
                Explore service pathways
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className={`${PAGE_LAYOUT.panel} p-6 md:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">What happens next</p>
        <h2 className="font-heading text-3xl font-bold">
          Contact to <span className="text-cams-primary">action plan</span>
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {PROCESS_STEPS.map((step) => (
            <article key={step.title} className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
              <div className="inline-flex rounded-xl border border-cams-secondary/25 bg-cams-secondary/[0.09] p-2.5">
                <CamsIcon name={step.icon} size={28} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-cams-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-cams-ink-secondary">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${PAGE_LAYOUT.panel} p-6 md:p-8`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Location</p>
        <h2 className="font-heading text-3xl font-bold">
          Find <span className="text-cams-primary">Us</span>
        </h2>
        <p className="mt-2 text-sm text-cams-slate">
          Map shows London centre as a placeholder until your final venue is published.
        </p>
        <div className="mt-4 h-[320px] overflow-hidden rounded-xl border border-slate-200">
          <iframe
            title="CAMS London map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.1234567890123!2d-0.0127!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sLondon!5e0!3m2!1sen!2suk!4v1234567890"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section
        aria-labelledby="contact-quick-answers-heading"
        className={`relative overflow-hidden ${PAGE_LAYOUT.panelFrame} bg-gradient-to-b from-white to-slate-50/80 px-4 py-12 md:px-8 md:py-16`}
      >
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-cams-secondary/[0.08] blur-3xl"
          aria-hidden
        />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Common questions</p>
        <h2
          id="contact-quick-answers-heading"
          className="mt-3 text-center font-heading text-4xl font-bold"
        >
          Quick <span className="text-cams-primary">Answers</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-cams-ink-secondary">
          Shortcuts to the most common next steps: referrals, service fit, and careers.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {(
            [
              {
                icon: "circleHelp" as const,
                title: "How do I make a referral?",
                label: "View referral process",
                href: "/referral"
              },
              {
                icon: "activity" as const,
                title: "Which service is right for us?",
                label: "Explore services",
                href: "/services"
              },
              {
                icon: "briefcase" as const,
                title: "Are you hiring?",
                label: "View careers",
                href: "/careers"
              }
            ] satisfies ReadonlyArray<{
              icon: CamsIconName;
              title: string;
              label: string;
              href: string;
            }>
          ).map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-cams-primary/40 hover:shadow-lg"
            >
              <div className="flex justify-center">
                <div className="rounded-2xl border border-cams-secondary/25 bg-cams-secondary/[0.1] p-3 transition group-hover:scale-105">
                  <CamsIcon name={item.icon} size={32} />
                </div>
              </div>
              <h3 className="mt-3 text-lg font-bold text-cams-ink">{item.title}</h3>
              <a
                href={item.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cams-primary transition group-hover:gap-2 hover:text-cams-secondary"
              >
                {item.label} <span aria-hidden>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <PageCtaSection
        heading="Want us to review your situation first?"
        description="Share context through a referral and we will recommend the right package and pathway."
        actions={[
          { href: "/referral", label: "Make a Referral", variant: "primary" },
          { href: "/packages", label: "View Packages", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
