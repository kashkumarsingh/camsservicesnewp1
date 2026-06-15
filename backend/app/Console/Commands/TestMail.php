<?php

namespace App\Console\Commands;

use App\Models\ContactSubmission;
use App\Models\SiteSetting;
use App\Events\ContactSubmissionCreated;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMail extends Command
{
    protected $signature = 'test:mail';
    protected $description = 'Test SMTP mail delivery (direct send + contact submission notification)';

    public function handle(): int
    {
        $this->info('Testing mail delivery...');
        $this->newLine();

        $this->info('Test 1: Sending direct email...');
        $emails = SiteSetting::adminNotificationEmails();

        if (empty($emails)) {
            $this->warn('No admin notification emails configured.');
            $this->warn('Set ADMIN_NOTIFICATION_EMAIL in .env or add support emails in Admin > Site Settings.');
            $emails = ['test@example.com'];
            $this->info("Using fallback test email: {$emails[0]}");
        } else {
            $this->info('Sending to: ' . implode(', ', $emails));
        }

        try {
            $this->info('Mail config:');
            $this->info('  Host: ' . config('mail.mailers.smtp.host'));
            $this->info('  Port: ' . config('mail.mailers.smtp.port'));
            $this->info('  Scheme: ' . (config('mail.mailers.smtp.scheme') ?: 'null'));
            $this->info('  Username: ' . config('mail.mailers.smtp.username'));
            $this->info('  From: ' . config('mail.from.address'));
            $this->newLine();

            Mail::raw('This is a direct test email from CAMS Services to verify SMTP delivery.', function ($message) use ($emails) {
                $message->to($emails[0])
                        ->subject('SMTP Direct Test - CAMS Services')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });
            $this->info('✓ Direct email sent successfully!');
        } catch (\Exception $e) {
            $this->error('✗ Direct email failed: ' . $e->getMessage());
            $this->newLine();
            $this->warn('Troubleshooting:');
            $this->warn('  1. Verify MAIL_* settings in .env (host, port, username, password, encryption)');
            $this->warn('  2. For Office 365 on port 587, set MAIL_SCHEME=smtp');
            $this->warn('  3. Ensure MAIL_FROM_ADDRESS matches the authenticated mailbox');
            return 1;
        }

        $this->newLine();

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
                'message' => 'This is a test message to verify SMTP delivery via contact submission.',
                'newsletter' => false,
                'status' => 'pending',
                'ip_address' => '127.0.0.1',
            ]);

            $this->info("✓ Test submission created (ID: {$submission->id})");

            event(new ContactSubmissionCreated($submission));
            $this->info('✓ Event dispatched');

            $this->info('Processing queue...');
            $this->call('queue:work', ['--once' => true, '--timeout' => 10]);

            $this->info('✓ Queue processed');
        } catch (\Exception $e) {
            $this->error('✗ Contact submission test failed: ' . $e->getMessage());
            return 1;
        }

        $this->newLine();
        $this->info('✅ All tests complete!');
        $this->info('Check the recipient inbox for:');
        $this->info('  1. "SMTP Direct Test - CAMS Services"');
        $this->info('  2. "New Contact Request: Test User"');

        return 0;
    }
}
