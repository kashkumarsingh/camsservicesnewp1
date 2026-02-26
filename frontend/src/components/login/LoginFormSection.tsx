'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { LOGIN_FORM } from './constants';
import type { LoginFormSectionProps } from './loginFormTypes';

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

export default function LoginFormSection({
  formData,
  errors,
  touched,
  isValid,
  isSubmitting,
  loading,
  showPassword,
  setShowPassword,
  handleChange,
  handleBlur,
  handleSubmit,
  authError,
  registerHref,
}: LoginFormSectionProps) {
  const disabled = isSubmitting || loading;

  return (
    <div className="w-full">
      <div className="rounded-form-card border border-slate-100 bg-white p-8 shadow-card transition-shadow duration-300 ease-out hover:shadow-card-hover">
        <h1 className="font-heading text-2xl font-bold text-navy-blue">
          {LOGIN_FORM.PAGE_TITLE}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{LOGIN_FORM.SUBTITLE}</p>

        <div className="mt-8">
        {authError && (
          <div className="mb-6 rounded-form-alert border-2 border-red-200 bg-red-50 p-4 transition-opacity duration-200">
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} aria-hidden />
              {authError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {LOGIN_FORM.LABEL_EMAIL}
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder={LOGIN_FORM.PLACEHOLDER_EMAIL}
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

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
            >
              {LOGIN_FORM.LABEL_PASSWORD}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder={LOGIN_FORM.PLACEHOLDER_PASSWORD}
                className={`block w-full rounded-form-input border-2 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 ease-out placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${touched.password && (errors.password || isValid.password) ? 'pr-20' : 'pr-12'} ${inputBorderClass(touched.password, errors.password, isValid.password)}`}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 transition-colors hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? LOGIN_FORM.HIDE_PASSWORD : LOGIN_FORM.SHOW_PASSWORD}
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
                <span>{LOGIN_FORM.SENDING}</span>
              </>
            ) : (
              LOGIN_FORM.SUBMIT
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          {LOGIN_FORM.NO_ACCOUNT}{' '}
          <Link
            href={registerHref}
            className="font-medium text-primary-blue underline-offset-2 hover:underline"
          >
            {LOGIN_FORM.REQUEST_ACCESS}
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
