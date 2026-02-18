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
        if (!Schema::hasTable('users')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // Extend enum to include editor (for existing MySQL installs)
            DB::statement(
                "ALTER TABLE users MODIFY COLUMN role " .
                "ENUM('parent', 'trainer', 'admin', 'super_admin', 'editor') " .
                "NOT NULL DEFAULT 'parent'"
            );
        } elseif ($driver === 'pgsql') {
            // Update CHECK constraint to include editor (PostgreSQL)
            try {
                DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role');
            } catch (\Throwable $e) {
                // Ignore if constraint does not exist; migration remains idempotent
            }

            DB::statement(
                "ALTER TABLE users ADD CONSTRAINT check_user_role " .
                "CHECK (role IN ('parent', 'trainer', 'admin', 'super_admin', 'editor'))"
            );

            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'parent'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // Revert enum to original set (without editor)
            DB::statement(
                "ALTER TABLE users MODIFY COLUMN role " .
                "ENUM('parent', 'trainer', 'admin', 'super_admin') " .
                "NOT NULL DEFAULT 'parent'"
            );
        } elseif ($driver === 'pgsql') {
            try {
                DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role');
            } catch (\Throwable $e) {
                // Ignore errors on rollback
            }

            DB::statement(
                "ALTER TABLE users ADD CONSTRAINT check_user_role " .
                "CHECK (role IN ('parent', 'trainer', 'admin', 'super_admin'))"
            );

            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'parent'");
        }
    }
};

