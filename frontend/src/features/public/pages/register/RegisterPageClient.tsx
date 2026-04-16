'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { getPostAuthRedirect } from '@/shared/utils/navigation';
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validateAddress,
  validatePostcode,
  validatePassword,
} from '@/shared/utils/validation';
import { ROUTES } from '@/shared/utils/routes';
import { RegisterFormSection } from '@/components/register';
import type { RegisterFormData } from '@/components/register';
import { REGISTER_VALIDATION_FALLBACKS } from '@/components/register/constants';
import MarketingButton from '@/design-system/components/Button/MarketingButton';
import { AlertCircle } from 'lucide-react';

const INITIAL_FORM_DATA: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  address: '',
  postcode: '',
  city: '',
  region: '',
};

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { register, loading, error: authError, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  /** After parent registration: no token until approved; show this instead of form. */
  const [showPendingApproval, setShowPendingApproval] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      router.push(getPostAuthRedirect(user, redirectParam));
    }
  }, [isAuthenticated, loading, user, router, redirectParam]);

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.name || formData.name) {
      const nameValidation = validateFullName(formData.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error ?? REGISTER_VALIDATION_FALLBACKS.NAME;
        newIsValid.name = false;
      } else {
        newIsValid.name = true;
      }
    }

    if (touched.email || formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error ?? REGISTER_VALIDATION_FALLBACKS.EMAIL;
        newIsValid.email = false;
      } else {
        newIsValid.email = true;
      }
    }

    if (touched.phone || formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error ?? REGISTER_VALIDATION_FALLBACKS.PHONE;
        newIsValid.phone = false;
      } else {
        newIsValid.phone = true;
      }
    }

    if (touched.address || formData.address) {
      const addressValidation = validateAddress(formData.address);
      if (!addressValidation.valid) {
        newErrors.address = addressValidation.error ?? REGISTER_VALIDATION_FALLBACKS.ADDRESS;
        newIsValid.address = false;
      } else {
        newIsValid.address = true;
      }
    }

    if (touched.postcode || formData.postcode) {
      const postcodeValidation = validatePostcode(formData.postcode);
      if (!postcodeValidation.valid) {
        newErrors.postcode =
          postcodeValidation.error ?? REGISTER_VALIDATION_FALLBACKS.POSTCODE;
        newIsValid.postcode = false;
      } else {
        newIsValid.postcode = true;
      }
    }

    if (touched.password || formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password =
          passwordValidation.error ?? REGISTER_VALIDATION_FALLBACKS.PASSWORD;
        newIsValid.password = false;
      } else {
        newIsValid.password = true;
      }
    }

    if (touched.password_confirmation || formData.password_confirmation) {
      if (formData.password_confirmation !== formData.password) {
        newErrors.password_confirmation = REGISTER_VALIDATION_FALLBACKS.PASSWORD_MISMATCH;
        newIsValid.password_confirmation = false;
      } else if (formData.password_confirmation) {
        newIsValid.password_confirmation = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, postcode: value }));
    if (!touched.postcode) {
      setTouched((prev) => ({ ...prev, postcode: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      password_confirmation: true,
      phone: true,
      address: true,
      postcode: true,
    });

    const nameValidation = validateFullName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const addressValidation = validateAddress(formData.address);
    const postcodeValidation = validatePostcode(formData.postcode);
    const passwordValidation = validatePassword(formData.password);

    if (
      !nameValidation.valid ||
      !emailValidation.valid ||
      !phoneValidation.valid ||
      !addressValidation.valid ||
      !postcodeValidation.valid ||
      !passwordValidation.valid ||
      formData.password !== formData.password_confirmation
    ) {
      setErrors({
        name: nameValidation.error ?? '',
        email: emailValidation.error ?? '',
        phone: phoneValidation.error ?? '',
        address: addressValidation.error ?? '',
        postcode: postcodeValidation.error ?? '',
        password: passwordValidation.error ?? '',
        password_confirmation:
          formData.password !== formData.password_confirmation
            ? REGISTER_VALIDATION_FALLBACKS.PASSWORD_MISMATCH
            : '',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const authData = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        address: formData.address,
        postcode: formData.postcode.toUpperCase(),
        city: formData.city || undefined,
        region: formData.region || undefined,
      });
      // Parent registration returns no token until approved; show pending message (no redirect, no sign out)
      if (authData && !authData.accessToken && authData.user?.approvalStatus === 'pending') {
        setShowPendingApproval(true);
      }
    } catch (err: unknown) {
      const errorData =
        (err as { response?: { data?: unknown }; data?: unknown; message?: string }).response
          ?.data ??
        (err as { data?: unknown }).data ??
        {};
      const apiErrors = (errorData as { errors?: Record<string, string | string[]> }).errors ?? {};

      if (Object.keys(apiErrors).length > 0) {
        const newErrors: Record<string, string> = {};
        Object.keys(apiErrors).forEach((field) => {
          const fieldErrors = apiErrors[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            newErrors[field] = fieldErrors[0];
          } else if (typeof fieldErrors === 'string') {
            newErrors[field] = fieldErrors;
          }
        });
        setErrors(newErrors);
      } else if ((errorData as { message?: string }).message) {
        setErrors({
          _general:
            (errorData as { message: string }).message ??
            REGISTER_VALIDATION_FALLBACKS.REGISTRATION_FAILED,
        });
      } else {
        setErrors({
          _general:
            (err as { message?: string }).message ??
            REGISTER_VALIDATION_FALLBACKS.REGISTRATION_FAILED_LATER,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPendingApproval) {
    return (
      <div className="bg-cams-soft px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-500" aria-hidden />
          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            Account Pending Approval
          </h1>
          <p className="mb-6 text-sm text-slate-600">
            Your registration is pending admin approval. You&apos;ll be notified once approved. You can sign in only after your account is approved.
          </p>
          <MarketingButton onClick={() => router.push(ROUTES.HOME)} className="w-full rounded-full bg-gcal-primary px-6 py-2 text-sm font-medium text-white hover:bg-gcal-primary-hover sm:w-auto">
            Go to Homepage
          </MarketingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cams-soft">
      <section className="relative overflow-hidden border-b border-cams-primary/10 bg-gradient-to-br from-cams-dark via-cams-primary/80 to-cams-secondary/70 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cams-accent/90">
            Get started
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Create your CAMS account
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-cams-ink-onHero/95 sm:text-base">
            Register to request support, track activity, and access personalised services.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto w-full max-w-lg animate-fade-in-up rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-6">
          <RegisterFormSection
            formData={formData}
            errors={errors}
            touched={touched}
            isValid={isValid}
            isSubmitting={isSubmitting}
            loading={loading}
            showPassword={showPassword}
            showPasswordConfirmation={showPasswordConfirmation}
            setShowPassword={setShowPassword}
            setShowPasswordConfirmation={setShowPasswordConfirmation}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handlePostcodeChange={handlePostcodeChange}
            handleSubmit={handleSubmit}
            authError={authError}
            signInHref={ROUTES.LOGIN}
          />
        </div>
      </section>
    </div>
  );
}
