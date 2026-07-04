import { Metadata } from 'next';
import LoginPageClient from '@/features/public/pages/login/LoginPageClient';

export const metadata: Metadata = {
  title: 'Login - CAMS services',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return <LoginPageClient />;
}
