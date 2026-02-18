<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fixes the pages_type_check constraint to include 'home' type.
     * This migration is idempotent and safe to run multiple times.
     */
    public function up(): void
    {
        // Only run for PostgreSQL
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Check if table exists
        if (!Schema::hasTable('pages')) {
            return;
        }

        try {
            // Find ALL check constraints on the pages table that involve the 'type' column
            // PostgreSQL might name them differently (e.g., pages_type_check, pages_type_check1, etc.)
            $constraints = DB::select("
                SELECT 
                    tc.constraint_name,
                    cc.check_clause
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu 
                    ON tc.constraint_name = ccu.constraint_name
                    AND tc.table_schema = ccu.table_schema
                LEFT JOIN information_schema.check_constraints cc
                    ON tc.constraint_name = cc.constraint_name
                    AND tc.table_schema = cc.constraint_schema
                WHERE tc.table_schema = 'public'
                    AND tc.table_name = 'pages' 
                    AND tc.constraint_type = 'CHECK'
                    AND ccu.column_name = 'type'
            ");

            // Drop all existing type check constraints
            foreach ($constraints as $constraint) {
                try {
                    DB::statement("ALTER TABLE pages DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
                } catch (\Exception $e) {
                    // Ignore errors - constraint might already be dropped
                }
            }

            // Recreate the constraint with 'home' included
            // Use IF NOT EXISTS pattern by checking if constraint already exists
            $constraintExists = DB::selectOne("
                SELECT 1 
                FROM information_schema.table_constraints 
                WHERE table_schema = 'public'
                    AND table_name = 'pages' 
                    AND constraint_name = 'pages_type_check'
                    AND constraint_type = 'CHECK'
            ");

            if (!$constraintExists) {
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
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the migration
            // This allows the migration to be idempotent
            \Log::warning('Could not update pages_type_check constraint', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // If it's not a "constraint already exists" error, re-throw
            if (!str_contains($e->getMessage(), 'already exists') && 
                !str_contains($e->getMessage(), 'duplicate') &&
                !str_contains($e->getMessage(), 'does not exist')) {
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't rollback - this is a fix migration
        // The original migration should handle rollback if needed
    }
};

