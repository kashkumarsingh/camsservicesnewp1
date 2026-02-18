<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CheckUserAccount extends Command
{
    protected $signature = 'user:check {email}';

    protected $description = 'Check if user account exists';

    public function handle(): int
    {
        $email = $this->argument('email');
        
        $this->info('🔍 Checking User Account:');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        $user = User::where('email', $email)->first();
        
        if ($user) {
            $this->info('✅ User found!');
            $this->table(
                ['Field', 'Value'],
                [
                    ['ID', $user->id],
                    ['Name', $user->name],
                    ['Email', $user->email],
                    ['Role', $user->role ?? 'NULL'],
                    ['Approval Status', $user->approval_status ?? 'NULL'],
                    ['Email Verified', $user->email_verified_at ? 'Yes' : 'No'],
                    ['Created At', $user->created_at],
                    ['Updated At', $user->updated_at],
                ]
            );
        } else {
            $this->error('❌ User NOT found in database!');
            $this->newLine();
            $this->info('All users in database:');
            $users = User::all();
            if ($users->isEmpty()) {
                $this->warn('No users found in database.');
            } else {
                $this->table(
                    ['ID', 'Name', 'Email', 'Role'],
                    $users->map(fn($u) => [
                        $u->id,
                        $u->name,
                        $u->email,
                        $u->role ?? 'NULL'
                    ])->toArray()
                );
            }
        }

        return self::SUCCESS;
    }
}
