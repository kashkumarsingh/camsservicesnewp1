'use client';

import React, { useState, useEffect } from 'react';
import { useContactForm } from '@/interfaces/web/hooks/contact';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { ServiceDTO } from '@/core/application/services/dto/ServiceDTO';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { validateFullName, validateEmail, validatePhone, validateAge } from '@/utils/validation';

interface HeroContactFormProps {
  packages: PackageDTO[];
  services: ServiceDTO[];
}

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  childAge: '',
  address: '',
  postalCode: '',
  inquiryType: '',
};

export default function HeroContactForm({ packages, services }: HeroContactFormProps) {
  const { submit: submitContact, loading: contactLoading, error: contactError, success: contactSuccess } = useContactForm();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const router = useRouter();

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});

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

    if (touched.childAge || formData.childAge) {
      const ageValidation = validateAge(formData.childAge);
      if (!ageValidation.valid) {
        newErrors.childAge = ageValidation.error || 'Please enter a valid age (0-25)';
        newIsValid.childAge = false;
      } else {
        newIsValid.childAge = true;
      }
    }

    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData.name, formData.email, formData.phone, formData.childAge, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting || contactLoading || hasSubmitted) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      childAge: true,
      inquiryType: true,
    });

    // Validate all required fields
    const nameValidation = validateFullName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const ageValidation = validateAge(formData.childAge);

    if (!nameValidation.valid || !emailValidation.valid || !phoneValidation.valid || !ageValidation.valid || !formData.inquiryType) {
      setErrors({
        name: nameValidation.error || '',
        email: emailValidation.error || '',
        phone: phoneValidation.error || '',
        childAge: ageValidation.error || '',
        inquiryType: !formData.inquiryType ? 'Please select an option' : '',
      });
      return;
    }

    const inquiryType = formData.inquiryType.startsWith('Package:') ? 'package' :
                       formData.inquiryType.startsWith('Service:') ? 'service' :
                       formData.inquiryType === 'General Inquiry' ? 'general' : 'other';
    
    const inquiryDetails = formData.inquiryType || undefined;
    
    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
        childAge: formData.childAge || undefined,
        inquiryType,
        inquiryDetails,
        urgency: 'exploring', // Default for hero form
        preferredContact: 'email', // Default for hero form
        message: undefined,
        newsletter: false,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
      });

      // Success - redirect to thank you page
      router.push('/contact/thank-you');
    } catch (error: any) {
      setIsSubmitting(false);
      setHasSubmitted(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-white/20 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-[#FFD700]" size={20} />
          <h3 className="text-xl sm:text-2xl font-bold text-white">Get Your FREE Consultation</h3>
        </div>
        <p className="text-xs sm:text-sm text-white/90">Fill out the form and we'll get back to you within 24 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="hero-name" className="block text-xs font-semibold text-white/90 mb-1.5">
            Your Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="hero-name"
              name="name"
              required
              minLength={2}
              maxLength={200}
                        pattern="[a-zA-Z][a-zA-Z '-]{1,} +[a-zA-Z][a-zA-Z '-]{1,}"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              placeholder="John Smith"
              className={`w-full px-4 py-2.5 pr-10 bg-white/20 backdrop-blur-sm border-2 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.name
                  ? errors.name
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : isValid.name
                    ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                    : 'border-white/30 focus:ring-white/50 focus:border-white/50'
                  : 'border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
            />
            {touched.name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.name ? (
                  <AlertCircle className="text-red-300" size={18} />
                ) : isValid.name ? (
                  <CheckCircle className="text-green-300" size={18} />
                ) : null}
              </div>
            )}
          </div>
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="hero-email" className="block text-xs font-semibold text-white/90 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              id="hero-email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              placeholder="john@example.com"
              className={`w-full px-4 py-2.5 pr-10 bg-white/20 backdrop-blur-sm border-2 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.email
                  ? errors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : isValid.email
                    ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                    : 'border-white/30 focus:ring-white/50 focus:border-white/50'
                  : 'border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
            />
            {touched.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.email ? (
                  <AlertCircle className="text-red-300" size={18} />
                ) : isValid.email ? (
                  <CheckCircle className="text-green-300" size={18} />
                ) : null}
              </div>
            )}
          </div>
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="hero-phone" className="block text-xs font-semibold text-white/90 mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="hero-phone"
              name="phone"
              required
              pattern="^(?:\+44\s?|0)(?:\d{2,4}\s?\d{3,4}\s?\d{3,4})$"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              placeholder="07123 456789 or 020 1234 5678"
              className={`w-full px-4 py-2.5 pr-10 bg-white/20 backdrop-blur-sm border-2 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.phone
                  ? errors.phone
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : isValid.phone
                    ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                    : 'border-white/30 focus:ring-white/50 focus:border-white/50'
                  : 'border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
            />
            {touched.phone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.phone ? (
                  <AlertCircle className="text-red-300" size={18} />
                ) : isValid.phone ? (
                  <CheckCircle className="text-green-300" size={18} />
                ) : null}
              </div>
            )}
          </div>
          {touched.phone && errors.phone && (
            <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Child Age */}
        <div>
          <label htmlFor="hero-childAge" className="block text-xs font-semibold text-white/90 mb-1.5">
            Child's Age *
          </label>
          <div className="relative">
            <input
              type="number"
              id="hero-childAge"
              name="childAge"
              required
              min={0}
              max={25}
              inputMode="numeric"
              value={formData.childAge}
              onChange={handleChange}
              onBlur={() => handleBlur('childAge')}
              placeholder="e.g., 8"
              className={`w-full px-4 py-2.5 pr-10 bg-white/20 backdrop-blur-sm border-2 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                touched.childAge
                  ? errors.childAge
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : isValid.childAge
                    ? 'border-green-400 focus:border-green-400 focus:ring-green-300'
                    : 'border-white/30 focus:ring-white/50 focus:border-white/50'
                  : 'border-white/30 focus:ring-white/50 focus:border-white/50'
              }`}
            />
            {touched.childAge && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.childAge ? (
                  <AlertCircle className="text-red-300" size={18} />
                ) : isValid.childAge ? (
                  <CheckCircle className="text-green-300" size={18} />
                ) : null}
              </div>
            )}
          </div>
          {touched.childAge && errors.childAge && (
            <p className="mt-1 text-xs text-red-200 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.childAge}
            </p>
          )}
        </div>

        {/* Address & Postal Code - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="hero-address" className="block text-xs font-semibold text-white/90 mb-1.5">
              Address
            </label>
            <input
              type="text"
              id="hero-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, city"
              className="w-full px-4 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="hero-postalCode" className="block text-xs font-semibold text-white/90 mb-1.5">
              Postal Code
            </label>
            <input
              type="text"
              id="hero-postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="IG9 5BT"
              className="w-full px-4 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Inquiry Type */}
        <div>
          <label htmlFor="hero-inquiryType" className="block text-xs font-semibold text-white/90 mb-1.5">
            I'm Interested In *
          </label>
          <select
            id="hero-inquiryType"
            name="inquiryType"
            required
            value={formData.inquiryType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 cursor-pointer [&>option]:bg-[#1E3A5F] [&>option]:text-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem',
            }}
          >
            <option value="" style={{ backgroundColor: '#1E3A5F', color: 'white' }}>Select...</option>
            {packages.length > 0 && (
              <optgroup label="Packages" style={{ backgroundColor: '#1E3A5F', color: 'white' }}>
                {packages.slice(0, 3).map((pkg) => (
                  <option key={pkg.id} value={`Package: ${pkg.name}`} style={{ backgroundColor: '#1E3A5F', color: 'white' }}>
                    {pkg.name}
                  </option>
                ))}
              </optgroup>
            )}
            {services.length > 0 && (
              <optgroup label="Services" style={{ backgroundColor: '#1E3A5F', color: 'white' }}>
                {services.slice(0, 3).map((service) => (
                  <option key={service.slug} value={`Service: ${service.title}`} style={{ backgroundColor: '#1E3A5F', color: 'white' }}>
                    {service.title}
                  </option>
                ))}
              </optgroup>
            )}
            <option value="General Inquiry" style={{ backgroundColor: '#1E3A5F', color: 'white' }}>General Inquiry</option>
          </select>
        </div>

        {/* Success Message */}
        {contactSuccess && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-green-100 text-sm">
            <CheckCircle2 size={16} />
            <span>Success! Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {contactError && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-red-100 text-sm">
            <AlertCircle size={16} />
            <span className="flex-1">
              {contactError.message || 'Something went wrong. Please try again or contact us directly.'}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || contactLoading || hasSubmitted}
          className={`w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-[#1E3A5F] font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            isSubmitting || contactLoading || hasSubmitted
              ? 'opacity-70 cursor-wait hover:scale-100'
              : 'cursor-pointer hover:scale-105'
          }`}
        >
          {isSubmitting || contactLoading || hasSubmitted ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Get FREE Consultation</span>
              <span>→</span>
            </>
          )}
        </button>

        <p className="text-xs text-white/70 text-center">
          🔒 100% secure. We respect your privacy.
        </p>
      </form>
    </div>
  );
}

