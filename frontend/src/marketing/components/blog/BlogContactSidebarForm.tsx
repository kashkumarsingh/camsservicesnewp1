'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useId, useState } from 'react';
import { Button } from '@/marketing/components/ui/button';
import { useContactForm } from '@/interfaces/web/hooks/contact/useContactForm';
import { thankYouPageUrl } from '@/shared/utils/thankYouPage';
import { ROUTES } from '@/shared/utils/routes';
import Link from 'next/link';
import { BLOG_SIDEBAR } from '@/marketing/constants/blogDetailPageConstants';

const inputClassName =
  'w-full rounded-xl border border-slate-300/90 bg-white px-3 py-2.5 text-sm text-cams-dark shadow-sm transition focus:border-cams-primary/60 focus:outline-none focus:ring-2 focus:ring-cams-primary/20';

type BlogContactSidebarFormProps = {
  articleTitle: string;
  articleSlug: string;
};

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

export function BlogContactSidebarForm({
  articleTitle,
  articleSlug,
}: BlogContactSidebarFormProps): ReactElement {
  const baseId = useId();
  const router = useRouter();
  const [values, setValues] = useState<FormState>(emptyForm);
  const { submit, loading, error } = useContactForm();

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
        inquiryType: 'general',
        inquiryDetails: `Blog article: ${articleTitle} (/blog/${articleSlug})`,
        urgency: 'exploring',
        preferredContact: values.phone.trim() ? 'phone' : 'email',
        message: values.message.trim() || undefined,
        newsletter: false,
        sourcePage: `/blog/${articleSlug}`,
      });
      router.push(thankYouPageUrl('contact'));
    } catch {
      // surfaced via useContactForm
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
        {BLOG_SIDEBAR.CONTACT_KICKER}
      </p>
      <h2 className="mt-2 text-lg font-bold text-cams-dark">{BLOG_SIDEBAR.CONTACT_TITLE}</h2>
      <p className="mt-2 text-sm leading-6 text-cams-slate">{BLOG_SIDEBAR.CONTACT_DESCRIPTION}</p>

      {error ? (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error.message}
        </p>
      ) : null}

      <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate={false}>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-cams-dark" htmlFor={field('fullName')}>
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
          <label className="mb-1.5 block text-xs font-semibold text-cams-dark" htmlFor={field('email')}>
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
          <label className="mb-1.5 block text-xs font-semibold text-cams-dark" htmlFor={field('phone')}>
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
          <label className="mb-1.5 block text-xs font-semibold text-cams-dark" htmlFor={field('message')}>
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
            placeholder="How can we help?"
          />
        </div>

        <Button type="submit" className="w-full justify-center py-2.5 text-sm" disabled={loading}>
          {loading ? 'Sending…' : BLOG_SIDEBAR.CONTACT_SUBMIT}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-cams-slate">
        Prefer the full form?{' '}
        <Link href={ROUTES.CONTACT} className="font-semibold text-cams-primary underline underline-offset-2">
          Contact page
        </Link>
      </p>
    </div>
  );
}
