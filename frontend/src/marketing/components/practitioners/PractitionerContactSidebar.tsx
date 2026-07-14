'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useId, useState } from 'react';
import { Button } from '@/marketing/components/ui/button';
import { CamsIcon } from '@/marketing/components/shared/CamsIcon';
import { PAGE_LAYOUT, PAGE_SURFACES } from '@/marketing/components/shared/page-layout';
import { PRACTITIONER_PAGE } from '@/app/(public)/constants/practitionerPageConstants';
import { BUSINESS_HOURS, contactData } from '@/data/contactData';
import type { PractitionerProfile } from '@/marketing/content/practitioners/types';
import { useContactForm } from '@/interfaces/web/hooks/contact/useContactForm';
import { thankYouPageUrl } from '@/shared/utils/thankYouPage';
import { ROUTES } from '@/shared/utils/routes';

const inputClassName =
  'w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2.5 text-sm text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20';

const CONTACT_PHONE_HREF = `tel:${contactData.phone.replace(/\s/g, '')}`;
const WHATSAPP_HREF = `${contactData.whatsapp}?text=${encodeURIComponent(PRACTITIONER_PAGE.WHATSAPP_MESSAGE)}`;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

const emptyForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
};

type PractitionerContactSidebarProps = {
  profile: PractitionerProfile;
};

export function PractitionerContactSidebar({ profile }: PractitionerContactSidebarProps): ReactElement {
  const baseId = useId();
  const router = useRouter();
  const [values, setValues] = useState<FormState>(emptyForm);
  const { submit, loading, error } = useContactForm();
  const profilePath = ROUTES.PRACTITIONER_BY_SLUG(profile.slug);

  const field = (name: keyof FormState): string => `${baseId}-${name}`;

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
        inquiryType: 'service',
        inquiryDetails: `Practitioner enquiry: ${profile.name} (${profilePath})`,
        urgency: 'exploring',
        preferredContact: values.phone.trim() ? 'phone' : 'email',
        message: values.message.trim() || undefined,
        newsletter: false,
        sourcePage: profilePath,
      });
      router.push(thankYouPageUrl('contact'));
    } catch {
      // surfaced via useContactForm
    }
  }

  return (
    <div className="space-y-5">
      <section className={`${PAGE_LAYOUT.panel} p-5 sm:p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cams-primary">Contact CAMS</p>
        <h2 className="mt-2 text-xl font-bold text-cams-ink">Book {profile.name}</h2>
        <p className="mt-2 text-sm leading-6 text-cams-ink-secondary">
          All enquiries go through CAMS Services Ltd. Call, WhatsApp or send a message. We respond within one working
          day.
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

          <div className="flex flex-col gap-2">
            <Button href={WHATSAPP_HREF} variant="primary" type="button" className="w-full">
              WhatsApp CAMS Services
            </Button>
            <Button href={CONTACT_PHONE_HREF} variant="secondary" type="button" className="w-full">
              Call now
            </Button>
          </div>
        </div>
      </section>

      <section className={`${PAGE_SURFACES.cardHoverLift} rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6`}>
        <h3 className="text-lg font-bold text-cams-ink">Quick enquiry</h3>
        <p className="mt-1 text-sm text-cams-slate">Ask about booking {profile.name}.</p>

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error.message}
          </p>
        ) : null}

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field('fullName')}>
              Full name <span className="text-cams-primary">*</span>
            </label>
            <input
              id={field('fullName')}
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
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field('email')}>
              Email <span className="text-cams-primary">*</span>
            </label>
            <input
              id={field('email')}
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
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field('phone')}>
              Phone <span className="font-normal text-cams-slate">(optional)</span>
            </label>
            <input
              id={field('phone')}
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
            <label className="mb-1.5 block text-xs font-semibold text-cams-ink" htmlFor={field('message')}>
              Message <span className="text-cams-primary">*</span>
            </label>
            <textarea
              id={field('message')}
              name="message"
              required
              rows={4}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              className={`${inputClassName} min-h-[100px] resize-y`}
              placeholder={`e.g. I'd like to book ${profile.name} for mentoring in Ealing`}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send enquiry'}
          </Button>
        </form>
      </section>

      <section className={`${PAGE_LAYOUT.panel} p-5 sm:p-6`}>
        <h3 className="text-sm font-bold text-cams-ink">Referrals and packs</h3>
        <div className="mt-4 flex flex-col gap-2">
          <Button href={ROUTES.REFERRAL} variant="secondary" className="w-full">
            Make a referral
          </Button>
          <Button href={ROUTES.CONTACT} variant="secondary" className="w-full">
            Contact CAMS Services
          </Button>
          <a
            href={PRACTITIONER_PAGE.INFORMATION_PACK_PDF_PATH}
            download={PRACTITIONER_PAGE.INFORMATION_PACK_FILENAME}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-cams-primary px-4 py-2 text-center text-sm font-semibold text-cams-primary transition hover:bg-cams-primary/10"
          >
            Download information pack
          </a>
        </div>
      </section>
    </div>
  );
}
