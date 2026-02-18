'use client';

import React, { useState, useEffect } from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { useContactForm } from '@/interfaces/web/hooks/contact';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { ServiceDTO } from '@/core/application/services/dto/ServiceDTO';
import { Mail, Phone, MapPin, Clock, CheckCircle2, MessageSquare, Calendar, Users, Award, Shield, Star, AlertCircle, CheckCircle, PlusCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { validateFullName, validateEmail, validatePhone, validateAge, validateAddress, validatePostcode } from '@/utils/validation';

interface ChildInfo {
  id: number;
  name: string;
  age: string;
}

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  children: [{ id: 1, name: '', age: '' }] as ChildInfo[],
  inquiryType: '',
  urgency: '',
  preferredContact: 'email' as 'email' | 'phone' | 'whatsapp',
  message: '',
};

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  mapEmbedUrl?: string;
  whatsappUrl?: string;
}

interface ContactPageClientProps {
  packages: PackageDTO[];
  services: ServiceDTO[];
  contactInfo: ContactInfo;
}

export default function ContactPageClient({ packages, services, contactInfo }: ContactPageClientProps) {
  const { submit: submitContact, loading: contactLoading, error: contactError, success: contactSuccess } = useContactForm();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<Record<string, boolean>>({});
  const [childErrors, setChildErrors] = useState<Record<number, { name?: string; age?: string }>>({});
  const [childValid, setChildValid] = useState<Record<number, { name?: boolean; age?: boolean }>>({});

  const normalizedContactInfo = {
    phone: contactInfo?.phone ?? '',
    email: contactInfo?.email ?? '',
    address: contactInfo?.address ?? '',
    mapEmbedUrl: contactInfo?.mapEmbedUrl ?? '',
    whatsappUrl: contactInfo?.whatsappUrl ?? '',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Prevent double submission - multiple layers of protection
    if (isSubmitting || contactLoading || hasSubmitted) {
      console.log('Submission blocked:', { isSubmitting, contactLoading, hasSubmitted });
      return;
    }

    // Mark all fields as touched to show validation errors
    const allTouched: Record<string, boolean> = {
      name: true,
      email: true,
      phone: true,
      address: true,
      postalCode: true,
      inquiryType: true,
      urgency: true,
    };
    
    // Mark all children fields as touched
    formData.children.forEach((child) => {
      allTouched[`child-${child.id}-name`] = true;
      allTouched[`child-${child.id}-age`] = true;
    });
    
    setTouched(allTouched);
    setSubmitAttempted(true);

    // Validate all required fields
    const nameValidation = validateFullName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    
    // Address and postcode are required - validate them
    const addressValidation = formData.address.trim() 
      ? validateAddress(formData.address) 
      : { valid: false, error: 'Address is required' };
    const postcodeValidation = formData.postalCode.trim() 
      ? validatePostcode(formData.postalCode) 
      : { valid: false, error: 'Postal code is required' };

    // Validate children
    const childrenErrors: Record<number, { name?: string; age?: string }> = {};
    let hasChildrenErrors = false;

    formData.children.forEach((child) => {
      const nameValidation = validateFullName(child.name);
      const ageValidation = validateAge(child.age);
      
      if (!nameValidation.valid || !ageValidation.valid) {
        childrenErrors[child.id] = {
          name: nameValidation.error || '',
          age: ageValidation.error || '',
        };
        hasChildrenErrors = true;
      }
    });

    if (!nameValidation.valid || !emailValidation.valid || !phoneValidation.valid || !addressValidation.valid || !postcodeValidation.valid || !formData.inquiryType || !formData.urgency || hasChildrenErrors) {
      setErrors({
        name: nameValidation.error || '',
        email: emailValidation.error || '',
        phone: phoneValidation.error || '',
        address: addressValidation.error || '',
        postalCode: postcodeValidation.error || '',
        inquiryType: !formData.inquiryType ? 'Please select an option' : '',
        urgency: !formData.urgency ? 'Please select a timeframe' : '',
      });
      setChildErrors(childrenErrors);
      return;
    }

    const inquiryType = formData.inquiryType.startsWith('Package:') ? 'package' :
                       formData.inquiryType.startsWith('Service:') ? 'service' :
                       formData.inquiryType === 'General Inquiry' ? 'general' : 'other';
    
    const inquiryDetails = formData.inquiryType || undefined;
    
    const urgency = formData.urgency === 'Urgent' ? 'urgent' :
                   formData.urgency === 'Soon' ? 'soon' : 'exploring';
    
    // Set all flags to prevent double submission
    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
        childAge: formData.children.length > 0 ? formData.children.map(c => `${c.name} (${c.age} years)`).join(', ') : undefined,
        inquiryType,
        inquiryDetails,
        urgency: urgency as any,
        preferredContact: formData.preferredContact,
        message: formData.message,
        newsletter: false,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/contact',
      });

      // Success! Clear form and redirect immediately
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitting(false);
      
      // Redirect to thank you page immediately
      router.push('/contact/thank-you');
      return; // Exit early to prevent any further execution
    } catch (error: any) {
      // Reset submission flags on error so user can retry
      setIsSubmitting(false);
      setHasSubmitted(false);
      
      // Only log if it's not a duplicate/rate limit error (those are expected)
      if (error?.status !== 429) {
        console.error('Form submission error:', error);
      }
    }
  };

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    // Name validation
    if (touched.name || formData.name) {
      const nameValidation = validateFullName(formData.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error || 'Please enter both first and last name';
        newIsValid.name = false;
      } else {
        newIsValid.name = true;
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

    // Address validation (required - only show error if touched and empty, or if has value but invalid)
    if (touched.address) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
        newIsValid.address = false;
      } else {
        const addressValidation = validateAddress(formData.address);
        if (!addressValidation.valid) {
          newErrors.address = addressValidation.error || 'Address must start with a door number';
          newIsValid.address = false;
        } else {
          newIsValid.address = true;
        }
      }
    }

    // Postal code validation (required - only show error if touched and empty, or if has value but invalid)
    if (touched.postalCode) {
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Postal code is required';
        newIsValid.postalCode = false;
      } else {
        const postcodeValidation = validatePostcode(formData.postalCode);
        if (!postcodeValidation.valid) {
          newErrors.postalCode = postcodeValidation.error || 'Please enter a valid UK postal code';
          newIsValid.postalCode = false;
        } else {
          newIsValid.postalCode = true;
        }
      }
    }

    // Children validation
    const newChildErrors: Record<number, { name?: string; age?: string }> = {};
    const newChildValid: Record<number, { name?: boolean; age?: boolean }> = {};

    formData.children.forEach((child) => {
      const childTouched = touched[`child-${child.id}-name`] || touched[`child-${child.id}-age`];
      
      if (childTouched || child.name || child.age) {
        // Child name validation (requires first + last)
        if (child.name) {
          const nameValidation = validateFullName(child.name);
          if (!nameValidation.valid) {
            newChildErrors[child.id] = { ...newChildErrors[child.id], name: nameValidation.error || 'Please enter both first and last name' };
            newChildValid[child.id] = { ...newChildValid[child.id], name: false };
          } else {
            newChildValid[child.id] = { ...newChildValid[child.id], name: true };
          }
        }

        // Child age validation
        if (child.age) {
          const ageValidation = validateAge(child.age);
          if (!ageValidation.valid) {
            newChildErrors[child.id] = { ...newChildErrors[child.id], age: ageValidation.error || 'Please enter a valid age (0-25)' };
            newChildValid[child.id] = { ...newChildValid[child.id], age: false };
          } else {
            newChildValid[child.id] = { ...newChildValid[child.id], age: true };
          }
        }
      }
    });

    setErrors(newErrors);
    setIsValid(newIsValid);
    setChildErrors(newChildErrors);
    setChildValid(newChildValid);
  }, [formData.name, formData.email, formData.phone, formData.address, formData.postalCode, formData.children, touched, submitAttempted]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Mark field as touched when user starts typing
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  return (
    <div>
      <Section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Get in touch
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Book a free consultation and discover how our trauma-informed care can help your child thrive.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-medium uppercase tracking-wider text-slate-600">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-slate-500 fill-slate-500 shrink-0" />
              4.9/5 rating
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-slate-500 shrink-0" size={16} />
              DBS checked
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-slate-500 shrink-0" size={16} />
              Ofsted registered
            </span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button href="#contact-form" variant="primary" size="lg" withArrow>
              Book a consultation
            </Button>
            <Button 
              href={normalizedContactInfo.phone ? `tel:${normalizedContactInfo.phone}` : undefined} 
              variant="outline" 
              size="lg" 
              withArrow
              disabled={!normalizedContactInfo.phone}
            >
              <Phone size={18} className="mr-2" />
              {normalizedContactInfo.phone ? 'Call us' : 'Number coming soon'}
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-6 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-center">
              <p className="text-xl font-semibold text-slate-900">500+</p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">Happy families</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-center">
              <p className="text-xl font-semibold text-slate-900">10+</p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">Years experience</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-center">
              <p className="text-xl font-semibold text-slate-900">98%</p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">Satisfaction</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-center">
              <p className="text-xl font-semibold text-slate-900">24h</p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">Response time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            <div id="contact-form" className="bg-white rounded-lg p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Book a consultation</h2>
                <p className="text-slate-600">Fill out the form below and we&apos;ll get back to you within 24 hours. No obligation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">Your name *</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        required
                        minLength={2}
                        maxLength={200}
                        pattern="[a-zA-Z][a-zA-Z '-]{1,} +[a-zA-Z][a-zA-Z '-]{1,}"
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
                              : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
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
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">Email Address *</label>
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
                              : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
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
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">Phone Number *</label>
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
                              : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
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
                </div>

                {/* Children Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-900">Children *</label>
                    {formData.children.length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newId = Math.max(...formData.children.map(c => c.id), 0) + 1;
                          setFormData(prev => ({
                            ...prev,
                            children: [...prev.children, { id: newId, name: '', age: '' }]
                          }));
                        }}
                        className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
                      >
                        <PlusCircle size={14} />
                        Add Another Child
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {formData.children.map((child, index) => (
                      <div key={child.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">Child {index + 1}</span>
                          {formData.children.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  children: prev.children.filter(c => c.id !== child.id)
                                }));
                                // Clear validation errors for removed child
                                setChildErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors[child.id];
                                  return newErrors;
                                });
                                setChildValid(prev => {
                                  const newValid = { ...prev };
                                  delete newValid[child.id];
                                  return newValid;
                                });
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                            >
                              <XCircle size={14} />
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                minLength={2}
                                maxLength={200}
                                pattern="[a-zA-Z][a-zA-Z '-]{1,} +[a-zA-Z][a-zA-Z '-]{1,}"
                                autoComplete="name"
                                value={child.name}
                                onChange={(e) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    children: prev.children.map(c => 
                                      c.id === child.id ? { ...c, name: e.target.value } : c
                                    )
                                  }));
                                  if (!touched[`child-${child.id}-name`]) {
                                    setTouched(prev => ({ ...prev, [`child-${child.id}-name`]: true }));
                                  }
                                }}
                                onBlur={() => handleBlur(`child-${child.id}-name`)}
                                placeholder="John Smith"
                                className={`block w-full px-4 py-2.5 pr-10 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                                  touched[`child-${child.id}-name`]
                                    ? childErrors[child.id]?.name
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                      : childValid[child.id]?.name
                                      ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                                      : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                                    : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                                }`}
                              />
                              {touched[`child-${child.id}-name`] && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {childErrors[child.id]?.name ? (
                                    <AlertCircle className="text-red-500" size={18} />
                                  ) : childValid[child.id]?.name ? (
                                    <CheckCircle className="text-green-500" size={18} />
                                  ) : null}
                                </div>
                              )}
                            </div>
                            {touched[`child-${child.id}-name`] && childErrors[child.id]?.name && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {childErrors[child.id].name}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Age *</label>
                            <div className="relative">
                              <input
                                type="number"
                                required
                                min={0}
                                max={25}
                                inputMode="numeric"
                                value={child.age}
                                onChange={(e) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    children: prev.children.map(c => 
                                      c.id === child.id ? { ...c, age: e.target.value } : c
                                    )
                                  }));
                                  if (!touched[`child-${child.id}-age`]) {
                                    setTouched(prev => ({ ...prev, [`child-${child.id}-age`]: true }));
                                  }
                                }}
                                onBlur={() => handleBlur(`child-${child.id}-age`)}
                                placeholder="e.g., 8"
                                className={`block w-full px-4 py-2.5 pr-10 text-gray-900 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                                  touched[`child-${child.id}-age`]
                                    ? childErrors[child.id]?.age
                                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                      : childValid[child.id]?.age
                                      ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                                      : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                                    : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                                }`}
                              />
                              {touched[`child-${child.id}-age`] && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {childErrors[child.id]?.age ? (
                                    <AlertCircle className="text-red-500" size={18} />
                                  ) : childValid[child.id]?.age ? (
                                    <CheckCircle className="text-green-500" size={18} />
                                  ) : null}
                                </div>
                              )}
                            </div>
                            {touched[`child-${child.id}-age`] && childErrors[child.id]?.age && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {childErrors[child.id].age}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-slate-900 mb-2">Address (Optional)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="address" 
                      id="address" 
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
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                          : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
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
                  <label htmlFor="postalCode" className="block text-sm font-semibold text-slate-900 mb-2">Postal Code (Optional)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="postalCode" 
                      id="postalCode" 
                      value={formData.postalCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setFormData(prev => ({ ...prev, postalCode: value }));
                        if (!touched.postalCode) {
                          setTouched(prev => ({ ...prev, postalCode: true }));
                        }
                      }}
                      onBlur={() => handleBlur('postalCode')}
                      placeholder="e.g., IG9 5BT"
                      className={`block w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                        touched.postalCode
                          ? errors.postalCode
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            : isValid.postalCode
                            ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                            : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                          : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                      }`}
                    />
                    {touched.postalCode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {errors.postalCode ? (
                          <AlertCircle className="text-red-500" size={20} />
                        ) : isValid.postalCode ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {touched.postalCode && errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-semibold text-slate-900 mb-2">I&apos;m Interested In *</label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    required
                    value={formData.inquiryType}
                    onChange={handleChange}
                    onBlur={() => handleBlur('inquiryType')}
                    className={`block w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${
                      touched.inquiryType && errors.inquiryType
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : touched.inquiryType && formData.inquiryType
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                    }`}
                  >
                    <option value="">Select a service or package...</option>
                    <optgroup label="🎯 Popular Packages" className="font-semibold">
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={`Package: ${pkg.name}`} className="text-slate-900">
                          {pkg.name} - £{pkg.price}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="💡 Individual Services" className="font-semibold">
                      {services.map((service) => (
                        <option key={service.slug} value={`Service: ${service.title}`} className="text-slate-900">
                          {service.title}
                        </option>
                      ))}
                    </optgroup>
                    <option value="General Inquiry" className="text-slate-900">Just have a question</option>
                  </select>
                  {touched.inquiryType && errors.inquiryType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.inquiryType}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-sm font-semibold text-slate-900 mb-2">When do you need support? *</label>
                  <select
                    id="urgency"
                    name="urgency"
                    required
                    value={formData.urgency}
                    onChange={handleChange}
                    onBlur={() => handleBlur('urgency')}
                    className={`block w-full px-4 py-3 text-gray-900 bg-white border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer ${
                      touched.urgency && errors.urgency
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : touched.urgency && formData.urgency
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/20'
                    }`}
                  >
                    <option value="">Select timeframe...</option>
                    <option value="Urgent">🔥 Urgent - Within a week</option>
                    <option value="Soon">⚡ Soon - Within 2-4 weeks</option>
                    <option value="Exploring">💭 Just exploring options</option>
                  </select>
                  {touched.urgency && errors.urgency && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.urgency}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Best way to reach you? *</label>
                  <div className="flex flex-wrap gap-3">
                    {['email', 'phone', 'whatsapp'].map(method => (
                      <label key={method} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="preferredContact"
                          value={method}
                          checked={formData.preferredContact === method}
                          onChange={handleChange}
                          className="w-4 h-4 text-slate-700 border-gray-300 focus:ring-2 focus:ring-[#0080FF]"
                        />
                        <span className="ml-2 text-slate-900">
                          {method === 'email' ? '📧 Email' : method === 'phone' ? '📞 Phone' : '💬 WhatsApp'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-900 mb-2">Tell us about your needs (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Any specific needs or questions? Let us know so we can better help you..."
                    className="block w-full px-4 py-3 text-slate-900 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0080FF] focus:border-[#0080FF] hover:border-[#0080FF]/50 transition-all duration-200 placeholder:text-gray-400 resize-y"
                  ></textarea>
                </div>

                {contactSuccess && (
                  <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">✅ Thank you! Your message has been sent successfully.</p>
                  </div>
                )}
                {contactError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">
                      {contactError.message?.includes('already submitted') || contactError.message?.includes('wait')
                        ? '⏳ ' + contactError.message
                        : contactError.message?.includes('technical difficulties') || contactError.message?.includes('Something went wrong')
                        ? '⚠️ ' + contactError.message
                        : '❌ ' + (contactError.message || 'Something went wrong. Please try again or contact us directly.')}
                    </p>
                    {(contactError.message?.includes('already submitted') || contactError.message?.includes('wait')) && (
                      <p className="text-sm mt-2 opacity-90">
                        Please wait a few moments before trying again. This helps prevent duplicate submissions.
                      </p>
                    )}
                    {(contactError.message?.includes('technical difficulties') || contactError.message?.includes('contact us directly')) && (
                      <p className="text-sm mt-2 opacity-90">
                        You can also reach us by phone at {contactInfo.phone} or WhatsApp for immediate assistance.
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    variant="secondary" 
                    size="lg" 
                    className="w-full text-lg" 
                    withArrow
                    disabled={contactLoading || isSubmitting || hasSubmitted}
                  >
                    {contactLoading || isSubmitting || hasSubmitted ? 'Sending...' : 'Get My FREE Consultation'}
                  </Button>
                  <p className="text-sm text-center text-gray-500 mt-4">
                    🔒 Your information is 100% secure. We hate spam too.
                  </p>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500 shrink-0" />
                  Why families choose us
                </h3>
                <ul className="divide-y divide-slate-100">
                  {[
                    'FREE initial consultation (worth £50)',
                    'Tailored support plans for each child',
                    'Fully qualified & DBS-checked mentors',
                    'Flexible scheduling (evenings & weekends)',
                    'Regular progress updates & reports',
                    'Proven track record with 500+ families',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 py-3 text-sm text-slate-700 first:pt-0">
                      <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Prefer to talk?</h3>
                <p className="text-sm text-slate-600 mb-4">Choose your preferred contact method:</p>
                <div className="space-y-2">
                  <Button 
                    href={normalizedContactInfo.phone ? `tel:${normalizedContactInfo.phone}` : undefined} 
                    variant="primary" 
                    size="md" 
                    className="w-full"
                    disabled={!normalizedContactInfo.phone}
                  >
                    <Phone size={18} className="mr-2" />
                    Call us
                  </Button>
                  <Button 
                    href={normalizedContactInfo.whatsappUrl || undefined} 
                    variant="bordered" 
                    size="md" 
                    className="w-full"
                    disabled={!normalizedContactInfo.whatsappUrl}
                  >
                    <MessageSquare size={18} className="mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    href={normalizedContactInfo.email ? `mailto:${normalizedContactInfo.email}` : undefined} 
                    variant="outline" 
                    size="md" 
                    className="w-full"
                    disabled={!normalizedContactInfo.email}
                  >
                    <Mail size={18} className="mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                  Office hours
                </h3>
                <ul className="divide-y divide-slate-100 text-sm text-slate-700">
                  <li className="flex justify-between items-center py-2 first:pt-0">
                    <span className="font-medium">Monday – Friday</span>
                    <span>9:00 – 18:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="font-medium">Saturday</span>
                    <span>10:00 – 16:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="font-medium">Sunday</span>
                    <span>Closed</span>
                  </li>
                </ul>
                <p className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600">
                  After-hours? Submit the form and we&apos;ll respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Visit our centre</h2>
              <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                Located in Buckhurst Hill, we&apos;re easily accessible and offer a welcoming, safe environment.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-lg overflow-hidden border border-slate-200 h-80">
                {normalizedContactInfo.mapEmbedUrl ? (
                  <iframe
                    src={normalizedContactInfo.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location of CAMS Services"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-600 font-medium">
                    Map coming soon
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Address</h3>
                      <p className="text-sm text-slate-600">{normalizedContactInfo.address || 'Address coming soon'}</p>
                      <Button href="https://maps.google.com" variant="bordered" size="sm" className="mt-2">
                        Get directions
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Parking & access</h3>
                      <p className="text-sm text-slate-600">Free parking. Wheelchair accessible. Near public transport.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Book a visit</h3>
                      <p className="text-sm text-slate-600 mb-2">Schedule a tour of our centre.</p>
                      <Button href="#contact-form" variant="bordered" size="sm" withArrow>
                        Schedule tour
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Ready to take the first step?</h2>
          <p className="text-sm text-slate-600 mb-6">
            Join hundreds of families who trust us with their children&apos;s development.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button href="#contact-form" variant="primary" size="lg" withArrow>
              Book a consultation
            </Button>
            <Button 
              href={normalizedContactInfo.phone ? `tel:${normalizedContactInfo.phone}` : undefined} 
              variant="outline" 
              size="lg"
              disabled={!normalizedContactInfo.phone}
            >
              <Phone size={18} className="mr-2" />
              {normalizedContactInfo.phone ? 'Call us' : 'Phone coming soon'}
            </Button>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            100% satisfaction guaranteed · No long-term commitment · Cancel anytime
          </p>
        </div>
      </Section>
    </div>
  );
}

