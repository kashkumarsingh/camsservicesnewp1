<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

/**
 * Seeds all CMS public pages with CAMS-relevant content.
 * Copy to backend/database/seeders/PublicPagesSeeder.php
 * Run: docker compose exec backend php /var/www/html/artisan db:seed --class=PublicPagesSeeder
 */
class PublicPagesSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedHomePage();
        $this->seedAboutPage();
        $this->seedPolicyPages();
    }

    private function seedHomePage(): void
    {
        $sections = [
            [
                'type' => 'hero',
                'data' => [
                    'badgeText' => 'Trusted by 500+ Families Since 2014',
                    'heading' => "Transform Your Child's Future",
                    'subheading' => "Specialist SEN & trauma-informed care that empowers children to thrive",
                    'primaryCta' => ['label' => 'Book FREE Consultation', 'href' => '/contact', 'variant' => 'primary'],
                    'secondaryCta' => ['label' => 'See How It Works', 'href' => '#how-it-works', 'variant' => 'outline'],
                    'backgroundVideoUrl' => '/videos/space-bg-2.mp4',
                ],
            ],
            [
                'type' => 'how_it_works',
                'data' => [
                    'title' => 'How It Works',
                    'subtitle' => "Getting started is simple. Just three easy steps to transform your child's journey.",
                    'steps' => [
                        ['title' => 'Book FREE Consultation', 'description' => "Share your child's needs, strengths, and goals. Get approved to start your journey.", 'icon' => 'phone'],
                        ['title' => 'Purchase Your Package', 'description' => 'Choose the perfect package for your family. Pay once, then book sessions at your pace.', 'icon' => 'calendar'],
                        ['title' => 'Book Sessions & Thrive', 'description' => 'Book sessions from your dashboard when ready. Watch your child progress with evidence-based support.', 'icon' => 'sparkles'],
                    ],
                ],
            ],
            [
                'type' => 'services_highlight',
                'data' => [
                    'title' => 'Our Specialist Services',
                    'subtitle' => "Evidence-based support tailored to your child's unique needs",
                    'viewAllLabel' => 'View All Services',
                    'viewAllHref' => '/services',
                ],
            ],
            [
                'type' => 'packages_highlight',
                'data' => [
                    'title' => 'Flexible Care Packages',
                    'subtitle' => 'Choose the perfect package for your family. All include DBS-checked staff, personalised plans, and ongoing support.',
                    'viewAllLabel' => 'Compare All Packages',
                    'viewAllHref' => '/packages',
                ],
            ],
            [
                'type' => 'impact_stats',
                'data' => [
                    'title' => 'Our Impact',
                    'subtitle' => "Real results that make a difference in children's lives",
                    'stats' => [
                        ['label' => 'Families Supported', 'value' => '500+', 'icon' => 'users'],
                        ['label' => 'DBS-Checked Professionals', 'value' => '100%', 'icon' => 'shield'],
                        ['label' => 'Average Satisfaction', 'value' => '98%', 'icon' => 'star'],
                        ['label' => 'Years of Expertise', 'value' => '10+', 'icon' => 'clock'],
                    ],
                ],
            ],
            [
                'type' => 'testimonials',
                'data' => [
                    'title' => 'What Families Say',
                    'subtitle' => "Don't just take our word for it — hear from the families we've helped",
                    'limit' => 6,
                ],
            ],
            [
                'type' => 'blog',
                'data' => [
                    'title' => 'Latest from Our Blog',
                    'subtitle' => 'Expert insights, tips, and stories to support your parenting journey',
                    'limit' => 3,
                ],
            ],
            [
                'type' => 'cta',
                'data' => [
                    'title' => "Ready to Transform Your Child's Future?",
                    'subtitle' => 'Book your FREE consultation today and discover how we can help your child thrive',
                    'primaryCta' => ['label' => 'Book FREE Consultation', 'href' => '/contact'],
                    'secondaryCta' => ['label' => 'View All Packages', 'href' => '/packages'],
                ],
            ],
        ];

        Page::updateOrCreate(
            ['slug' => 'home'],
            [
                'title' => 'Home',
                'type' => 'home',
                'content' => '',
                'sections' => $sections,
                'summary' => null,
                'published' => true,
                'version' => '1.0.0',
                'views' => 0,
                'effective_date' => now()->toDateString(),
                'last_updated' => now(),
            ]
        );
    }

    private function seedAboutPage(): void
    {
        $mission = [
            'title' => 'Our Mission: Empowering Children and Young People',
            'description' => 'We deliver trauma-informed, child-centred support that helps every young person feel safe, seen, and celebrated. We empower families through transparent communication, measurable progress, and flexible scheduling, and build a community of mentors, professionals, and parents who collaborate to unlock every child\'s potential.',
        ];

        $coreValues = [
            [
                'sectionTitle' => 'Our Core Values',
                'sectionSubtitle' => 'The principles that guide our every action.',
                'icon' => 'heart',
                'title' => 'Compassionate',
                'description' => 'We show up with empathy and kindness in every interaction.',
            ],
            [
                'icon' => 'shield',
                'title' => 'Trusted',
                'description' => 'Families can rely on us for safe, professional, and confidential support.',
            ],
            [
                'icon' => 'award',
                'title' => 'Skilled',
                'description' => 'Our team combines SEN expertise, trauma training, and lived experience.',
            ],
        ];

        $safeguarding = [
            'title' => 'Our Commitment to Safeguarding',
            'subtitle' => "Your child's safety and well-being are our highest priority.",
            'description' => "The safety and wellbeing of your child is paramount. All our staff are DBS-checked, first-aid certified, and extensively trained in the latest UK safeguarding protocols.",
            'badges' => ['DBS Checked', 'First Aid Certified', 'Safeguarding Trained'],
        ];

        $content = <<<'MD'
# About CAMS Services

## Our Mission
- Deliver trauma-informed, child-centred support that helps every young person feel safe, seen, and celebrated.
- Empower families through transparent communication, measurable progress, and flexible scheduling.
- Build a community of mentors, professionals, and parents who collaborate to unlock every child's potential.

## Why Families Trust Us
- **Whole-family focus** — We actively involve parents, carers, schools, and professionals.
- **Evidence-based approach** — Every programme is tailored to the child's needs, strengths, and goals.
- **Safeguarding first** — All staff are fully DBS checked, trained, and supported with ongoing development.
- **Clear outcomes** — Session reports, reviews, and exit plans keep everyone aligned on progress.

## Get in Touch
- Email: **info@camsservices.co.uk**
- Office Hours: Monday–Friday 9:00 AM – 6:00 PM (UK)
MD;

        Page::updateOrCreate(
            ['slug' => 'about'],
            [
                'title' => "Our Story: Dedicated to Every Child's Potential",
                'type' => 'about',
                'content' => $content,
                'sections' => null,
                'summary' => "Discover our mission, values, and the passionate team behind CAMS Services, committed to SEN support and trauma-informed care.",
                'mission' => $mission,
                'core_values' => $coreValues,
                'safeguarding' => $safeguarding,
                'published' => true,
                'version' => '1.0.0',
                'views' => 0,
                'effective_date' => now()->toDateString(),
                'last_updated' => now(),
            ]
        );
    }

    private function seedPolicyPages(): void
    {
        $policies = [
            ['slug' => 'privacy-policy', 'type' => 'privacy-policy', 'title' => 'Privacy Policy', 'summary' => 'How we collect, use, and protect your personal information.', 'content' => $this->privacyPolicyContent()],
            ['slug' => 'terms-of-service', 'type' => 'terms-of-service', 'title' => 'Terms of Service', 'summary' => 'Terms and conditions for using our services.', 'content' => $this->termsOfServiceContent()],
            ['slug' => 'cancellation-policy', 'type' => 'cancellation-policy', 'title' => 'Cancellation Policy', 'summary' => 'Terms and conditions for cancelling bookings and services.', 'content' => $this->cancellationPolicyContent()],
            ['slug' => 'cookie-policy', 'type' => 'cookie-policy', 'title' => 'Cookie Policy', 'summary' => 'How we use cookies and similar technologies on our website.', 'content' => $this->cookiePolicyContent()],
            ['slug' => 'payment-refund-policy', 'type' => 'payment-refund-policy', 'title' => 'Payment and Refund Policy', 'summary' => 'Payment methods, processing, and refund procedures.', 'content' => $this->paymentRefundPolicyContent()],
            ['slug' => 'safeguarding-policy', 'type' => 'safeguarding-policy', 'title' => 'Safeguarding Policy', 'summary' => 'Our commitment to protecting children and vulnerable individuals.', 'content' => $this->safeguardingPolicyContent()],
        ];

        foreach ($policies as $p) {
            Page::updateOrCreate(
                ['slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'type' => $p['type'],
                    'content' => $p['content'],
                    'sections' => null,
                    'summary' => $p['summary'],
                    'published' => true,
                    'version' => '1.0.0',
                    'views' => 0,
                    'effective_date' => now()->toDateString(),
                    'last_updated' => now(),
                ]
            );
        }
    }

    private function privacyPolicyContent(): string
    {
        return <<<'MD'
# Privacy Policy

_Last updated: January 1, 2025_

## Introduction
CAMS Services ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

## Information We Collect
- Name and contact information
- Child's information (age, needs, etc.)
- Payment information
- Communication preferences

## How We Use Your Information
- Provide and improve our services
- Process bookings and payments
- Communicate with you about sessions, activities, and updates
- Comply with legal obligations

## Data Protection
We implement appropriate technical and organisational measures to protect your personal data. Access is restricted to staff who require information to deliver services safely.

## Your Rights
- Access your personal data
- Request correction or deletion
- Object to processing
- Request data portability

## Contact Us
For questions about this Privacy Policy, please contact **info@camsservices.co.uk**.
MD;
    }

    private function termsOfServiceContent(): string
    {
        return <<<'MD'
# Terms of Service

_Last updated: January 1, 2025_

## Agreement to Terms
By accessing and using CAMS Services, you agree to be bound by these Terms of Service.

## Services
We provide SEN and trauma-informed care services for children. Services are subject to availability and may vary based on individual needs.

## Booking and Payment
- Bookings are confirmed upon payment.
- Payment must be made in advance unless otherwise agreed.
- Prices are subject to change with prior notice.

## Contact
For queries, contact **info@camsservices.co.uk**.
MD;
    }

    private function cancellationPolicyContent(): string
    {
        return <<<'MD'
# Cancellation Policy

_Last updated: January 1, 2025_

## Cancellation by Customer
- Full refund: 48+ hours before session; medical emergencies.
- Partial: 24–48 hours before, 50% refund. Less than 24 hours: no refund.

## Cancellation by CAMS Services
- Full refund; alternative session offered where possible.

## Package Cancellations
- Within 7 days of purchase: full refund. After 7 days: pro-rated on unused sessions.

## Contact
Email **bookings@camsservices.co.uk** with your booking reference.
MD;
    }

    private function cookiePolicyContent(): string
    {
        return <<<'MD'
# Cookie Policy

_Last updated: January 1, 2025_

## What Are Cookies?
Cookies are small text files placed on your device when you visit our website.

## How We Use Cookies
We use cookies to remember preferences, analyse traffic, improve experience, and provide personalised content. You can control cookies via your browser settings.

## Contact
For questions, email **info@camsservices.co.uk**.
MD;
    }

    private function paymentRefundPolicyContent(): string
    {
        return <<<'MD'
# Payment and Refund Policy

_Last updated: January 1, 2025_

## Payment Methods
We accept credit/debit cards, bank transfers, and approved online payment platforms. Payments are processed securely.

## Refunds
- Full: cancellations within 48 hours of booking; service not as described; medical emergencies (documented).
- Partial: 24–48 hours before session, 50%; package cancellations pro-rated.
- No refund: less than 24 hours before session; no-show without notice.

## Refund Process
Contact us within 7 days with booking reference and reason. Refund within 14 days if approved.

## Contact
Email **accounts@camsservices.co.uk**.
MD;
    }

    private function safeguardingPolicyContent(): string
    {
        return <<<'MD'
# Safeguarding Policy

_Last updated: January 1, 2025_

## Our Commitment
CAMS Services is committed to safeguarding and promoting the welfare of all children and vulnerable individuals.

## Key Principles
- All children have the right to be safe. We work in partnership with families and professionals. All staff are DBS checked and receive safeguarding training.

## Reporting Concerns
Contact our Designated Safeguarding Lead: **safeguarding@camsservices.co.uk**.

## Review
This policy is reviewed annually.
MD;
    }
}
