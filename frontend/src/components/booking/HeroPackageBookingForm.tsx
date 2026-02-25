'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { Sparkles, Calendar, AlertCircle, CheckCircle2, CheckCircle } from 'lucide-react';
import { validateName, validateEmail, validatePhone } from '@/utils/validation';

interface HeroPackageBookingFormProps {
  packages: PackageDTO[];
}

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  packageSlug: '',
};

export default function HeroPackageBookingForm({ packages }: HeroPackageBookingFormProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    // First name validation
    if (touched.firstName || formData.firstName) {
      const nameValidation = validateName(formData.firstName);
      if (!nameValidation.valid) {
        newErrors.firstName = nameValidation.error || 'First name is required';
        newIsValid.firstName = false;
      } else {
        newIsValid.firstName = true;
      }
    }

    // Last name validation
    if (touched.lastName || formData.lastName) {
      const nameValidation = validateName(formData.lastName);
      if (!nameValidation.valid) {
        newErrors.lastName = nameValidation.error || 'Last name is required';
        newIsValid.lastName = false;
      } else {
        newIsValid.lastName = true;
      }
    }

    // Email validation
    if (touched.email || formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Please enter a valid email address';
        newIsValid.email = false;
      } else {
        newIsValid.email = true;
      }
    }

    // Phone validation
    if (touched.phone || formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Please enter a valid UK phone number';
        newIsValid.phone = false;
      } else {
        newIsValid.phone = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData.firstName, formData.lastName, formData.email, formData.phone, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      packageSlug: true,
    });

    // Validate all required fields
    const firstNameValidation = validateName(formData.firstName);
    const lastNameValidation = validateName(formData.lastName);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);

    if (!firstNameValidation.valid || !lastNameValidation.valid || !emailValidation.valid || !phoneValidation.valid || !formData.packageSlug) {
      setErrors({
        firstName: firstNameValidation.error || '',
        lastName: lastNameValidation.error || '',
        email: emailValidation.error || '',
        phone: phoneValidation.error || '',
        packageSlug: !formData.packageSlug ? 'Please select a package' : '',
      });
      setError('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Store parent details in sessionStorage for the booking flow
      // The booking flow will pick this up and pre-fill the form
      const reference = `hero_${Date.now()}`;
    const parentName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      const bookingData = {
        reference,
        parentDetails: {
          name: parentName,
          email: formData.email,
          phone: formData.phone,
          address: '',
          postcode: '',
          county: '',
        },
        childrenDetails: [
          {
            id: 1,
            name: '',
            age: '',
            medicalInfo: '',
          },
        ],
        packageSlug: formData.packageSlug,
        source: 'hero-form',
        timestamp: Date.now(),
      };

      // Store in sessionStorage (temporary, cleared on browser close)
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`cams_booking_${reference}`, JSON.stringify(bookingData));
      }

      // Redirect to booking flow with selected package and reference
      router.push(`/book/${formData.packageSlug}?ref=${reference}`);
    } catch (err) {
      console.error('Error starting booking:', err);
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/25 bg-gradient-to-b from-white/20 via-white/10 to-white/0 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="mb-4 flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
          <Calendar size={14} />
          Quick booking
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Start your package in 60 seconds</h3>
            <p className="text-xs text-white/70">We’ll grab the details about your child on the next step.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/70">
            <CheckCircle2 size={14} className="text-star-gold" />
            <span>Handpicked & DBS checked</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/15 bg-white/10/60 p-4 sm:p-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-semibold text-white/75">
            <span className="uppercase tracking-[0.35em] text-white/60">First name *</span>
            <div className="relative">
              <input
                type="text"
                id="hero-booking-firstName"
                name="firstName"
                required
                minLength={2}
                maxLength={100}
                pattern="[a-zA-Z\s'-]{2,100}"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                placeholder="Jordan"
                className={`w-full pr-10 rounded-card border bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all ${
                  touched.firstName
                    ? errors.firstName
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : isValid.firstName
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                      : 'border-white/20 focus:border-white focus:ring-white/40'
                    : 'border-white/20 focus:border-white focus:ring-white/40'
                }`}
              />
              {touched.firstName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.firstName ? (
                    <AlertCircle className="text-red-300" size={16} />
                  ) : isValid.firstName ? (
                    <CheckCircle className="text-green-300" size={16} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.firstName && errors.firstName && (
              <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.firstName}
              </p>
            )}
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-white/75">
            <span className="uppercase tracking-[0.35em] text-white/60">Last name *</span>
            <div className="relative">
              <input
                type="text"
                id="hero-booking-lastName"
                name="lastName"
                required
                minLength={2}
                maxLength={100}
                pattern="[a-zA-Z\s'-]{2,100}"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                placeholder="Smith"
                className={`w-full pr-10 rounded-card border bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all ${
                  touched.lastName
                    ? errors.lastName
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : isValid.lastName
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                      : 'border-white/20 focus:border-white focus:ring-white/40'
                    : 'border-white/20 focus:border-white focus:ring-white/40'
                }`}
              />
              {touched.lastName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.lastName ? (
                    <AlertCircle className="text-red-300" size={16} />
                  ) : isValid.lastName ? (
                    <CheckCircle className="text-green-300" size={16} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.lastName && errors.lastName && (
              <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.lastName}
              </p>
            )}
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-white/75">
            <span className="uppercase tracking-[0.35em] text-white/60">Email *</span>
            <div className="relative">
              <input
                type="email"
                id="hero-booking-email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="jordan@family.co.uk"
                className={`w-full pr-10 rounded-card border bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all ${
                  touched.email
                    ? errors.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : isValid.email
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                      : 'border-white/20 focus:border-white focus:ring-white/40'
                    : 'border-white/20 focus:border-white focus:ring-white/40'
                }`}
              />
              {touched.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.email ? (
                    <AlertCircle className="text-red-300" size={16} />
                  ) : isValid.email ? (
                    <CheckCircle className="text-green-300" size={16} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.email}
              </p>
            )}
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-white/75">
            <span className="uppercase tracking-[0.35em] text-white/60">Phone *</span>
            <div className="relative">
              <input
                type="tel"
                id="hero-booking-phone"
                name="phone"
                required
                pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
                inputMode="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="07123 456789 or 020 1234 5678"
                className={`w-full pr-10 rounded-card border bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all ${
                  touched.phone
                    ? errors.phone
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : isValid.phone
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                      : 'border-white/20 focus:border-white focus:ring-white/40'
                    : 'border-white/20 focus:border-white focus:ring-white/40'
                }`}
              />
              {touched.phone && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {errors.phone ? (
                    <AlertCircle className="text-red-300" size={16} />
                  ) : isValid.phone ? (
                    <CheckCircle className="text-green-300" size={16} />
                  ) : null}
                </div>
              )}
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.phone}
              </p>
            )}
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-white/75">
            <span className="uppercase tracking-[0.35em] text-white/60">Preferred package *</span>
            <div className="rounded-card border border-white/20 bg-white/10 px-3 py-1.5">
              <select
                id="hero-booking-package"
                name="packageSlug"
                required
                value={formData.packageSlug}
                onChange={handleChange}
                className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
              >
                <option value="">Select a package…</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.slug} className="bg-navy-blue text-white">
                    {pkg.name} · £{pkg.price} · {pkg.hours} hrs
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
        <p className="text-[11px] text-white/65">
          Next screen: children, postcode, and schedule details.
        </p>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-card border border-rose-300/80 bg-rose-500/15 px-4 py-3 text-sm text-white"
          >
            <AlertCircle size={18} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-card border border-transparent bg-gradient-to-r from-star-gold via-amber-400 to-cta-accent-start px-6 py-4 text-base font-semibold text-navy-blue shadow-lg transition-all duration-200 ${
            isSubmitting ? 'cursor-wait opacity-70' : 'hover:-translate-y-0.5 hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-blue border-t-transparent" />
              Starting booking…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
              <Sparkles size={18} />
              Book now
              <span aria-hidden>→</span>
            </span>
          )}
        </button>

        <div className="text-center text-xs text-white/70">
          Secure booking · No upfront payment · Free consultation included
        </div>
      </form>
    </div>
  );
}

