<?php

namespace Database\Seeders;

use App\Models\Page;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StaticPagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'title' => 'CAMS Services Home',
                'slug' => 'home',
                'type' => 'home',
                'summary' => 'Specialist SEN & trauma-informed care programmes for families across the UK.',
                'content' => '',
                'sections' => [
                    [
                        'type' => 'hero',
                        'data' => [
                            'badgeText' => 'Trusted by 500+ Families Since 2014',
                            'heading' => 'Transform Your Child\'s Future with SEN & Trauma-Informed Care',
                            'subheading' => 'Personalised mentoring, activity programmes, and wraparound support delivered by DBS-checked professionals.',
                            'primaryCta' => [
                                'label' => 'Book FREE Consultation',
                                'href' => '/contact',
                                'variant' => 'primary',
                            ],
                            'secondaryCta' => [
                                'label' => 'See How It Works',
                                'href' => '#how-it-works',
                                'variant' => 'outline',
                            ],
                            'backgroundVideoUrl' => '/videos/space-bg-2.mp4',
                        ],
                    ],
                    [
                        'type' => 'how_it_works',
                        'data' => [
                            'title' => 'How It Works',
                            'subtitle' => 'Three simple steps to unlock progress for your child.',
                            'steps' => [
                                [
                                    'title' => 'Book FREE Consultation',
                                    'description' => 'Share your child\'s needs, strengths, and goals. Get approved to start your journey.',
                                    'icon' => 'phone',
                                ],
                                [
                                    'title' => 'Purchase Your Package',
                                    'description' => 'Choose the perfect package for your family. Pay once, then book sessions at your pace.',
                                    'icon' => 'calendar',
                                ],
                                [
                                    'title' => 'Book Sessions & Thrive',
                                    'description' => 'Book sessions from your dashboard when ready. Watch your child progress with evidence-based support.',
                                    'icon' => 'sparkles',
                                ],
                            ],
                        ],
                    ],
                    [
                        'type' => 'services_highlight',
                        'data' => [
                            'title' => 'Our Specialist Services',
                            'subtitle' => 'Trauma-informed mentoring, SEN advocacy, and therapeutic activity design.',
                            'viewAllLabel' => 'View All Services',
                            'viewAllHref' => '/services',
                        ],
                    ],
                    [
                        'type' => 'packages_highlight',
                        'data' => [
                            'title' => 'Flexible Care Packages',
                            'subtitle' => 'Compare Mars, Earth, Saturn, Jupiter, and Neptune programmes tailored to family schedules.',
                            'packageSlugs' => ['mars', 'earth', 'saturn'],
                            'viewAllLabel' => 'Compare All Packages',
                            'viewAllHref' => '/packages',
                        ],
                    ],
                    [
                        'type' => 'impact_stats',
                        'data' => [
                            'title' => 'Our Impact',
                            'subtitle' => 'Measured outcomes across every programme.',
                            'stats' => [
                                ['label' => 'Families Supported', 'value' => '500+', 'icon' => 'users'],
                                ['label' => 'Average Satisfaction', 'value' => '98%', 'icon' => 'star'],
                                ['label' => 'DBS Checked Staff', 'value' => '100%', 'icon' => 'shield'],
                                ['label' => 'Years of Expertise', 'value' => '10+', 'icon' => 'clock'],
                            ],
                        ],
                    ],
                    [
                        'type' => 'testimonials',
                        'data' => [
                            'title' => 'What Families Say',
                            'subtitle' => 'Real stories from CAMS parents and carers.',
                            'limit' => 6,
                        ],
                    ],
                    [
                        'type' => 'blog',
                        'data' => [
                            'title' => 'Latest from the CAMS Blog',
                            'subtitle' => 'Guides, resources, and trauma-informed strategies.',
                            'limit' => 3,
                        ],
                    ],
                    [
                        'type' => 'cta',
                        'data' => [
                            'title' => 'Ready to Transform Your Child\'s Future?',
                            'subtitle' => 'Book a FREE consultation to create a plan that works.',
                            'primaryCta' => [
                                'label' => 'Book FREE Consultation',
                                'href' => '/contact',
                            ],
                            'secondaryCta' => [
                                'label' => 'View All Packages',
                                'href' => '/packages',
                            ],
                        ],
                    ],
                ],
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-18',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'About CAMS Services',
                'slug' => 'about',
                'type' => 'about',
                'summary' => 'Discover our mission, trauma-informed approach, and the dedicated team supporting families across the UK.',
                'content' => <<<'MD'
