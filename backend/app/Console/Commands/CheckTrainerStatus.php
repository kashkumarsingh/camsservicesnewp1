<?php

namespace App\Console\Commands;

use App\Models\Trainer;
use App\Models\TrainerApplication;
use Illuminate\Console\Command;

class CheckTrainerStatus extends Command
{
    protected $signature = 'trainers:check-status';

    protected $description = 'Check trainer applications and trainers status';

    public function handle(): int
    {
        $this->info('📊 Database Status:');
        $this->info('─────────────────────────────────────────');
        
        $totalApps = TrainerApplication::count();
        $approvedApps = TrainerApplication::where('status', TrainerApplication::STATUS_APPROVED)->count();
        $appsWithTrainer = TrainerApplication::whereNotNull('trainer_id')->count();
        $totalTrainers = Trainer::count();
        
        $this->table(
            ['Metric', 'Count'],
            [
                ['Trainer Applications', $totalApps],
                ['Approved Applications', $approvedApps],
                ['Applications with Trainer ID', $appsWithTrainer],
                ['Trainers in Database', $totalTrainers],
            ]
        );
        
        $this->newLine();
        $this->info('📋 Application Details:');
        $this->info('─────────────────────────────────────────');
        
        $applications = TrainerApplication::all();
        
        if ($applications->isEmpty()) {
            $this->warn('No trainer applications found.');
        } else {
            foreach ($applications as $app) {
                $trainerInfo = $app->trainer_id ? "Trainer ID: {$app->trainer_id}" : 'No Trainer';
                $this->info(sprintf(
                    'App #%d: %s - Status: %s - %s',
                    $app->id,
                    $app->fullName(),
                    $app->status,
                    $trainerInfo
                ));
            }
        }
        
        return self::SUCCESS;
    }
}
