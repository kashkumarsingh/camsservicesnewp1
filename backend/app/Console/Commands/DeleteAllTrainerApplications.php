<?php

namespace App\Console\Commands;

use App\Models\Trainer;
use App\Models\TrainerApplication;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DeleteAllTrainerApplications extends Command
{
    protected $signature = 'trainers:delete-all {--force : Skip confirmation}';

    protected $description = 'Delete all trainer applications, trainers, and associated users';

    public function handle(): int
    {
        $this->warn('⚠️  WARNING: This will delete ALL trainer data!');
        $this->newLine();

        // Count what will be deleted
        $applicationsCount = TrainerApplication::count();
        $trainersCount = Trainer::count();
        $trainerUsersCount = User::where('role', 'trainer')->count();

        $this->info('📊 Current Status:');
        $this->table(
            ['Item', 'Count'],
            [
                ['Trainer Applications', $applicationsCount],
                ['Trainers', $trainersCount],
                ['Trainer Users', $trainerUsersCount],
            ]
        );
        $this->newLine();

        if ($applicationsCount === 0 && $trainersCount === 0 && $trainerUsersCount === 0) {
            $this->info('✅ Nothing to delete. All clean!');
            return self::SUCCESS;
        }

        // Confirm deletion
        if (!$this->option('force')) {
            if (!$this->confirm('Are you sure you want to delete ALL trainer data?', false)) {
                $this->info('❌ Deletion cancelled.');
                return self::SUCCESS;
            }
        }

        $this->info('🗑️  Deleting trainer data...');
        $this->newLine();

        try {
            DB::transaction(function () {
                // 1. Delete all trainer applications (cascade will handle relationships)
                $deletedApps = TrainerApplication::count();
                TrainerApplication::query()->delete();
                $this->info("✅ Deleted {$deletedApps} trainer applications");

                // 2. Delete all trainers (cascade will handle relationships)
                $deletedTrainers = Trainer::count();
                Trainer::query()->delete();
                $this->info("✅ Deleted {$deletedTrainers} trainers");

                // 3. Delete all trainer users
                $deletedUsers = User::where('role', 'trainer')->count();
                User::where('role', 'trainer')->delete();
                $this->info("✅ Deleted {$deletedUsers} trainer users");
            });

            $this->newLine();
            $this->info('═══════════════════════════════════════════');
            $this->info('✅ All trainer data deleted successfully!');
            $this->info('═══════════════════════════════════════════');
            $this->info('You can now start fresh with new applications.');

        } catch (\Exception $e) {
            $this->error('❌ Error deleting data: ' . $e->getMessage());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
