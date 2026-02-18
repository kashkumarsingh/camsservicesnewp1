<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetUserPassword extends Command
{
    protected $signature = 'user:reset-password {email} {password}';

    protected $description = 'Reset user password';

    public function handle(): int
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("❌ User not found: {$email}");
            return self::FAILURE;
        }

        // Update password and verify email
        $user->password = Hash::make($password);
        $user->email_verified_at = now();
        $user->save();

        $this->info("✅ Password reset successful!");
        $this->newLine();
        $this->info("User can now login with:");
        $this->info("📧 Email: {$email}");
        $this->info("🔐 Password: {$password}");

        return self::SUCCESS;
    }
}
