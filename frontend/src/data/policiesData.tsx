/**
 * Policies Data
 * 
 * Static data for policies.
 * This will be replaced by API data when Laravel backend is ready.
 */

import { PolicyType } from '@/core/domain/policies/entities/Policy';

export interface PolicyData {
  id: string;
  title: string;
  slug: string;
  type: PolicyType;
  content: string;
  summary?: string;
  effectiveDate: string;
  version: string;
  published: boolean;
}

export const policiesData: PolicyData[] = [
  {
    id: '1',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    type: 'privacy',
    summary: 'How we collect, use, and protect your personal information.',
    content: `
# Privacy Policy

Last Updated: ${new Date().toLocaleDateString()}

## Introduction

CAMS Services ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

## Information We Collect

We collect information that you provide directly to us, including:
- Name and contact information
- Child's information (age, needs, etc.)
- Payment information
- Communication preferences

## How We Use Your Information

We use the information we collect to:
- Provide and improve our services
- Process bookings and payments
- Communicate with you
- Comply with legal obligations

## Data Protection

We implement appropriate technical and organizational measures to protect your personal data.

## Your Rights

You have the right to:
- Access your personal data
- Request correction or deletion
- Object to processing
- Data portability

## Contact Us

For questions about this Privacy Policy, please contact us at info@camsservices.co.uk
    `.trim(),
    effectiveDate: new Date('2024-01-01').toISOString(),
    version: '1.0',
    published: true,
  },
  {
    id: '2',
    title: 'Safeguarding Policy',
    slug: 'safeguarding-policy',
    type: 'safeguarding',
    summary: 'Our commitment to protecting children and vulnerable individuals.',
    content: `
# Safeguarding Policy

Last Updated: ${new Date().toLocaleDateString()}

## Our Commitment

CAMS Services is committed to safeguarding and promoting the welfare of all children and vulnerable individuals. We believe that everyone has the right to be protected from harm.

## Key Principles

- All children have the right to be safe
- We work in partnership with families
- We maintain a safe environment
- All staff are DBS checked and trained

## Reporting Concerns

If you have any safeguarding concerns, please contact our Designated Safeguarding Lead immediately.

## Training and Development

All staff receive regular safeguarding training and updates.

## Review

This policy is reviewed annually and updated as necessary.
    `.trim(),
    effectiveDate: new Date('2024-01-01').toISOString(),
    version: '1.0',
    published: true,
  },
  {
    id: '3',
    title: 'Cancellation Policy',
    slug: 'cancellation-policy',
    type: 'cancellation',
    summary: 'Terms and conditions for cancelling bookings and services.',
    content: `
# Cancellation Policy

Last Updated: ${new Date().toLocaleDateString()}

## Cancellation by Customer

### Full Refund
- Cancellations made 48 hours or more before the scheduled session: Full refund
- Cancellations due to medical emergencies: Full refund

### Partial Refund
- Cancellations made 24-48 hours before: 50% refund
- Cancellations made less than 24 hours before: No refund

## Cancellation by CAMS Services

If we need to cancel a session:
- Full refund will be provided
- Alternative session will be offered where possible

## Package Cancellations

Package cancellations:
- Within 7 days of purchase: Full refund
- After 7 days: Pro-rated refund based on unused sessions

## Contact

For cancellation requests, please contact us at info@camsservices.co.uk
    `.trim(),
    effectiveDate: new Date('2024-01-01').toISOString(),
    version: '1.0',
    published: true,
  },
  {
    id: '4',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    type: 'terms-of-service',
    summary: 'Terms and conditions for using our services.',
    content: `
# Terms of Service

Last Updated: ${new Date().toLocaleDateString()}

## Agreement to Terms

By accessing and using CAMS Services, you agree to be bound by these Terms of Service.

## Services

We provide SEN and trauma-informed care services for children. Services are subject to availability and may vary.

## Booking and Payment

- Bookings are confirmed upon payment
- Payment must be made in advance
- Prices are subject to change

## Responsibilities

### Your Responsibilities
- Provide accurate information
- Attend scheduled sessions
- Follow our code of conduct

### Our Responsibilities
- Provide professional services
- Maintain confidentiality
- Ensure safety and wellbeing

## Limitation of Liability

Our liability is limited to the value of services provided.

## Changes to Terms

We reserve the right to modify these terms at any time.

## Contact

For questions, contact us at info@camsservices.co.uk
    `.trim(),
    effectiveDate: new Date('2024-01-01').toISOString(),
    version: '1.0',
    published: true,
  },
  {
    id: '5',
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    type: 'cookie',
    summary: 'How we use cookies and similar technologies on our website.',
    content: `
# Cookie Policy

Last Updated: ${new Date().toLocaleDateString()}

## What Are Cookies

Cookies are small text files placed on your device when you visit our website.

## How We Use Cookies

We use cookies to:
- Remember your preferences
- Analyze website traffic
- Improve user experience
- Provide personalized content

## Types of Cookies

### Essential Cookies
Required for the website to function properly.

### Analytics Cookies
Help us understand how visitors use our website.

### Marketing Cookies
Used to deliver relevant advertisements.

## Managing Cookies

You can control cookies through your browser settings.

## Contact

For questions about our use of cookies, contact us at info@camsservices.co.uk
    `.trim(),
    effectiveDate: new Date('2024-01-01').toISOString(),
    version: '1.0',
    published: true,
  },
  {
    id: '6',
    title: 'Payment and Refund Policy',
    slug: 'payment-refund-policy',
    type: 'payment-refund',
    summary: 'Payment methods, processing, and refund procedures.',
    content: `
# Payment and Refund Policy

Last Updated: ${new Date().toLocaleDateString()}

## Payment Methods

We accept:
- Credit/Debit cards
- Bank transfers
- Online payment platforms

## Payment Processing

- Payments are processed securely
- All transactions are encrypted
- Payment confirmation is sent via email

## Refunds

### Full Refunds
- Cancellations within 48 hours
- Service not provided as described
- Medical emergencies

### Partial Refunds
- Cancellations 24-48 hours before: 50%
- Package cancellations: Pro-rated

### No Refunds
- Cancellations less than 24 hours before
- No-show appointments

## Refund Process

Refund requests:
1. Contact us within 7 days
2. Provide booking reference
3. Refund processed within 14 days

## Contact

For payment or refund inquiries: info@camsservices.co.uk
    `.trim(),
    effectiveDate: new Date('2024-01-01').toISOString(),
    version: '1.0',
    published: true,
  },
];


