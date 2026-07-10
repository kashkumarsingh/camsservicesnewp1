"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactElement } from "react";
import { useId, useState } from "react";
import { Button } from "@/marketing/components/ui/button";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { PAGE_LAYOUT, PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { BUSINESS_HOURS, contactData } from "@/data/contactData";
import type { LocationArea } from "@/marketing/content/locations";
import { useContactForm } from "@/interfaces/web/hooks/contact/useContactForm";
import { thankYouPageUrl } from "@/shared/utils/thankYouPage";
import { ROUTES } from "@/shared/utils/routes";

const inputClassName =
  "w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2.5 text-sm text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20";

const CONTACT_PHONE_HREF = `tel:${contactData.phone.replace(/\s/g, "")}`;
const CONTACT_EMAIL_MAILTO = `mailto:${contactData.email}`;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
};

type AreaContactSidebarProps = {
  area: LocationArea;
};

export function AreaContactSidebar({ area }: AreaContactSidebarProps): ReactElement {
  const baseId = useId();
  const router = useRouter();
  const [values, setValues] = useState<FormState>(emptyForm);
  const { submit, loading, error } = useContactForm();

  const field = (name: keyof FormState): string => `${baseId}-${name}`;
  const areaPath = ROUTES.AREA_BY_SLUG(area.slug);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      await submit({
        name: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        inquiryType: "service",
        inquiryDetails: `Service area: ${area.name} (${areaPath})`,
        urgency: "exploring",
        preferredContact: values.phone.trim() ? "phone" : "email",
        message: values.message.trim() || undefined,
        newsletter: false,
        sourcePage: areaPath,
      });
      router.push(thankYouPageUrl("contact"));
    } catch {
      // surfaced via useContactForm
    }
  }

  return (
    <div className="space-y-5">
      <section className={`${PAGE_LAYOUT.panel} p-5 sm:p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Get in touch</p>
        <h2 className="mt-2 text-xl font-bold text-cams-ink">Contact CAMS in {area.name}</h2>
        <p className="mt-2 text-sm leading-6 text-cams-ink-secondary">
          Call, WhatsApp or send a quick enquiry. We respond within one working day.
        </p>

        <div className="mt-5 space-y-4 border-t border-slate-200/90 pt-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cams-ink">
              <CamsIcon name="phone" size={20} />
              Phone
            </div>
            <a
              href={CONTACT_PHONE_HREF}
              className="mt-2 block text-xl font-bold text-cams-primary transition hover:text-cams-secondary"
            >
              {contactData.phone}
            </a>
            <p className="mt-1 text-xs text-cams-slate">{BUSINESS_HOURS.display}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              href={contactData.whatsapp}
              variant="secondary"
              type="button"
              className="w-full sm:w-auto"
            >
              WhatsApp us
            </Button>
            <Button href={CONTACT_EMAIL_MAILTO} variant="secondary" type="button" className="w-full sm:w-auto">
              Email us
            </Button>
          </div>
        </div>
      </section>

      <section className={`${PAGE_SURFACES.cardHoverLift} rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6`}>
        <h3 className="text-lg font-bold text-cams-ink">Quick enquiry</h3>
        <p className="mt-1 text-sm text-cams-slate">Ask about chaperone services in {area.name}.</p>

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error.message}
          </p>
        ) : null}

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field("fullName")}>
              Full name <span className="text-cams-primary">*</span>
            </label>
            <input
              id={field("fullName")}
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={values.fullName}
              onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
              className={inputClassName}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field("email")}>
              Email <span className="text-cams-primary">*</span>
            </label>
            <input
              id={field("email")}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              className={inputClassName}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field("phone")}>
              Phone <span className="font-normal text-cams-slate">(optional)</span>
            </label>
            <input
              id={field("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              className={inputClassName}
              placeholder="For a call back"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field("message")}>
              Message <span className="text-cams-primary">*</span>
            </label>
            <textarea
              id={field("message")}
              name="message"
              required
              rows={4}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              className={`${inputClassName} min-h-[100px] resize-y`}
              placeholder={`e.g. Chaperone services needed in ${area.keyAreas[0] ?? area.name}`}
            />
          </div>

          <Button type="submit" className="w-auto min-w-[10rem] px-6 py-2.5 text-sm" disabled={loading}>
            {loading ? "Sending…" : "Send enquiry"}
          </Button>
        </form>

        <p className="mt-3 text-xs leading-5 text-cams-slate">
          Need the full intake form?{" "}
          <a href={ROUTES.CONTACT} className="font-semibold text-cams-primary underline underline-offset-2">
            Contact page
          </a>{" "}
          or{" "}
          <a href={ROUTES.REFERRAL} className="font-semibold text-cams-primary underline underline-offset-2">
            make a referral
          </a>
          .
        </p>
      </section>
    </div>
  );
}
