'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { validateFullName, validateEmail, validatePhone, validateAddress, validatePostcode, validatePassword } from '@/utils/validation';
import { AlertCircle, CheckCircle, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterPageClient() {
  const router = useRouter();
  const { register, loading, error: authError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    postcode: '',
    city: '',
    region: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.name || formData.name) {
      const nameValidation = validateFullName(formData.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error || 'Please enter both first and last name';
        newIsValid.name = false;
      } else {
        newIsValid.name = true;
      }
    }

    if (touched.email || formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Please enter a valid email address';
        newIsValid.email = false;
      } else {
        newIsValid.email = true;
      }
    }

    if (touched.phone || formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Please enter a valid UK phone number';
        newIsValid.phone = false;
      } else {
        newIsValid.phone = true;
      }
    }

    if (touched.address || formData.address) {
      const addressValidation = validateAddress(formData.address);
      if (!addressValidation.valid) {
        newErrors.address = addressValidation.error || 'Address must start with a door number';
        newIsValid.address = false;
      } else {
        newIsValid.address = true;
      }
    }

    if (touched.postcode || formData.postcode) {
      const postcodeValidation = validatePostcode(formData.postcode);
      if (!postcodeValidation.valid) {
        newErrors.postcode = postcodeValidation.error || 'Please enter a valid UK postal code';
        newIsValid.postcode = false;
      } else {
        newIsValid.postcode = true;
      }
    }

    if (touched.password || formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error || 'Password is invalid';
        newIsValid.password = false;
      } else {
        newIsValid.password = true;
      }
    }

    if (touched.password_confirmation || formData.password_confirmation) {
      if (formData.password_confirmation !== formData.password) {
        newErrors.password_confirmation = 'Passwords do not match';
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
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      password_confirmation: true,
      phone: true,
      address: true,
      postcode: true,
    });

    // Validate all fields
    const nameValidation = validateFullName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const addressValidation = validateAddress(formData.address);
    const postcodeValidation = validatePostcode(formData.postcode);
    const passwordValidation = validatePassword(formData.password);

    if (!nameValidation.valid || !emailValidation.valid || !phoneValidation.valid || 
        !addressValidation.valid || !postcodeValidation.valid || 
        !passwordValidation.valid || formData.password !== formData.password_confirmation) {
      setErrors({
        name: nameValidation.error || '',
        email: emailValidation.error || '',
        phone: phoneValidation.error || '',
        address: addressValidation.error || '',
        postcode: postcodeValidation.error || '',
        password: passwordValidation.error || '',
        password_confirmation: formData.password !== formData.password_confirmation ? 'Passwords do not match' : '',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
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
    } catch (err: any) {
      console.error('Registration error full details:', {
        error: err,
        response: err.response,
        data: err.response?.data,
        errors: err.response?.data?.errors,
        message: err.message,
      });
      
      // Extract validation errors from API response
      // Backend returns: { success: false, message: "...", errors: { field: ["error"] } }
      // ApiClient might unwrap or structure differently
      const errorData = err.response?.data || err.data || {};
      const apiErrors = errorData.errors || {};
      
      if (Object.keys(apiErrors).length > 0) {
        const newErrors: Record<string, string> = {};
        
        // Map API validation errors to form fields
        Object.keys(apiErrors).forEach((field) => {
          const fieldErrors = apiErrors[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            newErrors[field] = fieldErrors[0]; // Take first error message
          } else if (typeof fieldErrors === 'string') {
            newErrors[field] = fieldErrors;
          }
        });
        
        setErrors(newErrors);
        console.log('Validation errors extracted:', newErrors);
      } else if (errorData.message) {
        // Show general error message
        setErrors({ 
          _general: errorData.message || 'Registration failed. Please check your details and try again.' 
        });
      } else {
        setErrors({ 
          _general: err.message || 'Registration failed. Please try again later.' 
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
            Request access to CAMS
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Provide a few details so we can verify your identity, safeguarding requirements and the best way to support
            your family or organisation.
          </p>

          <div className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-slate-500" />
              <p>
                <span className="font-semibold">Parents & carers:</span> we may contact you to confirm details before
                activating your account.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-slate-500" />
              <p>
                <span className="font-semibold">Schools & local authorities:</span> please use an official work email
                address so we can confirm your role.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
              <p className="mt-1 text-xs text-slate-500">All fields marked * are required.</p>
            </div>

          {(authError || errors._general) && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors._general || authError || 'Registration failed. Please check your details and try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Full Name *
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
                  placeholder="John Smith"
                  className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.name
                      ? errors.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.name
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                {touched.name && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.name ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isValid.name ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Email Address *
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
                  placeholder="john@example.com"
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
                htmlFor="phone"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Phone Number *
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
                  placeholder="07123 456789 or 020 1234 5678"
                  className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.phone
                      ? errors.phone
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.phone
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                {touched.phone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.phone ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isValid.phone ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.phone && errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Address *
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
                  placeholder="e.g., 123 High Street, Town"
                  className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.address
                      ? errors.address
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.address
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                {touched.address && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.address ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isValid.address ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.address && errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="postcode"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Postal Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="postcode"
                  id="postcode"
                  required
                  value={formData.postcode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData(prev => ({ ...prev, postcode: value }));
                    if (!touched.postcode) {
                      setTouched(prev => ({ ...prev, postcode: true }));
                    }
                  }}
                  onBlur={() => handleBlur('postcode')}
                  placeholder="e.g., IG9 5BT"
                  className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.postcode
                      ? errors.postcode
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.postcode
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                {touched.postcode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.postcode ? (
                      <AlertCircle className="text-red-500" size={20} />
                    ) : isValid.postcode ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.postcode && errors.postcode && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.postcode}
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
                  minLength={8}
                  autoComplete="new-password"
                  title="Password must be at least 8 characters and contain at least one number, one letter, and one special character"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Min 8 chars, 1 number, 1 letter, 1 special"
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

            <div>
              <label
                htmlFor="password_confirmation"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-700"
              >
                Confirm Password *
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
                  placeholder="Re-enter your password"
                  className={`block w-full px-4 py-3 ${touched.password_confirmation && (errors.password_confirmation || isValid.password_confirmation) ? 'pr-20' : 'pr-12'} text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    touched.password_confirmation
                      ? errors.password_confirmation
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : isValid.password_confirmation
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                      : 'border-gray-300 focus:border-[#0080FF] focus:ring-[#0080FF]'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {/* Password visibility toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {/* Validation icon */}
                  {touched.password_confirmation && (
                    <>
                      {errors.password_confirmation ? (
                        <AlertCircle className="text-red-500" size={20} />
                      ) : isValid.password_confirmation ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
              {touched.password_confirmation && errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || loading}
              aria-busy={isSubmitting || loading}
              className="w-full py-3 text-sm font-semibold"
            >
              {isSubmitting || loading ? 'Submitting request…' : 'Submit request'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-slate-900 underline-offset-2 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-700">
              Once submitted, your request will be reviewed by our team. You will receive an email when your account is
              active and ready to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}


