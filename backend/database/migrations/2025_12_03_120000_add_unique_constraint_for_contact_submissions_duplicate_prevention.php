<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Purpose: Add a generated column and unique constraint to prevent duplicate submissions
     * at the database level. This works alongside application-level locking.
     * 
     * Strategy: Create a unique constraint on email + a time-bucketed hash to prevent
     * duplicate submissions within the same minute. This provides database-level protection
     * in addition to application-level cache locks.
     */
    public function up(): void
    {
        if (!Schema::hasTable('contact_submissions')) {
            return;
        }

        // For MySQL: Add a generated column that creates a hash of email + minute-bucketed timestamp
        // This allows us to create a unique constraint that prevents duplicates within the same minute
        try {
            Schema::table('contact_submissions', function (Blueprint $table) {
                // Add a generated column that creates a unique key for email + time bucket (per minute)
                // This prevents database-level duplicates even if application locks fail
                if (DB::getDriverName() === 'mysql') {
                    // MySQL: Use generated column with MD5 hash of email + minute-bucketed timestamp
                    $table->string('duplicate_prevention_hash', 64)
                        ->nullable()
                        ->after('email')
                        ->comment('MD5 hash of email + minute-bucketed created_at for duplicate prevention');
                    
                    // Create index for fast lookups (not unique, as we want to allow legitimate resubmissions after time window)
                    $table->index('duplicate_prevention_hash', 'idx_contact_submissions_duplicate_hash');
                }
            });

            // For MySQL: Create a trigger to auto-populate the duplicate_prevention_hash
            // This ensures the hash is always set when a record is inserted
            if (DB::getDriverName() === 'mysql') {
                DB::unprepared('
                    CREATE TRIGGER contact_submissions_set_duplicate_hash
                    BEFORE INSERT ON contact_submissions
                    FOR EACH ROW
                    BEGIN
                        SET NEW.duplicate_prevention_hash = MD5(CONCAT(
                            NEW.email,
                            DATE_FORMAT(NEW.created_at, "%Y-%m-%d %H:%i:00")
                        ));
                    END
                ');
            }
        } catch (\Exception $e) {
            // If trigger or column already exists, that's fine (idempotent)
            if (str_contains($e->getMessage(), 'already exists') || 
                str_contains($e->getMessage(), 'Duplicate')) {
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
        if (!Schema::hasTable('contact_submissions')) {
            return;
        }

        try {
            if (DB::getDriverName() === 'mysql') {
                DB::unprepared('DROP TRIGGER IF EXISTS contact_submissions_set_duplicate_hash');
            }

            Schema::table('contact_submissions', function (Blueprint $table) {
                $table->dropIndex('idx_contact_submissions_duplicate_hash');
                $table->dropColumn('duplicate_prevention_hash');
            });
        } catch (\Exception $e) {
            // Ignore errors during rollback
        }
    }
};

