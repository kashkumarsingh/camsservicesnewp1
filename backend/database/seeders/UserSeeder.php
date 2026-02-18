<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * User Seeder
 * 
 * Clean Architecture: Infrastructure Layer (Data Seeding)
 * Purpose: Creates sample regular users (parents) for testing
 * Location: backend/database/seeders/UserSeeder.php
 * 
 * Note: AdminUserSeeder creates admin users, this seeder creates regular parent users
 */
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'password' => Hash::make('password'),
                'phone' => '07123456789',
                'address' => '123 High Street',
                'postcode' => 'IG9 5AB',
                'role' => 'parent',
                'approval_status' => 'approved',
                'approved_at' => now(),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'password' => Hash::make('password'),
                'phone' => '07987654321',
                'address' => '45 Oak Avenue',
                'postcode' => 'E17 6CD',
                'role' => 'parent',
                'approval_status' => 'approved',
                'approved_at' => now(),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Emma Williams',
                'email' => 'emma.williams@example.com',
                'password' => Hash::make('password'),
                'phone' => '07555123456',
                'address' => '78 Elm Road',
                'postcode' => 'N4 3EF',
                'role' => 'parent',
                'approval_status' => 'approved',
                'approved_at' => now(),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'David Brown',
                'email' => 'david.brown@example.com',
                'password' => Hash::make('password'),
                'phone' => '07444111222',
                'address' => '12 Park Lane',
                'postcode' => 'SW1A 1AA',
                'role' => 'parent',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@example.com',
                'password' => Hash::make('password'),
                'phone' => '07333111222',
                'address' => '90 Maple Street',
                'postcode' => 'W1K 6AB',
                'role' => 'parent',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'James Taylor',
                'email' => 'james.taylor@example.com',
                'password' => Hash::make('password'),
                'phone' => '07222111222',
                'address' => '56 Pine Close',
                'postcode' => 'NW1 7GH',
                'role' => 'parent',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Sophie Martin',
                'email' => 'sophie.martin@example.com',
                'password' => Hash::make('password'),
                'phone' => '07111111222',
                'address' => '34 Cedar Way',
                'postcode' => 'SE1 8IJ',
                'role' => 'parent',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✅ Created ' . count($users) . ' regular users (parents).');
    }
}

