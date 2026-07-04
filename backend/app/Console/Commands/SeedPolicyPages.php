<?php

namespace App\Console\Commands;

use App\Models\Page;
use Illuminate\Console\Command;

class SeedPolicyPages extends Command
{
    protected $signature = 'pages:seed-policies {--force : Overwrite existing policy page content}';

    protected $description = 'Create or update published policy document pages (privacy, terms, etc.)';

    /** @var array<string, array{title: string, summary: string, body: string}> */
    private const POLICIES = [
        'privacy-policy' => [
            'title' => 'Privacy Policy',
            'summary' => 'How we collect, use, and protect your personal information.',
            'body' => "# Privacy Policy\n\nCAMS services is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our website and services.\n\nFor questions, contact info@camsservices.co.uk.",
        ],
        'safeguarding-policy' => [
            'title' => 'Safeguarding Policy',
            'summary' => 'Our commitment to protecting children and vulnerable individuals.',
            'body' => "# Safeguarding Policy\n\nCAMS services is committed to safeguarding and promoting the welfare of all children and vulnerable individuals.\n\nReport concerns to safeguarding@camsservices.co.uk.",
        ],
        'cancellation-policy' => [
            'title' => 'Cancellation Policy',
            'summary' => 'Terms and conditions for cancelling bookings and services.',
            'body' => "# Cancellation Policy\n\nCancellations made 48 hours or more before a session may qualify for a full refund. See full terms on this page or contact bookings@camsservices.co.uk.",
        ],
        'terms-of-service' => [
            'title' => 'Terms of Service',
            'summary' => 'Terms and conditions for using our services.',
            'body' => "# Terms of Service\n\nBy using CAMS services, you agree to these terms. Services are subject to availability and individual assessment.\n\nContact info@camsservices.co.uk with any questions.",
        ],
        'cookie-policy' => [
            'title' => 'Cookie Policy',
            'summary' => 'How we use cookies and similar technologies on our website.',
            'body' => "# Cookie Policy\n\nWe use essential and analytics cookies to improve your experience. You can manage cookies through your browser settings.\n\nContact info@camsservices.co.uk for more information.",
        ],
        'payment-refund-policy' => [
            'title' => 'Payment and Refund Policy',
            'summary' => 'Payment methods, processing, and refund procedures.',
            'body' => "# Payment and Refund Policy\n\nPayments are processed securely. Refund eligibility depends on timing and service type.\n\nContact bookings@camsservices.co.uk for payment or refund requests.",
        ],
    ];

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach (self::POLICIES as $slug => $policy) {
            $page = Page::where('slug', $slug)->first();

            if ($page && ! $force) {
                $skipped++;
                $this->line("Skipped existing page: {$slug}");

                continue;
            }

            $payload = [
                'title' => $policy['title'],
                'slug' => $slug,
                'status' => Page::STATUS_PUBLISHED,
                'meta_description' => $policy['summary'],
                'is_system' => true,
                'content' => [
                    'body' => $policy['body'],
                    'lastUpdated' => now()->toDateString(),
                    'effectiveDate' => '2024-01-01',
                    'version' => '1.0',
                ],
            ];

            if ($page) {
                $page->fill($payload);
                $page->save();
                $updated++;
                $this->info("Updated: {$slug}");

                continue;
            }

            Page::create($payload);
            $created++;
            $this->info("Created: {$slug}");
        }

        $this->newLine();
        $this->info("Policy pages seeded (created: {$created}, updated: {$updated}, skipped: {$skipped}).");

        return self::SUCCESS;
    }
}
