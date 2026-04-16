'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { validateEmail } from '@/shared/utils/validation';
import { getPostAuthRedirect } from '@/shared/utils/navigation';
import { ROUTES } from '@/shared/utils/routes';
import { LoginFormSection } from '@/components/login';
import type { LoginFormData } from '@/components/login';
import { LOGIN_VALIDATION_FALLBACKS } from '@/components/login/constants';

const INITIAL_FORM_DATA: LoginFormData = {
  email: '',
  password: '',
  rememberMe: true,
};

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error: authError, isAuthenticated, user } = useAuth();

  const redirectParam = searchParams.get('redirect');
  const redirect = getPostAuthRedirect(user ?? null, redirectParam);

  const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      const targetRedirect = getPostAuthRedirect(user, redirectParam);
      router.push(targetRedirect);
    }
  }, [isAuthenticated, loading, user, router, redirectParam]);

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.email || formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error ?? LOGIN_VALIDATION_FALLBACKS.EMAIL;
        newIsValid.email = false;
      } else {
        newIsValid.email = true;
      }
    }

    if (touched.password || formData.password) {
      if (formData.password.length === 0) {
        newErrors.password = LOGIN_VALIDATION_FALLBACKS.PASSWORD_REQUIRED;
        newIsValid.password = false;
      } else {
        newIsValid.password = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid || !formData.password) {
      setErrors({
        email: emailValidation.error ?? '',
        password: !formData.password ? LOGIN_VALIDATION_FALLBACKS.PASSWORD_REQUIRED : '',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(
        {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        redirectParam ?? undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cams-soft">
      <section className="relative overflow-hidden border-b border-cams-primary/10 bg-gradient-to-br from-cams-dark via-cams-primary/80 to-cams-secondary/70 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="absolute inset-0 opacity-15" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cams-accent/90">
            Welcome back
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your CAMS account
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-cams-ink-onHero/95 sm:text-base">
            Access your dashboard, bookings, and messages securely.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto w-full max-w-md animate-fade-in-up rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-6">
          <LoginFormSection
            formData={formData}
            errors={errors}
            touched={touched}
            isValid={isValid}
            isSubmitting={isSubmitting}
            loading={loading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSubmit={handleSubmit}
            authError={authError}
            registerHref={ROUTES.REGISTER}
            forgotPasswordHref={ROUTES.FORGOT_PASSWORD}
          />
        </div>
      </section>
    </div>
  );
}
