<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class VerifyUserEmail extends Command
{
    protected $signature = 'user:verify-email {email}';

    protected $description = 'Manually verify user email and optionally reset password';

    public function handle(): int
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("❌ User not found: {$email}");
            return self::FAILURE;
        }

        $this->info("Found user: {$user->name} ({$user->email})");
        $this->newLine();

        // Verify email
        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();
            $this->info('✅ Email verified!');
        } else {
            $this->info('✅ Email already verified');
        }

        // Ask if they want to reset password
        if ($this->confirm('Do you want to reset the password?', false)) {
            $newPassword = $this->secret('Enter new password');
            $user->password = Hash::make($newPassword);
            $user->save();
            $this->info("✅ Password updated to: {$newPassword}");
        }

        $this->newLine();
        $this->info('User details:');
        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $user->id],
                ['Name', $user->name],
                ['Email', $user->email],
                ['Role', $user->role ?? 'NULL'],
                ['Email Verified', $user->email_verified_at ? 'Yes - ' . $user->email_verified_at : 'No'],
                ['Approval Status', $user->approval_status ?? 'NULL'],
            ]
        );

        return self::SUCCESS;
    }
}
