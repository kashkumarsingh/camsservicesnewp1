/**
 * Types for contact form state and props.
 * Shared between ContactPageClient and ContactFormSection.
 */

export interface ChildInfo {
  id: number;
  name: string;
  age: string;
}

export interface ContactFormData {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2: string;
  postalCode: string;
  children: ChildInfo[];
  inquiryType: string;
  urgency: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  message: string;
  hearAboutUs: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
}

export interface ContactFormSectionProps {
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: Record<string, boolean>;
  childErrors: Record<number, { name?: string; age?: string }>;
  childValid: Record<number, { name?: boolean; age?: boolean }>;
  setChildErrors: React.Dispatch<React.SetStateAction<Record<number, { name?: string; age?: string }>>>;
  setChildValid: React.Dispatch<React.SetStateAction<Record<number, { name?: boolean; age?: boolean }>>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: string) => void;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  success: boolean;
  error: { message?: string } | null;
  contactPhone: string;
  packages: { id: string | number; name: string; price: number }[];
  services: { slug: string; title: string }[];
}
