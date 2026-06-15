<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckEmailDeliverability extends Command
{
    protected $signature = 'check:email-deliverability {domain=camsservices.co.uk}';
    protected $description = 'Check SPF/DKIM/DMARC DNS and mail config for inbox placement';

    public function handle(): int
    {
        $domain = $this->argument('domain');
        $this->info("Email deliverability check for {$domain}");
        $this->newLine();

        $issues = 0;

        // App config
        $this->info('Application mail settings:');
        $localDomain = config('mail.mailers.smtp.local_domain');
        $from = config('mail.from.address');
        $this->line('  EHLO / local_domain: ' . ($localDomain ?: '(empty)'));
        $this->line('  From address: ' . $from);
        $this->line('  SMTP host: ' . config('mail.mailers.smtp.host'));

        if ($localDomain === 'localhost' || blank($localDomain)) {
            $this->error('  ✗ MAIL_EHLO_DOMAIN must be set to your domain (e.g. camsservices.co.uk), not localhost');
            $issues++;
        } else {
            $this->info('  ✓ EHLO domain looks correct');
        }

        if ($from && ! str_ends_with(strtolower($from), '@' . strtolower($domain))) {
            $this->warn('  ⚠ From address domain does not match checked domain');
        }

        $this->newLine();

        // SPF
        $this->info('SPF (TXT on ' . $domain . '):');
        $spfRecords = @dns_get_record($domain, DNS_TXT) ?: [];
        $spf = collect($spfRecords)
            ->pluck('txt')
            ->filter(fn ($t) => is_string($t) && str_starts_with($t, 'v=spf1'))
            ->values();

        if ($spf->isEmpty()) {
            $this->error('  ✗ No SPF record found');
            $issues++;
        } else {
            foreach ($spf as $record) {
                $this->line('  ' . $record);
                if (! str_contains($record, 'spf.protection.outlook.com') && config('mail.mailers.smtp.host') === 'smtp.office365.com') {
                    $this->error('  ✗ SPF must include: include:spf.protection.outlook.com (you send via Microsoft 365)');
                    $this->warn('    Fix at your DNS host (e.g. GoDaddy):');
                    $this->warn('    v=spf1 include:spf.protection.outlook.com include:secureserver.net -all');
                    $issues++;
                } else {
                    $this->info('  ✓ SPF includes Microsoft 365');
                }
            }
        }

        $this->newLine();

        // DKIM
        $this->info('DKIM (CNAME records):');
        $dkimOk = false;
        foreach (['selector1._domainkey', 'selector2._domainkey'] as $selector) {
            $host = $selector . '.' . $domain;
            $cnames = @dns_get_record($host, DNS_CNAME) ?: [];
            if (empty($cnames)) {
                $this->error("  ✗ Missing CNAME: {$host}");
            } else {
                $this->info("  ✓ {$host} → " . ($cnames[0]['target'] ?? '?'));
                $dkimOk = true;
            }
        }
        if (! $dkimOk) {
            $issues++;
            $this->warn('  Enable DKIM in Microsoft 365 Defender → Email & collaboration → Policies → DKIM');
            $this->warn('  Add the two CNAME records Microsoft provides, then turn signing ON.');
        }

        $this->newLine();

        // DMARC
        $this->info('DMARC (TXT on _dmarc.' . $domain . '):');
        $dmarcHost = '_dmarc.' . $domain;
        $dmarcRecords = @dns_get_record($dmarcHost, DNS_TXT) ?: [];
        $dmarc = collect($dmarcRecords)
            ->pluck('txt')
            ->filter(fn ($t) => is_string($t) && str_starts_with($t, 'v=DMARC1'))
            ->first();

        if (! $dmarc) {
            $this->error('  ✗ No DMARC record found');
            $this->warn('  Add TXT on _dmarc.' . $domain . ':');
            $this->warn('  v=DMARC1; p=none; rua=mailto:info@camsservices.co.uk; adkim=r; aspf=r');
            $issues++;
        } else {
            $this->info('  ✓ ' . $dmarc);
        }

        $this->newLine();

        if ($issues > 0) {
            $this->error("Found {$issues} issue(s). Until DNS is fixed, mail may land in junk/spam.");
            $this->newLine();
            $this->line('After updating DNS, wait 15–60 minutes for propagation, then re-run this command.');
            return 1;
        }

        $this->info('All checks passed. Mail should reach the inbox if content and volume are normal.');
        return 0;
    }
}
