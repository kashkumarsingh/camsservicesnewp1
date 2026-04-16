import { Metadata } from 'next';
import ResetPasswordPageClient from '@/features/public/pages/reset-password/ResetPasswordPageClient';

export const metadata: Metadata = {
  title: 'Reset Password - CAMS Services',
  description: 'Set a new password for your account',
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
