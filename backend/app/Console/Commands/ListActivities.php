<?php

namespace App\Console\Commands;

use App\Models\Activity;
use Illuminate\Console\Command;

class ListActivities extends Command
{
    protected $signature = 'list:activities {--inactive : Include inactive activities}';
    protected $description = 'List all activities';

    public function handle()
    {
        $query = Activity::query();

        if (!$this->option('inactive')) {
            $query->where('is_active', true);
        }

        $activities = $query->orderBy('id')->get();

        $this->table(
            ['ID', 'Name', 'Slug', 'Active'],
            $activities->map(fn($a) => [
                $a->id,
                $a->name,
                $a->slug,
                $a->is_active ? '✅' : '❌'
            ])
        );

        $this->info("Total activities: {$activities->count()}");
        $activeCount = $activities->where('is_active', true)->count();
        $this->info("Active: {$activeCount}, Inactive: " . ($activities->count() - $activeCount));
    }
}
