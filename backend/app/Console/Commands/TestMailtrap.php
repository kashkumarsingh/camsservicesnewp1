<?php

namespace App\Console\Commands;

use App\Models\ContactSubmission;
use App\Models\SiteSetting;
use App\Events\ContactSubmissionCreated;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailtrap extends Command
{
    protected $signature = 'test:mailtrap';
    protected $description = 'Test Mailtrap email delivery';

    public function handle(): int
    {
        $this->info('Testing Mailtrap email delivery...');
        $this->newLine();

        // Test 1: Direct email test
        $this->info('Test 1: Sending direct email...');
        $settings = SiteSetting::instance();
        $rawEmails = $settings->support_emails ?? [];
        
        $emails = collect($rawEmails)
            ->map(function ($item) {
                if (is_array($item) && isset($item['value'])) {
                    return $item['value'];
                }
                if (is_string($item)) {
                    return $item;
                }
                return null;
            })
            ->filter(fn ($email) => filled($email) && is_string($email))
            ->unique()
            ->values()
            ->toArray();

        if (empty($emails)) {
            $this->warn('No support emails configured in Site Settings.');
            $this->warn('Please add at least one email in Admin dashboard > Site Settings > Support Notifications');
            $this->warn('Raw data: ' . json_encode($rawEmails));
            $emails = ['test@example.com'];
            $this->info("Using test email: {$emails[0]}");
        } else {
            $this->info('Found ' . count($emails) . ' support email(s): ' . implode(', ', $emails));
        }

        try {
            $this->info('Mail config:');
            $this->info('  Host: ' . config('mail.mailers.smtp.host'));
            $this->info('  Port: ' . config('mail.mailers.smtp.port'));
            $this->info('  Encryption: ' . (config('mail.mailers.smtp.encryption') ?: 'null'));
            $this->info('  Username: ' . config('mail.mailers.smtp.username'));
            $this->info('  From: ' . config('mail.from.address'));
            $this->newLine();

            Mail::raw('This is a direct test email from CAMS Services to verify Mailtrap connection.', function ($message) use ($emails) {
                $message->to($emails[0])
                        ->subject('Mailtrap Direct Test - CAMS Services')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });
            $this->info('✓ Direct email sent successfully!');
            $this->info('If you don\'t see it in Mailtrap, check:');
            $this->info('  1. Correct Mailtrap inbox credentials');
            $this->info('  2. Check spam/junk folder');
            $this->info('  3. Verify inbox URL: https://mailtrap.io/inboxes');
        } catch (\Exception $e) {
            $this->error('✗ Direct email failed: ' . $e->getMessage());
            $this->error('Full error: ' . $e->getTraceAsString());
            $this->newLine();
            $this->warn('Troubleshooting:');
            $this->warn('  1. Verify Mailtrap credentials in .env');
            $this->warn('  2. Try setting MAIL_ENCRYPTION=null (some Mailtrap setups need this)');
            $this->warn('  3. Check if port 2525 is accessible');
            return 1;
        }

        $this->newLine();

        // Test 2: Contact submission with queue
        $this->info('Test 2: Creating contact submission (queued notification)...');
        try {
            $submission = ContactSubmission::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '+44 7123 456789',
                'address' => '123 Test Street, Buckhurst Hill',
                'postal_code' => 'IG9 5BT',
                'inquiry_type' => 'general',
                'urgency' => 'exploring',
                'preferred_contact' => 'email',
                'message' => 'This is a test message to verify Mailtrap email delivery via contact submission with address and postal code fields.',
                'newsletter' => false,
                'status' => 'pending',
                'ip_address' => '127.0.0.1',
            ]);

            $this->info("✓ Test submission created (ID: {$submission->id})");

            // Dispatch event
            event(new ContactSubmissionCreated($submission));
            $this->info('✓ Event dispatched');

            // Process queue
            $this->info('Processing queue...');
            $this->call('queue:work', ['--once' => true, '--timeout' => 10]);

            $this->info('✓ Queue processed');
        } catch (\Exception $e) {
            $this->error('✗ Contact submission test failed: ' . $e->getMessage());
            return 1;
        }

        $this->newLine();
        $this->info('✅ All tests complete!');
        $this->info('Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
        $this->info('You should see 2 emails:');
        $this->info('  1. "Mailtrap Direct Test - CAMS Services"');
        $this->info('  2. "New Contact Request: Test User"');

        return 0;
    }
}

