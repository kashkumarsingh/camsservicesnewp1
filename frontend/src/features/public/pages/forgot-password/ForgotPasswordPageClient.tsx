'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import MarketingButton from '@/design-system/components/Button/MarketingButton';
import { authRepository } from '@/infrastructure/http/auth/AuthRepository';
import { ROUTES } from '@/shared/utils/routes';
import { validateEmail } from '@/shared/utils/validation';
import {
  FORGOT_PASSWORD_FORM,
  PASSWORD_RESET_VALIDATION_FALLBACKS,
} from '@/shared/utils/passwordResetConstants';

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailValidation = validateEmail(email);
  const showEmailError = touched && !emailValidation.valid;

  const handleBlur = () => setTouched(true);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!touched) setTouched(true);
    const v = validateEmail(e.target.value);
    setEmailValid(v.valid);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!emailValidation.valid) {
      setError(emailValidation.error ?? PASSWORD_RESET_VALIDATION_FALLBACKS.EMAIL_INVALID);
      return;
    }

    setIsSubmitting(true);
    try {
      await authRepository.requestForgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8 transition-colors duration-300">
        <div className="mx-auto w-full max-w-md animate-fade-in-up">
          <div className="rounded-form-card border border-slate-100 bg-white p-8 shadow-card">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-8 w-8 shrink-0" aria-hidden />
              <h1 className="font-heading text-xl font-bold text-navy-blue">
                Check your email
              </h1>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {FORGOT_PASSWORD_FORM.SUCCESS_MESSAGE}
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="mt-6 inline-block font-medium text-primary-blue underline-offset-2 hover:underline"
            >
              {FORGOT_PASSWORD_FORM.BACK_TO_LOGIN}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8 transition-colors duration-300">
      <div className="mx-auto w-full max-w-md animate-fade-in-up">
        <div className="rounded-form-card border border-slate-100 bg-white p-8 shadow-card transition-shadow duration-300 ease-out hover:shadow-card-hover">
          <h1 className="font-heading text-2xl font-bold text-navy-blue">
            {FORGOT_PASSWORD_FORM.PAGE_TITLE}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {FORGOT_PASSWORD_FORM.SUBTITLE}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-form-alert border-2 border-red-200 bg-red-50 p-4">
                <p className="flex items-start gap-2 text-sm text-red-600">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <span>
                    {error === FORGOT_PASSWORD_FORM.EMAIL_NOT_REGISTERED ? (
                      <>
                        {FORGOT_PASSWORD_FORM.EMAIL_NOT_REGISTERED_PREFIX}
                        <Link
                          href={ROUTES.REGISTER}
                          className="font-medium text-primary-blue underline-offset-2 hover:underline"
                        >
                          {FORGOT_PASSWORD_FORM.EMAIL_NOT_REGISTERED_LINK}
                        </Link>
                        {FORGOT_PASSWORD_FORM.EMAIL_NOT_REGISTERED_SUFFIX}
                      </>
                    ) : (
                      error
                    )}
                  </span>
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                {FORGOT_PASSWORD_FORM.LABEL_EMAIL}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                placeholder={FORGOT_PASSWORD_FORM.PLACEHOLDER_EMAIL}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  showEmailError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : emailValid
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                      : 'border-gray-300 focus:border-primary-blue focus:ring-primary-blue'
                }`}
              />
              {showEmailError && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle size={14} aria-hidden />
                  {emailValidation.error ?? PASSWORD_RESET_VALIDATION_FALLBACKS.EMAIL_INVALID}
                </p>
              )}
            </div>

            <MarketingButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              ariaBusy={isSubmitting}
              className="w-full rounded-full text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                  <span>{FORGOT_PASSWORD_FORM.SENDING}</span>
                </>
              ) : (
                FORGOT_PASSWORD_FORM.SUBMIT
              )}
            </MarketingButton>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-primary-blue underline-offset-2 hover:underline"
            >
              {FORGOT_PASSWORD_FORM.BACK_TO_LOGIN}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
