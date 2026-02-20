/**
 * Register form data and section props.
 */

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  region: string;
}

export interface RegisterFormSectionProps {
  formData: RegisterFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: Record<string, boolean>;
  isSubmitting: boolean;
  loading: boolean;
  showPassword: boolean;
  showPasswordConfirmation: boolean;
  setShowPassword: (value: boolean) => void;
  setShowPasswordConfirmation: (value: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: string) => void;
  handlePostcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  authError: string | null;
  signInHref: string;
}
