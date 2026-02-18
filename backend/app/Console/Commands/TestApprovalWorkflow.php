<?php

namespace App\Console\Commands;

use App\Models\Trainer;
use App\Models\TrainerApplication;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TestApprovalWorkflow extends Command
{
    protected $signature = 'test:approval-workflow';

    protected $description = 'Test the complete trainer approval workflow';

    public function handle(): int
    {
        $this->info('🧪 Testing Trainer Approval Workflow');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        try {
            DB::transaction(function () {
                // STEP 1: Create test application
                $this->info('STEP 1: Creating test trainer application...');
                
                $application = TrainerApplication::create([
                    'first_name' => 'Test',
                    'last_name' => 'Trainer',
                    'email' => 'test.workflow@example.com',
                    'phone' => '07700900123',
                    'bio' => 'Test trainer bio for workflow testing',
                    'experience_years' => 5,
                    'excluded_activity_ids' => [1, 2, 3], // Exclude some activities
                    'exclusion_reason' => 'Test exclusion reason',
                    'certifications' => ['First Aid', 'DBS Check'],
                    'postcode' => 'SW1A 1AA',
                    'address_line_one' => '123 Test Street',
                    'travel_radius_km' => 10,
                    'service_area_postcodes' => ['SW1A', 'SW1B'],
                    'preferred_age_groups' => ['5-7', '8-11'],
                    'availability_preferences' => ['weekdays', 'mornings'],
                    'has_dbs_check' => true,
                    'dbs_number' => 'TEST123456',
                    'has_insurance' => true,
                    'status' => TrainerApplication::STATUS_SUBMITTED,
                ]);
                
                $this->info("   ✅ Application created (ID: {$application->id})");
                $this->info("   Status: {$application->status}");
                $this->info("   Trainer ID: " . ($application->trainer_id ?? 'NULL'));
                $this->newLine();

                // STEP 2: Count before approval
                $this->info('STEP 2: Checking counts BEFORE approval...');
                $trainersBefore = Trainer::count();
                $usersBefore = User::where('role', 'trainer')->count();
                $this->info("   Trainers: {$trainersBefore}");
                $this->info("   Trainer Users: {$usersBefore}");
                $this->newLine();

                // STEP 3: Approve application
                $this->info('STEP 3: Approving application...');
                
                // Create admin user for testing
                $admin = User::firstOrCreate(
                    ['email' => 'admin@test.com'],
                    [
                        'name' => 'Test Admin',
                        'password' => bcrypt('password'),
                        'role' => 'admin',
                        'email_verified_at' => now(),
                    ]
                );
                
                // Call approve() method
                $trainer = $application->approve($admin, 'Test approval', true);
                
                $this->info("   ✅ Application approved!");
                $this->info("   Trainer created (ID: {$trainer->id})");
                $this->info("   Trainer name: {$trainer->name}");
                $this->newLine();

                // STEP 4: Verify application updated
                $this->info('STEP 4: Verifying application updated...');
                $application->refresh();
                $this->info("   Status: {$application->status}");
                $this->info("   Trainer ID: {$application->trainer_id}");
                $this->info("   Reviewed by: {$application->reviewed_by}");
                
                if ($application->status === TrainerApplication::STATUS_APPROVED && $application->trainer_id === $trainer->id) {
                    $this->info('   ✅ Application correctly updated!');
                } else {
                    $this->error('   ❌ Application NOT updated correctly!');
                }
                $this->newLine();

                // STEP 5: Verify trainer created
                $this->info('STEP 5: Verifying trainer created in database...');
                $trainerCheck = Trainer::find($trainer->id);
                
                if ($trainerCheck) {
                    $this->info('   ✅ Trainer exists in trainers table!');
                    $this->table(
                        ['Field', 'Value'],
                        [
                            ['ID', $trainerCheck->id],
                            ['Name', $trainerCheck->name],
                            ['Slug', $trainerCheck->slug],
                            ['Role', $trainerCheck->role],
                            ['Active', $trainerCheck->is_active ? 'Yes' : 'No'],
                            ['Excluded Activities', count($trainerCheck->excluded_activity_ids ?? [])],
                            ['Experience Years', $trainerCheck->experience_years],
                        ]
                    );
                } else {
                    $this->error('   ❌ Trainer NOT found in database!');
                }
                $this->newLine();

                // STEP 6: Count after approval
                $this->info('STEP 6: Checking counts AFTER approval...');
                $trainersAfter = Trainer::count();
                $usersAfter = User::where('role', 'trainer')->count();
                $trainersDiff = $trainersAfter - $trainersBefore;
                $usersDiff = $usersAfter - $usersBefore;
                $this->info("   Trainers: {$trainersAfter} (+{$trainersDiff})");
                $this->info("   Trainer Users: {$usersAfter} (+{$usersDiff})");
                $this->newLine();

                // STEP 7: Summary
                $this->info('═══════════════════════════════════════════');
                $this->info('📊 WORKFLOW TEST RESULTS:');
                $this->info('═══════════════════════════════════════════');
                
                $success = true;
                
                if ($application->status === TrainerApplication::STATUS_APPROVED) {
                    $this->info('✅ Application status updated to approved');
                } else {
                    $this->error('❌ Application status NOT approved');
                    $success = false;
                }
                
                if ($application->trainer_id === $trainer->id) {
                    $this->info('✅ Application linked to trainer');
                } else {
                    $this->error('❌ Application NOT linked to trainer');
                    $success = false;
                }
                
                if ($trainerCheck) {
                    $this->info('✅ Trainer created in trainers table');
                } else {
                    $this->error('❌ Trainer NOT in trainers table');
                    $success = false;
                }
                
                if ($trainersAfter > $trainersBefore) {
                    $this->info('✅ Trainer count increased');
                } else {
                    $this->error('❌ Trainer count did NOT increase');
                    $success = false;
                }
                
                $this->newLine();
                
                if ($success) {
                    $this->info('🎉 ALL TESTS PASSED! Workflow works perfectly!');
                } else {
                    $this->error('❌ TESTS FAILED! Workflow has issues!');
                }
                
                // Rollback transaction (don't keep test data)
                throw new \Exception('Rolling back test data...');
            });
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Rolling back test data...') {
                $this->newLine();
                $this->info('🔄 Test data rolled back (transaction cancelled)');
                $this->info('✅ No test data left in database');
            } else {
                $this->error("Test failed with error: {$e->getMessage()}");
                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }
}
