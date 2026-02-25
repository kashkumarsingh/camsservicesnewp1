'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { validateEmail } from '@/utils/validation';
import { getPostAuthRedirect } from '@/utils/navigation';
import { ROUTES } from '@/utils/routes';
import { LoginFormSection } from '@/components/login';
import type { LoginFormData } from '@/components/login';
import { LOGIN_VALIDATION_FALLBACKS } from '@/components/login/constants';

const INITIAL_FORM_DATA: LoginFormData = {
  email: '',
  password: '',
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        { email: formData.email, password: formData.password },
        redirectParam ?? undefined
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8">
      <div className="mx-auto w-full max-w-md">
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
        />
      </div>
    </div>
  );
}
