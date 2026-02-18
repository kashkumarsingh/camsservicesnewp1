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
        // Check if table exists before modifying
        if (!Schema::hasTable('pages')) {
            return;
        }
        
        $driver = DB::getDriverName();
        
        // SQLite doesn't support MODIFY COLUMN or ENUM
        // For testing, we can skip this as SQLite handles types more flexibly
        if ($driver === 'sqlite') {
            return;
        }
        
        // PostgreSQL uses CHECK constraints for ENUM-like behavior
        // Laravel's enum() creates a CHECK constraint, not a true ENUM type
        if ($driver === 'pgsql') {
            try {
                // Get all CHECK constraints on the type column
                $constraints = DB::select("
                    SELECT constraint_name 
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu 
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'pages' 
                        AND tc.constraint_type = 'CHECK'
                        AND ccu.column_name = 'type'
                ");
                
                // Drop existing constraints
                foreach ($constraints as $constraint) {
                    DB::statement("ALTER TABLE pages DROP CONSTRAINT IF EXISTS " . $constraint->constraint_name);
                }
                
                // Recreate with 'home' included
                DB::statement("
                    ALTER TABLE pages 
                    ADD CONSTRAINT pages_type_check 
                    CHECK (type IN (
                        'home',
                        'about',
                        'privacy-policy',
                        'terms-of-service',
                        'cancellation-policy',
                        'cookie-policy',
                        'payment-refund-policy',
                        'safeguarding-policy',
                        'other'
                    ))
                ");
            } catch (\Exception $e) {
                // If constraint already exists or includes 'home', that's fine
                // This makes the migration idempotent
                if (str_contains($e->getMessage(), 'already exists') || 
                    str_contains($e->getMessage(), 'duplicate') ||
                    str_contains($e->getMessage(), 'constraint')) {
                    // Constraint might already allow 'home', skip
                    return;
                }
                // Re-throw if it's a different error
                throw $e;
            }
            return;
        }
        
        // MySQL/MariaDB - use MODIFY COLUMN
        try {
            DB::statement("
                ALTER TABLE pages
                MODIFY COLUMN type ENUM(
                    'home',
                    'about',
                    'privacy-policy',
                    'terms-of-service',
                    'cancellation-policy',
                    'cookie-policy',
                    'payment-refund-policy',
                    'safeguarding-policy',
                    'other'
                ) NOT NULL DEFAULT 'other'
            ");
        } catch (\Exception $e) {
            // If enum already includes 'home', migration is already applied
            if (str_contains($e->getMessage(), 'Duplicate value') || 
                str_contains($e->getMessage(), 'already exists') ||
                str_contains($e->getMessage(), 'Duplicate entry')) {
                return;
            }
            throw $e;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        
        // SQLite doesn't support MODIFY COLUMN
        if ($driver === 'sqlite') {
            return;
        }
        
        // Update any 'home' pages to 'other' before removing the value
        DB::statement("UPDATE pages SET type = 'other' WHERE type = 'home'");

        if ($driver === 'pgsql') {
            // PostgreSQL: Drop and recreate constraint without 'home'
            try {
                // Get all CHECK constraints on the type column
                $constraints = DB::select("
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE table_name = 'pages' 
                    AND constraint_type = 'CHECK'
                    AND constraint_name LIKE '%type%'
                ");
                
                foreach ($constraints as $constraint) {
                    DB::statement("ALTER TABLE pages DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
                }
                
                // Recreate without 'home'
                DB::statement("
                    ALTER TABLE pages 
                    ADD CONSTRAINT pages_type_check 
                    CHECK (type IN (
                        'about',
                        'privacy-policy',
                        'terms-of-service',
                        'cancellation-policy',
                        'cookie-policy',
                        'payment-refund-policy',
                        'safeguarding-policy',
                        'other'
                    ))
                ");
            } catch (\Exception $e) {
                \Log::warning('Could not rollback pages.type constraint', ['error' => $e->getMessage()]);
            }
            return;
        }

        // MySQL/MariaDB
        DB::statement("
            ALTER TABLE pages
            MODIFY COLUMN type ENUM(
                'about',
                'privacy-policy',
                'terms-of-service',
                'cancellation-policy',
                'cookie-policy',
                'payment-refund-policy',
                'safeguarding-policy',
                'other'
            ) NOT NULL DEFAULT 'other'
        ");
    }
};


