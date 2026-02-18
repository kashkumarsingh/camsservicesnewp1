<?php

namespace Database\Seeders;

use App\Models\NewsletterSubscription;
use Illuminate\Database\Seeder;

/**
 * Newsletter Subscription Seeder
 * 
 * Clean Architecture: Infrastructure Layer (Data Seeding)
 * Purpose: Creates sample newsletter subscriptions for testing
 * Location: backend/database/seeders/NewsletterSubscriptionSeeder.php
 */
class NewsletterSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subscriptions = [
            [
                'email' => 'sarah.johnson@example.com',
                'name' => 'Sarah Johnson',
                'active' => true,
                'subscribed_at' => now()->subDays(30),
                'unsubscribed_at' => null,
                'ip_address' => '192.168.1.100',
                'source' => 'contact_form',
            ],
            [
                'email' => 'michael.chen@example.com',
                'name' => 'Michael Chen',
                'active' => true,
                'subscribed_at' => now()->subDays(15),
                'unsubscribed_at' => null,
                'ip_address' => '192.168.1.101',
                'source' => 'homepage',
            ],
            [
                'email' => 'emma.williams@example.com',
                'name' => 'Emma Williams',
                'active' => true,
                'subscribed_at' => now()->subDays(7),
                'unsubscribed_at' => null,
                'ip_address' => '192.168.1.102',
                'source' => 'contact_form',
            ],
            [
                'email' => 'david.brown@example.com',
                'name' => 'David Brown',
                'active' => false,
                'subscribed_at' => now()->subDays(60),
                'unsubscribed_at' => now()->subDays(30),
                'ip_address' => '192.168.1.103',
                'source' => 'footer',
            ],
            [
                'email' => 'lisa.anderson@example.com',
                'name' => 'Lisa Anderson',
                'active' => true,
                'subscribed_at' => now()->subDays(3),
                'unsubscribed_at' => null,
                'ip_address' => '192.168.1.104',
                'source' => 'blog',
            ],
            [
                'email' => 'james.taylor@example.com',
                'name' => 'James Taylor',
                'active' => true,
                'subscribed_at' => now()->subDays(1),
                'unsubscribed_at' => null,
                'ip_address' => '192.168.1.105',
                'source' => 'homepage',
            ],
            [
                'email' => 'sophie.martin@example.com',
                'name' => 'Sophie Martin',
                'active' => true,
                'subscribed_at' => now()->subDays(45),
                'unsubscribed_at' => null,
                'ip_address' => '192.168.1.106',
                'source' => 'contact_form',
            ],
        ];

        $created = 0;
        $skipped = 0;

        foreach ($subscriptions as $subscription) {
            $existing = NewsletterSubscription::where('email', $subscription['email'])->first();
            
            if ($existing) {
                // Update existing subscription
                $existing->update($subscription);
                $skipped++;
            } else {
                // Create new subscription
                NewsletterSubscription::create($subscription);
                $created++;
            }
        }

        $this->command->info("✅ Newsletter subscriptions: {$created} created, {$skipped} updated.");
    }
}

