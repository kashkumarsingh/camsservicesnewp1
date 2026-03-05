import { Metadata } from 'next';
import ForgotPasswordPageClient from './ForgotPasswordPageClient';

export const metadata: Metadata = {
  title: 'Forgot Password - CAMS Services',
  description: 'Request a password reset link',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
