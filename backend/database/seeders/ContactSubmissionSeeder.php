<?php

namespace Database\Seeders;

use App\Models\ContactSubmission;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Contact Submission Seeder
 * 
 * Clean Architecture: Infrastructure Layer (Data Seeding)
 * Purpose: Creates sample contact form submissions for testing
 * Location: backend/database/seeders/ContactSubmissionSeeder.php
 */
class ContactSubmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'super_admin')->orWhere('role', 'admin')->first();

        $submissions = [
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'phone' => '07123456789',
                'address' => '123 High Street',
                'postal_code' => 'IG9 5AB',
                'child_age' => 8,
                'inquiry_type' => 'package',
                'inquiry_details' => 'Interested in the Mars package for my son who has autism.',
                'urgency' => 'exploring',
                'preferred_contact' => 'email',
                'message' => 'I would like to learn more about your SEN support services. My son is 8 years old and has been diagnosed with autism. We are looking for activities that can help with his social skills.',
                'newsletter' => true,
                'source_page' => '/packages',
                'status' => ContactSubmission::STATUS_PENDING,
                'assigned_to_id' => $admin?->id,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'phone' => '07987654321',
                'address' => '45 Oak Avenue',
                'postal_code' => 'E17 6CD',
                'child_age' => 12,
                'inquiry_type' => 'service',
                'inquiry_details' => 'Looking for trauma-informed mentoring for my daughter.',
                'urgency' => 'urgent',
                'preferred_contact' => 'phone',
                'message' => 'My daughter has experienced trauma and needs professional support. We need someone who can work with her on a regular basis.',
                'newsletter' => false,
                'source_page' => '/services',
                'status' => ContactSubmission::STATUS_IN_PROGRESS,
                'assigned_to_id' => $admin?->id,
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            ],
            [
                'name' => 'Emma Williams',
                'email' => 'emma.williams@example.com',
                'phone' => '07555123456',
                'address' => '78 Elm Road',
                'postal_code' => 'N4 3EF',
                'child_age' => 6,
                'inquiry_type' => 'general',
                'inquiry_details' => 'General questions about your services and availability.',
                'urgency' => 'exploring',
                'preferred_contact' => 'email',
                'message' => 'I would like to know more about your services and how they can help my child. We live in North London and are looking for local support.',
                'newsletter' => true,
                'source_page' => '/contact',
                'status' => ContactSubmission::STATUS_RESOLVED,
                'assigned_to_id' => $admin?->id,
                'ip_address' => '192.168.1.102',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            ],
            [
                'name' => 'David Brown',
                'email' => 'david.brown@example.com',
                'phone' => '07444111222',
                'address' => '12 Park Lane',
                'postal_code' => 'SW1A 1AA',
                'child_age' => 10,
                'inquiry_type' => 'package',
                'inquiry_details' => 'Interested in the Venus package.',
                'urgency' => 'soon',
                'preferred_contact' => 'phone',
                'message' => 'We are interested in the Venus package. Can you provide more information about scheduling and availability?',
                'newsletter' => true,
                'source_page' => '/packages/venus',
                'status' => ContactSubmission::STATUS_PENDING,
                'assigned_to_id' => null,
                'ip_address' => '192.168.1.103',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@example.com',
                'phone' => '07333111222',
                'address' => '90 Maple Street',
                'postal_code' => 'W1K 6AB',
                'child_age' => 14,
                'inquiry_type' => 'service',
                'inquiry_details' => 'Need SEN advocacy support for school meetings.',
                'urgency' => 'urgent',
                'preferred_contact' => 'email',
                'message' => 'I need help with SEN advocacy for upcoming school meetings. My child needs support with their educational plan.',
                'newsletter' => false,
                'source_page' => '/services',
                'status' => ContactSubmission::STATUS_IN_PROGRESS,
                'assigned_to_id' => $admin?->id,
                'ip_address' => '192.168.1.104',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
            ],
        ];

        foreach ($submissions as $submission) {
            ContactSubmission::create($submission);
        }

        $this->command->info('✅ Created ' . count($submissions) . ' contact submissions.');
    }
}