# About CAMS Services

## Our Mission
- Deliver trauma-informed, child-centered support that helps every young person feel safe, seen, and celebrated.
- Empower families through transparent communication, measurable progress, and flexible scheduling.
- Build a community of mentors, professionals, and parents who collaborate to unlock every child’s potential.

## Why Families Trust Us
- **Whole-family focus** – We actively involve parents, carers, schools, and professionals.
- **Evidence-based approach** – Every programme is tailored to the child’s needs, strengths, and goals.
- **Safeguarding first** – All staff are fully DBS checked, trained, and supported with ongoing development.
- **Clear outcomes** – Session reports, reviews, and exit plans keep everyone aligned on progress.

## How Our Support Works
1. **Listen & Learn** – We begin with a comprehensive intake to understand the child’s history, triggers, and aspirations.
2. **Plan & Personalise** – We build a programme of activities, mentoring, and therapies unique to the family.
3. **Deliver & Adapt** – Sessions take place in the setting that works best (home, school, community, or online).
4. **Review & Celebrate** – We track outcomes, share wins, and adapt the plan as children grow.

## Our Values
- **Compassionate** – We show up with empathy and kindness in every interaction.
- **Trusted** – Families can rely on us for safe, professional, and confidential support.
- **Skilled** – Our team combines SEN expertise, trauma training, and lived experience.
- **Impactful** – We focus on practical strategies, measurable change, and sustainable progress.

## Safeguarding & Safety
- Designated Safeguarding Leads oversee every programme.
- Comprehensive risk assessments and safety plans underpin all sessions.
- We partner with NHS, CAMHS, social care, and education providers where needed.

## Get in Touch
- Email: **info@camsservices.co.uk**
- Phone: **+44 (0) 20 1234 5678**
- Office Hours: Monday–Friday / 9:00 AM – 6:00 PM (UK)
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'type' => 'privacy-policy',
                'summary' => 'How we collect, use, and protect your personal information.',
                'content' => <<<'MD'
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
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'Safeguarding Policy',
                'slug' => 'safeguarding-policy',
                'type' => 'safeguarding-policy',
                'summary' => 'Our commitment to protecting children and vulnerable individuals.',
                'content' => <<<'MD'
# Safeguarding Policy

_Last updated: January 1, 2025_

## Our Commitment
CAMS Services is committed to safeguarding and promoting the welfare of all children and vulnerable individuals. Everyone has the right to be protected from harm.

## Key Principles
- All children have the right to be safe.
- We work in partnership with families and professionals.
- We maintain a safe environment for every session.
- All staff are DBS checked and receive safeguarding training.

## Reporting Concerns
If you have any safeguarding concerns, please contact our Designated Safeguarding Lead immediately by emailing **safeguarding@camsservices.co.uk**.

## Training and Development
All staff receive regular safeguarding training, supervision, and updates to ensure best practice.

## Review
This policy is reviewed annually and updated as necessary.
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'Cancellation Policy',
                'slug' => 'cancellation-policy',
                'type' => 'cancellation-policy',
                'summary' => 'Terms and conditions for cancelling bookings and services.',
                'content' => <<<'MD'
# Cancellation Policy

_Last updated: January 1, 2025_

## Cancellation by Customer
### Full Refund
- Cancellations made 48 hours or more before the scheduled session
- Cancellations due to medical emergencies

### Partial Refund
- Cancellations made 24–48 hours before: 50% refund
- Cancellations made less than 24 hours before: No refund

## Cancellation by CAMS Services
- Full refund will be provided
- Alternative session will be offered where possible

