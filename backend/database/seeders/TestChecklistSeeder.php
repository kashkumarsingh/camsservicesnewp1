<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\ChildChecklist;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestChecklistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create parent user
        $user = User::create([
            'name' => 'Test Parent Checklist',
            'email' => 'test-parent-checklist@example.com',
            'password' => Hash::make('password123'),
            'role' => 'parent',
            'approval_status' => 'approved',
            'approved_at' => now(),
        ]);

        // Create child
        $child = Child::create([
            'user_id' => $user->id,
            'name' => 'Test Child Checklist',
            'age' => 10,
            'date_of_birth' => now()->subYears(10)->format('Y-m-d'),
            'gender' => 'male',
            'approval_status' => 'pending', // Will be approved after checklist is completed
        ]);

        // Create checklist for the child
        $checklist = ChildChecklist::create([
            'child_id' => $child->id,
            'medical_conditions' => 'Mild asthma (controlled with inhaler)',
            'allergies' => 'Peanuts, Dairy',
            'medications' => 'Ventolin inhaler (as needed)',
            'dietary_requirements' => 'Lactose-free diet',
            'emergency_contact_name' => 'Jane Smith',
            'emergency_contact_relationship' => 'Mother',
            'emergency_contact_phone' => '07123456789',
            'emergency_contact_phone_alt' => '02012345678',
            'emergency_contact_address' => '123 Test Street, London, SW1A 1AA',
            'special_needs' => 'None reported',
            'behavioral_notes' => 'Very active, loves outdoor activities',
            'activity_restrictions' => 'No high-intensity activities during asthma flare-ups',
            'consent_photography' => true,
            'consent_medical_treatment' => true,
            'checklist_completed' => false, // Admin needs to mark as completed
        ]);

        $this->command->info('✅ Test checklist data created!');
        $this->command->info('');
        $this->command->info('📋 Test Account Details:');
        $this->command->info('  Parent Email: test-parent-checklist@example.com');
        $this->command->info('  Password: password123');
        $this->command->info('  Login at: http://localhost:4300/login');
        $this->command->info('');
        $this->command->info('📝 Next Steps:');
        $this->command->info('  1. Login as admin at http://localhost:9080/admin');
        $this->command->info('  2. Go to "Child Checklists" → View the checklist');
        $this->command->info('  3. Mark it as "Completed"');
        $this->command->info('  4. Go to "Children" → View the child');
        $this->command->info('  5. Click "Approve Child" (button will be enabled)');
    }
}

