/**
 * Login form data and section props.
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormSectionProps {
  formData: LoginFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: Record<string, boolean>;
  isSubmitting: boolean;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  authError: string | null;
  registerHref: string;
}
