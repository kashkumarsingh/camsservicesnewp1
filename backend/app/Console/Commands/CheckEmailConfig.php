<?php

namespace App\Console\Commands;

use App\Models\ContactSubmission;
use App\Models\SiteSetting;
use Illuminate\Console\Command;

class CheckEmailConfig extends Command
{
    protected $signature = 'check:email-config';
    protected $description = 'Check email configuration and recent submissions';

    public function handle(): int
    {
        $this->info('Checking email configuration...');
        $this->newLine();

        // Check support emails
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
            $this->error('❌ No support emails configured!');
            $this->warn('   Please add at least one email in Admin dashboard > Site Settings > Support Notifications');
            $this->warn('   Raw data structure: ' . json_encode($rawEmails));
        } else {
            $this->info('✓ Support emails configured: ' . implode(', ', $emails));
        }

        $this->newLine();

        // Check mail config
        $this->info('Mail Configuration:');
        $this->info('  MAILER: ' . config('mail.default'));
        $this->info('  HOST: ' . config('mail.mailers.smtp.host'));
        $this->info('  PORT: ' . config('mail.mailers.smtp.port'));
        $this->info('  ENCRYPTION: ' . (config('mail.mailers.smtp.encryption') ?: 'null'));
        $this->info('  USERNAME: ' . config('mail.mailers.smtp.username'));
        $this->info('  FROM: ' . config('mail.from.address'));

        $this->newLine();

        // Check recent submissions
        $submissions = ContactSubmission::orderBy('id', 'desc')->limit(5)->get();
        $this->info('Recent Contact Submissions: ' . $submissions->count());
        foreach ($submissions as $submission) {
            $this->line("  - ID: {$submission->id}, Name: {$submission->name}, Created: {$submission->created_at}");
        }

        $this->newLine();

        // Check queue
        $this->info('Queue Configuration:');
        $this->info('  CONNECTION: ' . config('queue.default'));
        $queueCount = \DB::table('jobs')->count();
        $this->info('  Pending Jobs: ' . $queueCount);

        if ($queueCount > 0) {
            $this->warn('  ⚠ There are ' . $queueCount . ' pending jobs. Run: php artisan queue:work');
        }

        return 0;
    }
}

