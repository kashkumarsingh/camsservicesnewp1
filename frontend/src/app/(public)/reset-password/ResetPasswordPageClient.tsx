'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authRepository } from '@/infrastructure/http/auth/AuthRepository';
import { ROUTES } from '@/utils/routes';
import { validatePassword } from '@/utils/validation';
import {
  RESET_PASSWORD_FORM,
  PASSWORD_RESET_VALIDATION_FALLBACKS,
} from '@/utils/passwordResetConstants';

function inputBorderClass(
  touched: boolean,
  error: string | undefined,
  valid: boolean | undefined
): string {
  if (!touched) return 'border-gray-300 focus:border-primary-blue focus:ring-primary-blue';
  if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-200';
  if (valid) return 'border-green-500 focus:border-green-500 focus:ring-green-200';
  return 'border-gray-300 focus:border-primary-blue focus:ring-primary-blue';
}

export default function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const passwordMatch = password === passwordConfirmation && passwordConfirmation.length > 0;
  const showPasswordError = touchedPassword && !passwordValidation.valid;
  const showConfirmError = touchedConfirm && passwordConfirmation.length > 0 && !passwordMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPassword(true);
    setTouchedConfirm(true);
    setError(null);

    if (!passwordValidation.valid) {
      setError(passwordValidation.error ?? PASSWORD_RESET_VALIDATION_FALLBACKS.PASSWORD_INVALID);
      return;
    }
    if (password !== passwordConfirmation) {
      setError(PASSWORD_RESET_VALIDATION_FALLBACKS.PASSWORD_MISMATCH);
      return;
    }
    if (!token || !email) {
      setError(PASSWORD_RESET_VALIDATION_FALLBACKS.TOKEN_MISSING);
      return;
    }

    setIsSubmitting(true);
    try {
      await authRepository.resetPassword({
        token,
        email,
        password,
        passwordConfirmation,
      });
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
                Password reset
              </h1>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {RESET_PASSWORD_FORM.SUCCESS_MESSAGE}
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="mt-6 inline-block font-medium text-primary-blue underline-offset-2 hover:underline"
            >
              {RESET_PASSWORD_FORM.BACK_TO_LOGIN}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8 transition-colors duration-300">
        <div className="mx-auto w-full max-w-md animate-fade-in-up">
          <div className="rounded-form-card border border-slate-100 bg-white p-8 shadow-card">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="h-8 w-8 shrink-0" aria-hidden />
              <h1 className="font-heading text-xl font-bold text-navy-blue">
                Invalid reset link
              </h1>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {PASSWORD_RESET_VALIDATION_FALLBACKS.TOKEN_MISSING}
            </p>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="mt-6 inline-block font-medium text-primary-blue underline-offset-2 hover:underline"
            >
              Request a new reset link
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
            {RESET_PASSWORD_FORM.PAGE_TITLE}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {RESET_PASSWORD_FORM.SUBTITLE}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-form-alert border-2 border-red-200 bg-red-50 p-4">
                <p className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle size={16} aria-hidden />
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                {RESET_PASSWORD_FORM.LABEL_PASSWORD}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouchedPassword(true);
                    setError(null);
                  }}
                  onBlur={() => setTouchedPassword(true)}
                  placeholder={RESET_PASSWORD_FORM.PLACEHOLDER_PASSWORD}
                  className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touchedPassword, showPasswordError ? (passwordValidation.error ?? '') : undefined, touchedPassword && passwordValidation.valid)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? RESET_PASSWORD_FORM.HIDE_PASSWORD : RESET_PASSWORD_FORM.SHOW_PASSWORD}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {showPasswordError && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle size={14} aria-hidden />
                  {passwordValidation.error ?? PASSWORD_RESET_VALIDATION_FALLBACKS.PASSWORD_INVALID}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                {RESET_PASSWORD_FORM.LABEL_PASSWORD_CONFIRM}
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  required
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    setTouchedConfirm(true);
                    setError(null);
                  }}
                  onBlur={() => setTouchedConfirm(true)}
                  placeholder={RESET_PASSWORD_FORM.PLACEHOLDER_PASSWORD_CONFIRM}
                  className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touchedConfirm, showConfirmError ? PASSWORD_RESET_VALIDATION_FALLBACKS.PASSWORD_MISMATCH : undefined, touchedConfirm && passwordMatch)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
                  aria-label={showPasswordConfirmation ? RESET_PASSWORD_FORM.HIDE_PASSWORD : RESET_PASSWORD_FORM.SHOW_PASSWORD}
                >
                  {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {showConfirmError && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle size={14} aria-hidden />
                  {PASSWORD_RESET_VALIDATION_FALLBACKS.PASSWORD_MISMATCH}
                </p>
              )}
            </div>

            <Button
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
                  <span>{RESET_PASSWORD_FORM.SENDING}</span>
                </>
              ) : (
                RESET_PASSWORD_FORM.SUBMIT
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-primary-blue underline-offset-2 hover:underline"
            >
              {RESET_PASSWORD_FORM.BACK_TO_LOGIN}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
