'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useContactForm } from '@/interfaces/web/hooks/contact';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { ServiceDTO } from '@/core/application/services/dto/ServiceDTO';
import { PageHero } from '@/components/shared/public-page';
import {
  ContactStatsStrip,
  ContactFormSection,
  ContactSidebar,
  ContactVisitSection,
  ContactCTASection,
} from '@/components/contact';
import type { ContactFormData, ChildInfo } from '@/components/contact';
import { validateFullName, validateEmail, validatePhone, validateAge, validateAddress, validatePostcode } from '@/utils/validation';
import { ROUTES } from '@/utils/routes';
import Button from '@/components/ui/Button';
import { Phone } from 'lucide-react';
import { CONTACT_HERO, CONTACT_FORM, CONTACT_VALIDATION_FALLBACKS } from '@/components/contact/constants';

const INITIAL_FORM_STATE: ContactFormData = {
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  addressLine2: '',
  postalCode: '',
  children: [{ id: 1, name: '', age: '' }],
  inquiryType: '',
  urgency: '',
  preferredContact: 'email',
  message: '',
  hearAboutUs: '',
  marketingConsent: false,
  termsAccepted: false,
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
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      postalCode: true,
      inquiryType: true,
      urgency: true,
      termsAccepted: true,
    };
    formData.children.forEach((child) => {
      allTouched[`child-${child.id}-name`] = true;
      allTouched[`child-${child.id}-age`] = true;
    });
    setTouched(allTouched);
    setSubmitAttempted(true);

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const nameValidation = validateFullName(fullName);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const addressValidation = formData.address.trim()
      ? validateAddress(formData.address)
      : { valid: false, error: 'Address is required' };
    const postcodeValidation = formData.postalCode.trim()
      ? validatePostcode(formData.postalCode)
      : { valid: false, error: 'Postal code is required' };
    if (!formData.termsAccepted) {
      setErrors((prev) => ({ ...prev, termsAccepted: CONTACT_FORM.ERROR_TERMS_REQUIRED }));
      return;
    }

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
      !formData.termsAccepted ||
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
        termsAccepted: !formData.termsAccepted ? CONTACT_FORM.ERROR_TERMS_REQUIRED : '',
        name: nameValidation.error || '',
        firstName: nameValidation.error || '',
        lastName: nameValidation.error || '',
        email: emailValidation.error || '',
        phone: phoneValidation.error || '',
        address: addressValidation.error || '',
        postalCode: postcodeValidation.error || '',
        inquiryType: !formData.inquiryType ? CONTACT_FORM.ERROR_SELECT_OPTION : '',
        urgency: !formData.urgency ? CONTACT_FORM.ERROR_SELECT_TIMEFRAME : '',
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

    const fullAddress = formData.addressLine2.trim()
      ? `${formData.address}, ${formData.addressLine2}`
      : formData.address;
    const messageWithSource = formData.hearAboutUs
      ? [formData.message, `Heard about us: ${formData.hearAboutUs}`].filter(Boolean).join('\n\n')
      : formData.message;

    try {
      await submitContact({
        name: fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        address: fullAddress || undefined,
        postalCode: formData.postalCode || undefined,
        childAge:
          formData.children.length > 0
            ? formData.children.map((c) => `${c.name} (${c.age} years)`).join(', ')
            : undefined,
        inquiryType,
        inquiryDetails,
        urgency: urgency as 'urgent' | 'soon' | 'exploring',
        preferredContact: formData.preferredContact,
        message: messageWithSource || undefined,
        newsletter: formData.marketingConsent,
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

    const combinedName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    if (touched.firstName || touched.lastName || formData.firstName || formData.lastName) {
      const v = validateFullName(combinedName);
      if (!v.valid) {
        newErrors.name = v.error ?? CONTACT_VALIDATION_FALLBACKS.NAME;
        newErrors.firstName = v.error ?? '';
        newErrors.lastName = v.error ?? '';
        newIsValid.name = false;
        newIsValid.firstName = false;
        newIsValid.lastName = false;
      } else {
        newIsValid.name = true;
        newIsValid.firstName = true;
        newIsValid.lastName = true;
      }
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
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.phone,
    formData.address,
    formData.postalCode,
    formData.children,
    formData.termsAccepted,
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

  const callLabel = normalizedContactInfo.phone
    ? `${CONTACT_HERO.CTA_CALL}: ${normalizedContactInfo.phone}`
    : CONTACT_HERO.CTA_NUMBER_COMING_SOON;

  return (
    <div>
      <PageHero
        title={CONTACT_HERO.TITLE}
        subtitle={CONTACT_HERO.SUBTITLE}
        videoSrc="/videos/space-bg-2.mp4"
      >
        <Button href="#contact-form" variant="superPlayful" size="lg" className="rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
          {CONTACT_HERO.CTA_PRIMARY}
        </Button>
        <Button
          href={phoneHref ?? undefined}
          variant="outline"
          size="lg"
          className="rounded-full bg-white text-primary-blue border-2 border-primary-blue shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          disabled={!normalizedContactInfo.phone}
        >
          <Phone size={20} className="mr-2" />
          {callLabel}
        </Button>
      </PageHero>
      <ContactStatsStrip />
      <div className="py-16 bg-white">
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
