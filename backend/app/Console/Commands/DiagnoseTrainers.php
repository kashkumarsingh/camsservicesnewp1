<?php

namespace App\Console\Commands;

use App\Models\Trainer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DiagnoseTrainers extends Command
{
    protected $signature = 'trainers:diagnose';

    protected $description = 'Diagnose why trainers are not showing in admin panel';

    public function handle(): int
    {
        $this->info('🔍 Diagnosing Trainers Display Issue');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        // 1. Raw database query
        $this->info('1️⃣  Raw Database Query (DB::table):');
        $rawCount = DB::table('trainers')->count();
        $this->info("   Count: {$rawCount}");
        
        if ($rawCount > 0) {
            $rawTrainers = DB::table('trainers')->get();
            foreach ($rawTrainers as $trainer) {
                $this->info("   - ID: {$trainer->id}, Name: {$trainer->name}, Active: " . ($trainer->is_active ? 'Yes' : 'No'));
            }
        }
        $this->newLine();

        // 2. Eloquent query (no scopes)
        $this->info('2️⃣  Eloquent Query (Trainer::query()):');
        $eloquentCount = Trainer::query()->count();
        $this->info("   Count: {$eloquentCount}");
        
        if ($eloquentCount > 0) {
            $eloquentTrainers = Trainer::query()->get();
            foreach ($eloquentTrainers as $trainer) {
                $this->info("   - ID: {$trainer->id}, Name: {$trainer->name}, Active: " . ($trainer->is_active ? 'Yes' : 'No'));
            }
        }
        $this->newLine();

        // 3. Check for global scopes
        $this->info('3️⃣  Global Scopes Check:');
        $model = new Trainer();
        $scopes = $model->getGlobalScopes();
        if (empty($scopes)) {
            $this->info('   No global scopes found ✅');
        } else {
            $this->warn('   Global scopes found:');
            foreach ($scopes as $name => $scope) {
                $this->warn("   - {$name}: " . get_class($scope));
            }
        }
        $this->newLine();

        // 4. Check table structure
        $this->info('4️⃣  Table Structure:');
        $columns = DB::select('DESCRIBE trainers');
        $this->table(
            ['Field', 'Type', 'Null', 'Key', 'Default'],
            array_map(fn($col) => [
                $col->Field,
                $col->Type,
                $col->Null,
                $col->Key ?? '',
                $col->Default ?? 'NULL'
            ], $columns)
        );
        $this->newLine();

        // 5. Comparison
        $this->info('5️⃣  Summary:');
        if ($rawCount === $eloquentCount) {
            $this->info("   ✅ Raw and Eloquent counts match ({$rawCount} trainers)");
        } else {
            $this->error("   ❌ Mismatch! Raw: {$rawCount}, Eloquent: {$eloquentCount}");
            $this->error('   This indicates a global scope or model issue');
        }

        return self::SUCCESS;
    }
}
