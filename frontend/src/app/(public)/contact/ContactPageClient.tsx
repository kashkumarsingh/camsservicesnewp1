'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useContactForm } from '@/interfaces/web/hooks/contact';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { ServiceDTO } from '@/core/application/services/dto/ServiceDTO';
import {
  ContactHeroSection,
  ContactStatsStrip,
  ContactFormSection,
  ContactSidebar,
  ContactVisitSection,
  ContactCTASection,
} from '@/components/contact';
import type { ContactFormData, ChildInfo } from '@/components/contact';
import { validateFullName, validateEmail, validatePhone, validateAge, validateAddress, validatePostcode } from '@/utils/validation';
import { ROUTES } from '@/utils/routes';

const INITIAL_FORM_STATE: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postalCode: '',
  children: [{ id: 1, name: '', age: '' }],
  inquiryType: '',
  urgency: '',
  preferredContact: 'email',
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
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();

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
    e.stopPropagation();
    if (isSubmitting || contactLoading || hasSubmitted) return;

    const allTouched: Record<string, boolean> = {
      name: true,
      email: true,
      phone: true,
      address: true,
      postalCode: true,
      inquiryType: true,
      urgency: true,
    };
    formData.children.forEach((child) => {
      allTouched[`child-${child.id}-name`] = true;
      allTouched[`child-${child.id}-age`] = true;
    });
    setTouched(allTouched);
    setSubmitAttempted(true);

    const nameValidation = validateFullName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const addressValidation = formData.address.trim()
      ? validateAddress(formData.address)
      : { valid: false, error: 'Address is required' };
    const postcodeValidation = formData.postalCode.trim()
      ? validatePostcode(formData.postalCode)
      : { valid: false, error: 'Postal code is required' };

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

    if (
      !nameValidation.valid ||
      !emailValidation.valid ||
      !phoneValidation.valid ||
      !addressValidation.valid ||
      !postcodeValidation.valid ||
      !formData.inquiryType ||
      !formData.urgency ||
      hasChildrenErrors
    ) {
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

    const inquiryType = formData.inquiryType.startsWith('Package:')
      ? 'package'
      : formData.inquiryType.startsWith('Service:')
        ? 'service'
        : formData.inquiryType === 'General Inquiry'
          ? 'general'
          : 'other';
    const inquiryDetails = formData.inquiryType || undefined;
    const urgency =
      formData.urgency === 'Urgent' ? 'urgent' : formData.urgency === 'Soon' ? 'soon' : 'exploring';

    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
        childAge:
          formData.children.length > 0
            ? formData.children.map((c) => `${c.name} (${c.age} years)`).join(', ')
            : undefined,
        inquiryType,
        inquiryDetails,
        urgency: urgency as 'urgent' | 'soon' | 'exploring',
        preferredContact: formData.preferredContact,
        message: formData.message,
        newsletter: false,
        sourcePage: typeof window !== 'undefined' ? window.location.pathname : ROUTES.CONTACT,
      });
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitting(false);
      router.push('/contact/thank-you');
      return;
    } catch (err: unknown) {
      setIsSubmitting(false);
      setHasSubmitted(false);
      if (err && typeof err === 'object' && 'status' in err && (err as { status?: number }).status !== 429) {
        console.error('Form submission error:', err);
      }
    }
  };

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    const newIsValid: Record<string, boolean> = {};

    if (touched.name || formData.name) {
      const v = validateFullName(formData.name);
      if (!v.valid) {
        newErrors.name = v.error || 'Please enter both first and last name';
        newIsValid.name = false;
      } else newIsValid.name = true;
    }
    if (touched.email || formData.email) {
      const v = validateEmail(formData.email);
      if (!v.valid) {
        newErrors.email = v.error || 'Please enter a valid email address';
        newIsValid.email = false;
      } else newIsValid.email = true;
    }
    if (touched.phone || formData.phone) {
      const v = validatePhone(formData.phone);
      if (!v.valid) {
        newErrors.phone = v.error || 'Please enter a valid UK phone number';
        newIsValid.phone = false;
      } else newIsValid.phone = true;
    }
    if (touched.address) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
        newIsValid.address = false;
      } else {
        const v = validateAddress(formData.address);
        if (!v.valid) {
          newErrors.address = v.error || 'Address must start with a door number';
          newIsValid.address = false;
        } else newIsValid.address = true;
      }
    }
    if (touched.postalCode) {
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Postal code is required';
        newIsValid.postalCode = false;
      } else {
        const v = validatePostcode(formData.postalCode);
        if (!v.valid) {
          newErrors.postalCode = v.error || 'Please enter a valid UK postal code';
          newIsValid.postalCode = false;
        } else newIsValid.postalCode = true;
      }
    }

    const newChildErrors: Record<number, { name?: string; age?: string }> = {};
    const newChildValid: Record<number, { name?: boolean; age?: boolean }> = {};
    formData.children.forEach((child) => {
      const childTouched = touched[`child-${child.id}-name`] || touched[`child-${child.id}-age`];
      if (childTouched || child.name || child.age) {
        if (child.name) {
          const v = validateFullName(child.name);
          if (!v.valid) {
            newChildErrors[child.id] = { ...newChildErrors[child.id], name: v.error || 'Please enter both first and last name' };
            newChildValid[child.id] = { ...newChildValid[child.id], name: false };
          } else newChildValid[child.id] = { ...newChildValid[child.id], name: true };
        }
        if (child.age) {
          const v = validateAge(child.age);
          if (!v.valid) {
            newChildErrors[child.id] = { ...newChildErrors[child.id], age: v.error || 'Please enter a valid age (0-25)' };
            newChildValid[child.id] = { ...newChildValid[child.id], age: false };
          } else newChildValid[child.id] = { ...newChildValid[child.id], age: true };
        }
      }
    });

    setErrors(newErrors);
    setIsValid(newIsValid);
    setChildErrors(newChildErrors);
    setChildValid(newChildValid);
  }, [
    formData.name,
    formData.email,
    formData.phone,
    formData.address,
    formData.postalCode,
    formData.children,
    touched,
    submitAttempted,
  ]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (!touched[name]) setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const phoneHref = normalizedContactInfo.phone ? `tel:${normalizedContactInfo.phone}` : null;
  const whatsappHref = normalizedContactInfo.whatsappUrl || null;
  const emailHref = normalizedContactInfo.email ? `mailto:${normalizedContactInfo.email}` : null;

  return (
    <div>
      <ContactHeroSection
        phoneHref={phoneHref}
        phoneDisabled={!normalizedContactInfo.phone}
      />
      <ContactStatsStrip />
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            <ContactFormSection
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              touched={touched}
              isValid={isValid}
              childErrors={childErrors}
              childValid={childValid}
              setChildErrors={setChildErrors}
              setChildValid={setChildValid}
              setTouched={setTouched}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleSubmit={handleSubmit}
              isLoading={contactLoading}
              isSubmitting={isSubmitting}
              hasSubmitted={hasSubmitted}
              success={contactSuccess}
              error={contactError}
              contactPhone={normalizedContactInfo.phone}
              packages={packages.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
              services={services.map((s) => ({ slug: s.slug, title: s.title }))}
            />
            <ContactSidebar
              phoneHref={phoneHref}
              whatsappHref={whatsappHref}
              emailHref={emailHref}
              phoneDisabled={!normalizedContactInfo.phone}
              whatsappDisabled={!normalizedContactInfo.whatsappUrl}
              emailDisabled={!normalizedContactInfo.email}
            />
          </div>
        </div>
      </div>
      <ContactVisitSection
        mapEmbedUrl={normalizedContactInfo.mapEmbedUrl}
        address={normalizedContactInfo.address}
      />
      <ContactCTASection
        phoneHref={phoneHref}
        phoneDisabled={!normalizedContactInfo.phone}
      />
    </div>
  );
}
