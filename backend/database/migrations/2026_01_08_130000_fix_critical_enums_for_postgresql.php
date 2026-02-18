<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix Critical ENUM Columns for PostgreSQL Compatibility
 * 
 * Purpose: Convert critical ENUM columns to PostgreSQL-compatible VARCHAR + CHECK constraints
 * Location: backend/database/migrations/2026_01_08_130000_fix_critical_enums_for_postgresql.php
 * 
 * Priority 1 Tables (Active in production flows):
 * - bookings: status, payment_status, payment_plan
 * - booking_schedules: status
 * - users: role
 * - children: gender, approval_status
 * 
 * Strategy: Convert ENUM → VARCHAR(50) + CHECK constraints
 * Only runs on PostgreSQL (MySQL ENUMs work fine)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only run on PostgreSQL
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Fix bookings table ENUMs
        $this->fixBookingsTable();
        
        // Fix booking_schedules table ENUMs
        $this->fixBookingSchedulesTable();
        
        // Fix users table ENUMs
        $this->fixUsersTable();
        
        // Fix children table ENUMs
        $this->fixChildrenTable();
    }

    /**
     * Fix bookings table ENUMs
     */
    private function fixBookingsTable(): void
    {
        if (!Schema::hasTable('bookings')) {
            return;
        }

        try {
            // Add temporary columns
            Schema::table('bookings', function (Blueprint $table) {
                if (!Schema::hasColumn('bookings', 'status_new')) {
                    $table->string('status_new', 50)->nullable();
                }
                if (!Schema::hasColumn('bookings', 'payment_status_new')) {
                    $table->string('payment_status_new', 50)->nullable();
                }
                if (!Schema::hasColumn('bookings', 'payment_plan_new')) {
                    $table->string('payment_plan_new', 50)->nullable();
                }
            });

            // Copy data
            DB::statement("UPDATE bookings SET status_new = status::text");
            DB::statement("UPDATE bookings SET payment_status_new = payment_status::text");
            DB::statement("UPDATE bookings SET payment_plan_new = payment_plan::text WHERE payment_plan IS NOT NULL");

            // Drop old columns
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn(['status', 'payment_status', 'payment_plan']);
            });

            // Rename new columns
            Schema::table('bookings', function (Blueprint $table) {
                $table->renameColumn('status_new', 'status');
                $table->renameColumn('payment_status_new', 'payment_status');
                $table->renameColumn('payment_plan_new', 'payment_plan');
            });

            // Add CHECK constraints
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT check_booking_status CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))");
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT check_booking_payment_status CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed'))");
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT check_booking_payment_plan CHECK (payment_plan IS NULL OR payment_plan IN ('full', 'installment'))");

            // Set defaults and NOT NULL
            DB::statement("ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'draft'");
            DB::statement("ALTER TABLE bookings ALTER COLUMN status SET NOT NULL");
            DB::statement("ALTER TABLE bookings ALTER COLUMN payment_status SET DEFAULT 'pending'");
            DB::statement("ALTER TABLE bookings ALTER COLUMN payment_status SET NOT NULL");
            // payment_plan stays nullable

        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    /**
     * Fix booking_schedules table ENUMs
     */
    private function fixBookingSchedulesTable(): void
    {
        if (!Schema::hasTable('booking_schedules')) {
            return;
        }

        try {
            // Add temporary column
            Schema::table('booking_schedules', function (Blueprint $table) {
                if (!Schema::hasColumn('booking_schedules', 'status_new')) {
                    $table->string('status_new', 50)->nullable();
                }
            });

            // Copy data
            DB::statement("UPDATE booking_schedules SET status_new = status::text");

            // Drop old column
            Schema::table('booking_schedules', function (Blueprint $table) {
                $table->dropColumn('status');
            });

            // Rename new column
            Schema::table('booking_schedules', function (Blueprint $table) {
                $table->renameColumn('status_new', 'status');
            });

            // Add CHECK constraint
            DB::statement("ALTER TABLE booking_schedules ADD CONSTRAINT check_booking_schedule_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'))");

            // Set default and NOT NULL
            DB::statement("ALTER TABLE booking_schedules ALTER COLUMN status SET DEFAULT 'scheduled'");
            DB::statement("ALTER TABLE booking_schedules ALTER COLUMN status SET NOT NULL");

        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    /**
     * Fix users table ENUMs
     */
    private function fixUsersTable(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        try {
            // Add temporary column
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'role_new')) {
                    $table->string('role_new', 50)->nullable();
                }
            });

            // Copy data
            DB::statement("UPDATE users SET role_new = role::text");

            // Drop old column
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });

            // Rename new column
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('role_new', 'role');
            });

            // Add CHECK constraint
            DB::statement("ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('parent', 'trainer', 'admin', 'super_admin'))");

            // Set default and NOT NULL
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'parent'");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET NOT NULL");

        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    /**
     * Fix children table ENUMs
     */
    private function fixChildrenTable(): void
    {
        if (!Schema::hasTable('children')) {
            return;
        }

        try {
            // Add temporary columns
            Schema::table('children', function (Blueprint $table) {
                if (!Schema::hasColumn('children', 'gender_new')) {
                    $table->string('gender_new', 50)->nullable();
                }
                if (!Schema::hasColumn('children', 'approval_status_new')) {
                    $table->string('approval_status_new', 50)->nullable();
                }
            });

            // Copy data
            DB::statement("UPDATE children SET gender_new = gender::text WHERE gender IS NOT NULL");
            DB::statement("UPDATE children SET approval_status_new = approval_status::text");

            // Drop old columns
            Schema::table('children', function (Blueprint $table) {
                $table->dropColumn(['gender', 'approval_status']);
            });

            // Rename new columns
            Schema::table('children', function (Blueprint $table) {
                $table->renameColumn('gender_new', 'gender');
                $table->renameColumn('approval_status_new', 'approval_status');
            });

            // Add CHECK constraints
            DB::statement("ALTER TABLE children ADD CONSTRAINT check_child_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say'))");
            DB::statement("ALTER TABLE children ADD CONSTRAINT check_child_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected'))");

            // Set defaults
            DB::statement("ALTER TABLE children ALTER COLUMN approval_status SET DEFAULT 'pending'");
            DB::statement("ALTER TABLE children ALTER COLUMN approval_status SET NOT NULL");
            // gender stays nullable

        } catch (\Exception $e) {
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
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            // Remove CHECK constraints
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_booking_status');
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_booking_payment_status');
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_booking_payment_plan');
            
            DB::statement('ALTER TABLE booking_schedules DROP CONSTRAINT IF EXISTS check_booking_schedule_status');
            
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role');
            
            DB::statement('ALTER TABLE children DROP CONSTRAINT IF EXISTS check_child_gender');
            DB::statement('ALTER TABLE children DROP CONSTRAINT IF EXISTS check_child_approval_status');
        } catch (\Exception $e) {
            // Ignore errors during rollback
        }
    }
};