## Package Cancellations
- Within 7 days of purchase: Full refund
- After 7 days: Pro-rated refund based on unused sessions

## Contact
For cancellation requests, please email **bookings@camsservices.co.uk** with your booking reference.
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'Terms of Service',
                'slug' => 'terms-of-service',
                'type' => 'terms-of-service',
                'summary' => 'Terms and conditions for using our services.',
                'content' => <<<'MD'
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

## Responsibilities
### Your Responsibilities
- Provide accurate information.
- Attend scheduled sessions or cancel in line with policy.
- Follow our code of conduct and safeguarding guidance.

### Our Responsibilities
- Provide professional services with qualified staff.
- Maintain confidentiality and data protection standards.
- Ensure safety and wellbeing at all times.

## Limitation of Liability
Our liability is limited to the value of services provided. We are not liable for indirect or consequential losses.

## Changes to Terms
We reserve the right to modify these terms at any time. Updated versions will be published on our website.

## Contact
For queries, contact **info@camsservices.co.uk**.
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'Cookie Policy',
                'slug' => 'cookie-policy',
                'type' => 'cookie-policy',
                'summary' => 'How we use cookies and similar technologies on our website.',
                'content' => <<<'MD'
# Cookie Policy

_Last updated: January 1, 2025_

## What Are Cookies?
Cookies are small text files placed on your device when you visit our website.

## How We Use Cookies
We use cookies to:
- Remember your preferences
- Analyse website traffic
- Improve user experience
- Provide personalised content

## Types of Cookies
### Essential Cookies
Required for the website to function properly.

### Analytics Cookies
Help us understand how visitors use our website.

### Marketing Cookies
Used to deliver relevant advertisements.

## Managing Cookies
You can control cookies through your browser settings. Restricting cookies may impact website functionality.

## Contact
For questions about our use of cookies, email **info@camsservices.co.uk**.
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
            [
                'title' => 'Payment and Refund Policy',
                'slug' => 'payment-refund-policy',
                'type' => 'payment-refund-policy',
                'summary' => 'Payment methods, processing, and refund procedures.',
                'content' => <<<'MD'
# Payment and Refund Policy

_Last updated: January 1, 2025_

## Payment Methods
We accept:
- Credit/debit cards
- Bank transfers
- Approved online payment platforms

## Payment Processing
- Payments are processed securely through encrypted gateways.
- Payment confirmation is sent via email.
- Outstanding balances must be cleared before future sessions.

## Refunds
### Full Refunds
- Cancellations within 48 hours of booking
- Service not provided as described
- Medical emergencies evidenced by documentation

### Partial Refunds
- Cancellations 24–48 hours before a session: 50%
- Package cancellations: Pro-rated based on unused sessions

### No Refunds
- Cancellations less than 24 hours before a session
- No-show appointments without prior notice

## Refund Process
1. Contact us within 7 days of the session date.
2. Provide booking reference and reason for request.
3. Refund processed within 14 days if approved.

## Contact
For payment or refund enquiries, email **accounts@camsservices.co.uk**.
MD,
                'effective_date' => '2024-01-01',
                'last_updated' => '2025-01-01',
                'version' => '1.0.0',
                'views' => 0,
                'published' => true,
            ],
        ];

        foreach ($pages as $data) {
            $page = Page::firstOrNew(['slug' => $data['slug']]);

            $page->title = $data['title'];
            $page->type = $data['type'];
            $page->summary = $data['summary'];
            $page->content = $data['content'];

            // Only set sections if the column exists in the database
            if (array_key_exists('sections', $data) && Schema::hasColumn('pages', 'sections')) {
                $page->sections = $data['sections'];
            }
            $page->version = $data['version'] ?? '1.0.0';
            $page->published = $data['published'] ?? true;
            $page->last_updated = Carbon::parse($data['last_updated'] ?? now());
            $page->effective_date = Carbon::parse($data['effective_date'] ?? now());

            if (array_key_exists('views', $data)) {
                $page->views = $data['views'];
            } elseif (! $page->exists) {
                $page->views = 0;
            }

            $page->save();
        }
    }
}


