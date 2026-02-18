<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix Contact Submissions ENUM Columns for PostgreSQL Compatibility
 * 
 * Purpose: Replace MySQL-style ENUM columns with PostgreSQL-compatible string + CHECK constraints
 * Location: backend/database/migrations/2026_01_08_120000_fix_contact_submissions_enums_for_postgresql.php
 * 
 * This migration fixes the same ENUM compatibility issue we had with booking_schedules.booked_by
 * PostgreSQL handles ENUMs differently than MySQL, causing transaction failures.
 * 
 * Converts:
 * - inquiry_type: ENUM → VARCHAR(50) + CHECK constraint
 * - urgency: ENUM → VARCHAR(50) + CHECK constraint
 * - preferred_contact: ENUM → VARCHAR(50) + CHECK constraint
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('contact_submissions')) {
            return;
        }

        // Check if we're on PostgreSQL (this migration is specifically for PostgreSQL)
        if (DB::getDriverName() !== 'pgsql') {
            return; // MySQL ENUMs work fine, no changes needed
        }

        // For PostgreSQL: Convert ENUM columns to VARCHAR + CHECK constraints
        // This provides the same validation but with better PostgreSQL compatibility
        
        try {
            // Step 1: Add new VARCHAR columns
            Schema::table('contact_submissions', function (Blueprint $table) {
                // Temporary columns with _new suffix
                if (!Schema::hasColumn('contact_submissions', 'inquiry_type_new')) {
                    $table->string('inquiry_type_new', 50)->nullable();
                }
                if (!Schema::hasColumn('contact_submissions', 'urgency_new')) {
                    $table->string('urgency_new', 50)->nullable();
                }
                if (!Schema::hasColumn('contact_submissions', 'preferred_contact_new')) {
                    $table->string('preferred_contact_new', 50)->nullable();
                }
            });

            // Step 2: Copy data from ENUM columns to new VARCHAR columns
            DB::statement("UPDATE contact_submissions SET inquiry_type_new = inquiry_type::text");
            DB::statement("UPDATE contact_submissions SET urgency_new = urgency::text");
            DB::statement("UPDATE contact_submissions SET preferred_contact_new = preferred_contact::text");

            // Step 3: Drop old ENUM columns
            Schema::table('contact_submissions', function (Blueprint $table) {
                $table->dropColumn(['inquiry_type', 'urgency', 'preferred_contact']);
            });

            // Step 4: Rename new columns to original names
            Schema::table('contact_submissions', function (Blueprint $table) {
                $table->renameColumn('inquiry_type_new', 'inquiry_type');
                $table->renameColumn('urgency_new', 'urgency');
                $table->renameColumn('preferred_contact_new', 'preferred_contact');
            });

            // Step 5: Add CHECK constraints for validation
            DB::statement("ALTER TABLE contact_submissions ADD CONSTRAINT check_inquiry_type CHECK (inquiry_type IN ('package', 'service', 'general', 'other'))");
            DB::statement("ALTER TABLE contact_submissions ADD CONSTRAINT check_urgency CHECK (urgency IN ('urgent', 'soon', 'exploring'))");
            DB::statement("ALTER TABLE contact_submissions ADD CONSTRAINT check_preferred_contact CHECK (preferred_contact IN ('email', 'phone', 'whatsapp'))");

            // Step 6: Set default values
            DB::statement("ALTER TABLE contact_submissions ALTER COLUMN inquiry_type SET DEFAULT 'general'");
            DB::statement("ALTER TABLE contact_submissions ALTER COLUMN urgency SET DEFAULT 'exploring'");
            DB::statement("ALTER TABLE contact_submissions ALTER COLUMN preferred_contact SET DEFAULT 'email'");

            // Step 7: Make columns NOT NULL (they were required before)
            DB::statement("ALTER TABLE contact_submissions ALTER COLUMN inquiry_type SET NOT NULL");
            DB::statement("ALTER TABLE contact_submissions ALTER COLUMN urgency SET NOT NULL");
            DB::statement("ALTER TABLE contact_submissions ALTER COLUMN preferred_contact SET NOT NULL");

        } catch (\Exception $e) {
            // Log error but don't fail migration (might already be converted)
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('contact_submissions')) {
            return;
        }

        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            // Remove CHECK constraints
            DB::statement('ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS check_inquiry_type');
            DB::statement('ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS check_urgency');
            DB::statement('ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS check_preferred_contact');

            // Note: Reverting to ENUM type on PostgreSQL is complex and not recommended
            // This migration is designed to be a one-way fix for production
        } catch (\Exception $e) {
            // Ignore errors during rollback
        }
    }
};
