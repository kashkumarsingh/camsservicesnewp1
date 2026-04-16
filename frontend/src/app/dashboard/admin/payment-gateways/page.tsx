import { Metadata } from 'next';
import AdminPaymentGatewaysPageClient from './AdminPaymentGatewaysPageClient';

export const metadata: Metadata = {
  title: 'Payment gateways | Admin Dashboard',
  description: 'Configure Stripe, PayPal and other payment gateway API keys.',
};

export default function AdminPaymentGatewaysPage() {
  return <AdminPaymentGatewaysPageClient />;
}
