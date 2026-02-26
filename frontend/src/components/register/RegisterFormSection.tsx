'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { REGISTER_FORM, REGISTER_VALIDATION_FALLBACKS } from './constants';
import type { RegisterFormSectionProps } from './registerFormTypes';

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

export default function RegisterFormSection({
  formData,
  errors,
  touched,
  isValid,
  isSubmitting,
  loading,
  showPassword,
  showPasswordConfirmation,
  setShowPassword,
  setShowPasswordConfirmation,
  handleChange,
  handleBlur,
  handlePostcodeChange,
  handleSubmit,
  authError,
  signInHref,
}: RegisterFormSectionProps) {
  const generalError = errors._general ?? authError ?? null;
  const displayError = generalError ?? REGISTER_VALIDATION_FALLBACKS.REGISTRATION_FAILED;
  const disabled = isSubmitting || loading;

  return (
    <div className="w-full">
      <div className="rounded-form-card border border-slate-100 bg-white p-8 shadow-card transition-shadow duration-300 ease-out hover:shadow-card-hover">
        <h1 className="font-heading text-2xl font-bold text-navy-blue">
          {REGISTER_FORM.PAGE_TITLE}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{REGISTER_FORM.SUBTITLE}</p>

        <div className="mt-8">
        {generalError !== null && (
          <div className="mb-6 rounded-form-alert border-2 border-red-200 bg-red-50 p-4 transition-opacity duration-200">
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} aria-hidden />
              {displayError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_NAME}
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                id="name"
                required
                minLength={2}
                maxLength={200}
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder={REGISTER_FORM.PLACEHOLDER_NAME}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touched.name, errors.name, isValid.name)}`}
              />
              {touched.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.name ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.name ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null}
                </div>
              )}
            </div>
            {touched.name && errors.name && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_EMAIL}
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder={REGISTER_FORM.PLACEHOLDER_EMAIL}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touched.email, errors.email, isValid.email)}`}
              />
              {touched.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.email ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.email ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null}
                </div>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_PHONE}
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder={REGISTER_FORM.PLACEHOLDER_PHONE}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touched.phone, errors.phone, isValid.phone)}`}
              />
              {touched.phone && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.phone ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.phone ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null}
                </div>
              )}
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_ADDRESS}
            </label>
            <div className="relative">
              <input
                type="text"
                name="address"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur('address')}
                placeholder={REGISTER_FORM.PLACEHOLDER_ADDRESS}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touched.address, errors.address, isValid.address)}`}
              />
              {touched.address && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.address ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.address ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null}
                </div>
              )}
            </div>
            {touched.address && errors.address && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.address}
              </p>
            )}
          </div>

          {/* Postcode */}
          <div>
            <label
              htmlFor="postcode"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_POSTCODE}
            </label>
            <div className="relative">
              <input
                type="text"
                name="postcode"
                id="postcode"
                required
                value={formData.postcode}
                onChange={handlePostcodeChange}
                onBlur={() => handleBlur('postcode')}
                placeholder={REGISTER_FORM.PLACEHOLDER_POSTCODE}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${inputBorderClass(touched.postcode, errors.postcode, isValid.postcode)}`}
              />
              {touched.postcode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.postcode ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.postcode ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null}
                </div>
              )}
            </div>
            {touched.postcode && errors.postcode && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.postcode}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_PASSWORD}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                required
                minLength={8}
                autoComplete="new-password"
                title="Password must be at least 8 characters and contain at least one number, one letter, and one special character"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder={REGISTER_FORM.PLACEHOLDER_PASSWORD}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${touched.password && (errors.password || isValid.password) ? 'pr-20' : 'pr-12'} ${inputBorderClass(touched.password, errors.password, isValid.password)}`}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? REGISTER_FORM.HIDE_PASSWORD : REGISTER_FORM.SHOW_PASSWORD}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {touched.password &&
                  (errors.password ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.password ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null)}
              </div>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {REGISTER_FORM.LABEL_PASSWORD_CONFIRM}
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirmation ? 'text' : 'password'}
                name="password_confirmation"
                id="password_confirmation"
                required
                minLength={8}
                autoComplete="new-password"
                value={formData.password_confirmation}
                onChange={handleChange}
                onBlur={() => handleBlur('password_confirmation')}
                placeholder={REGISTER_FORM.PLACEHOLDER_PASSWORD_CONFIRM}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${touched.password_confirmation && (errors.password_confirmation || isValid.password_confirmation) ? 'pr-20' : 'pr-12'} ${inputBorderClass(touched.password_confirmation, errors.password_confirmation, isValid.password_confirmation)}`}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showPasswordConfirmation ? REGISTER_FORM.HIDE_PASSWORD : REGISTER_FORM.SHOW_PASSWORD
                  }
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {touched.password_confirmation &&
                  (errors.password_confirmation ? (
                    <AlertCircle className="text-red-500" size={20} aria-hidden />
                  ) : isValid.password_confirmation ? (
                    <CheckCircle className="text-green-500" size={20} aria-hidden />
                  ) : null)}
              </div>
            </div>
            {touched.password_confirmation && errors.password_confirmation && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} aria-hidden />
                {errors.password_confirmation}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={disabled}
            ariaBusy={disabled}
            className="w-full rounded-full text-lg"
          >
            {disabled ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                <span>{REGISTER_FORM.SENDING}</span>
              </>
            ) : (
              REGISTER_FORM.SUBMIT
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {REGISTER_FORM.ALREADY_ACCOUNT}{' '}
          <Link
            href={signInHref}
            className="font-medium text-primary-blue underline-offset-2 hover:underline"
          >
            {REGISTER_FORM.SIGN_IN}
          </Link>
        </p>
        <div className="mt-6 rounded-form-alert border border-primary-blue/20 bg-primary-blue/10 p-4 transition-opacity duration-200">
          <p className="text-sm text-slate-700">{REGISTER_FORM.POST_SUBMIT_NOTE}</p>
        </div>
        </div>
      </div>
    </div>
  );
}
