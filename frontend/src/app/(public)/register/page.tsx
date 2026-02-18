import { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'Register - CAMS Services',
  description: 'Create your account to book packages and services',
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}

