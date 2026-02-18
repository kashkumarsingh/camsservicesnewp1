'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { validateEmail } from '@/utils/validation';
import { getPostAuthRedirect } from '@/utils/navigation';
import { AlertCircle, CheckCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error: authError, isAuthenticated, user } = useAuth();
  
  // Get redirect route using centralized utility
  const redirectParam = searchParams.get('redirect');
  const redirect = getPostAuthRedirect(user, redirectParam);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Default to false - password hidden by default

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      // Use centralized redirect utility
      const targetRedirect = getPostAuthRedirect(user, redirectParam);
      router.push(targetRedirect);
    }
  }, [isAuthenticated, loading, user, router, redirectParam]);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.email || formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Please enter a valid email address';
        newIsValid.email = false;
      } else {
        newIsValid.email = true;
      }
    }

    if (touched.password || formData.password) {
      if (formData.password.length === 0) {
        newErrors.password = 'Password is required';
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ email: true, password: true });

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid || !formData.password) {
      setErrors({
        email: emailValidation.error || '',
        password: !formData.password ? 'Password is required' : '',
      });
      return;
    }

    // Set submitting state immediately for visual feedback
    setIsSubmitting(true);
    
    try {
      // Pass redirect parameter to login function so it's used after successful authentication
      await login(
        {
          email: formData.email,
          password: formData.password,
        },
        redirectParam // Pass the redirect parameter from URL
      );
    } catch (err: any) {
      // Error handled by useAuth hook - only log if it's not already handled
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        console.error('Login error:', {
          message: err?.message || 'Login failed',
          status: err?.response?.status,
          data: err?.response?.data,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-start">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Sign in to CAMS
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Secure access for parents, trainers and commissioning partners. Use your work or registered email address.
          </p>

          <div className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-slate-500" />
              <p>
                <span className="font-semibold">Parents & carers:</span> use the email you registered with when
                purchasing a package or booking sessions.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-slate-500" />
              <p>
                <span className="font-semibold">Local authorities & schools:</span> sign in with the account set up by
                our team. Contact us if you need your access resetting.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Account credentials</h2>
              <p className="mt-1 text-xs text-slate-500">All fields are required.</p>
            </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {authError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700">
                Email Address *
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
                  placeholder="name@organisation.co.uk"
                  className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.email
                      ? errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.email
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                {touched.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.email ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isValid.email ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Password *
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
                  placeholder="Enter your password"
                  className={`block w-full px-4 py-3 ${touched.password && (errors.password || isValid.password) ? 'pr-20' : 'pr-12'} text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.password
                      ? errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.password
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {/* Password visibility toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {/* Validation icon */}
                  {touched.password && (
                    <>
                      {errors.password ? (
                        <AlertCircle className="text-red-500" size={20} />
                      ) : isValid.password ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || loading}
              aria-busy={isSubmitting || loading}
              className="w-full py-3 text-sm font-semibold"
            >
              {isSubmitting || loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-slate-900 underline-offset-2 hover:underline">
                Request access
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

