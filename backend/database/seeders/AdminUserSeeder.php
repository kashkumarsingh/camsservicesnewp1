<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin credentials from environment variables (for Render/production)
        // Fallback to defaults for local development
        $adminEmail = env('ADMIN_EMAIL', 'admin@camsservice.co.uk');
        $adminPassword = env('ADMIN_PASSWORD', 'admin123');
        $adminName = env('ADMIN_NAME', 'CAMS Services Admin');
        
        // Validate that password is set (required for production)
        if (empty($adminPassword) || $adminPassword === 'admin123') {
            if (app()->environment('production')) {
                throw new \RuntimeException(
                    'ADMIN_PASSWORD environment variable must be set in production. ' .
                    'Please set a strong password in your Render environment variables.'
                );
            }
        }
        
        // Check if new admin user already exists
        $newAdmin = User::where('email', $adminEmail)->first();
        
        // Check if old admin user exists (for migration purposes)
        $oldAdmin = User::where('email', 'admin@kidzrunz.com')->first();
        
        if ($oldAdmin && !$newAdmin) {
            // Update old admin email to new one
            $oldAdmin->update([
                'email' => $adminEmail,
                'name' => $adminName,
                'role' => 'super_admin',
                'approval_status' => User::STATUS_APPROVED,
                'approved_at' => now(),
            ]);
        } elseif ($oldAdmin && $newAdmin && $oldAdmin->id !== $newAdmin->id) {
            // Both exist - delete old one and keep new one
            $oldAdmin->delete();
            $newAdmin->update([
                'name' => $adminName,
                'role' => 'super_admin',
                'approval_status' => User::STATUS_APPROVED,
                'approved_at' => now(),
            ]);
        } else {
            // Create new admin user if it doesn't exist
            // If user exists, update password if it's the default (allows password reset via env)
            $user = User::firstOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => $adminName,
                    'password' => Hash::make($adminPassword),
                    'role' => 'super_admin',
                    'email_verified_at' => now(),
                    'approval_status' => User::STATUS_APPROVED,
                    'approved_at' => now(),
                ]
            );
            
            // Update password if user exists and password is provided via env (allows password changes)
            if ($user->wasRecentlyCreated === false && !empty($adminPassword) && $adminPassword !== 'admin123') {
                $user->update([
                    'password' => Hash::make($adminPassword),
                    'name' => $adminName,
                    'role' => 'super_admin',
                    'approval_status' => User::STATUS_APPROVED,
                    'approved_at' => $user->approved_at ?? now(),
                ]);
            } elseif ($user->wasRecentlyCreated === false && $user->approval_status !== User::STATUS_APPROVED) {
                // Ensure existing admin is approved (fix for already-created admins)
                $user->update([
                    'approval_status' => User::STATUS_APPROVED,
                    'approved_at' => $user->approved_at ?? now(),
                ]);
            }
        }
    }
}
