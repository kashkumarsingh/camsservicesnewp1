<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('packages', 'hours_per_week')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE packages ALTER COLUMN hours_per_week DROP DEFAULT');
            DB::statement('ALTER TABLE packages ALTER COLUMN hours_per_week TYPE NUMERIC(4,1) USING hours_per_week::NUMERIC(4,1)');
            DB::statement('ALTER TABLE packages ALTER COLUMN hours_per_week DROP NOT NULL');
        } elseif ($driver === 'sqlite') {
            // SQLite doesn't support MODIFY COLUMN
            // For testing, we can skip this as SQLite is more flexible with types
            // The column will work fine with the existing type in SQLite
            return;
        } else {
            // MySQL/MariaDB
            DB::statement('ALTER TABLE packages MODIFY hours_per_week DECIMAL(4,1) UNSIGNED NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('packages', 'hours_per_week')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE packages ALTER COLUMN hours_per_week TYPE SMALLINT USING ROUND(hours_per_week)');
        } elseif ($driver === 'sqlite') {
            // SQLite doesn't support MODIFY COLUMN
            // Skip rollback for SQLite (testing only)
            return;
        } else {
            // MySQL/MariaDB
            DB::statement('ALTER TABLE packages MODIFY hours_per_week TINYINT UNSIGNED NULL');
        }
    }
};

