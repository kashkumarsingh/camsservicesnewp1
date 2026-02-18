<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix ALL Remaining ENUM Columns for PostgreSQL Compatibility
 * 
 * Purpose: Complete ENUM → VARCHAR + CHECK constraint conversion for all remaining tables
 * Location: backend/database/migrations/2026_01_08_140000_fix_all_remaining_enums_for_postgresql.php
 * 
 * This migration completes the PostgreSQL compatibility fix by converting ALL remaining ENUM columns.
 * 
 * Tables Fixed:
 * - booking_status_changes (4 ENUMs)
 * - booking_schedule_changes (3 ENUMs)
 * - booking_schedule_activities (1 ENUM)
 * - activity_logs (1 ENUM)
 * Note: booking_payments table was dropped in 2025_12_03_100002; payments table is used instead.
 * - packages (1 ENUM)
 * - activities (1 ENUM)
 * - testimonials (1 ENUM)
 * - trainer_notes (1 ENUM)
 * - review_sources (1 ENUM)
 * - pages (1 ENUM)
 * - users (approval_status, registration_source if exist)
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

        $this->fixBookingStatusChanges();
        $this->fixBookingScheduleChanges();
        $this->fixBookingScheduleActivities();
        $this->fixActivityLogs();
        $this->fixPackages();
        $this->fixActivities();
        $this->fixTestimonials();
        $this->fixTrainerNotes();
        $this->fixReviewSources();
        $this->fixPages();
        $this->fixUsersAdditional();
    }

    private function fixBookingStatusChanges(): void
    {
        if (!Schema::hasTable('booking_status_changes')) {
            return;
        }

        try {
            Schema::table('booking_status_changes', function (Blueprint $table) {
                $table->string('old_status_new', 50)->nullable();
                $table->string('new_status_new', 50)->nullable();
                $table->string('old_payment_status_new', 50)->nullable();
                $table->string('new_payment_status_new', 50)->nullable();
            });

            DB::statement("UPDATE booking_status_changes SET old_status_new = old_status::text WHERE old_status IS NOT NULL");
            DB::statement("UPDATE booking_status_changes SET new_status_new = new_status::text");
            DB::statement("UPDATE booking_status_changes SET old_payment_status_new = old_payment_status::text WHERE old_payment_status IS NOT NULL");
            DB::statement("UPDATE booking_status_changes SET new_payment_status_new = new_payment_status::text WHERE new_payment_status IS NOT NULL");

            Schema::table('booking_status_changes', function (Blueprint $table) {
                $table->dropColumn(['old_status', 'new_status', 'old_payment_status', 'new_payment_status']);
            });

            Schema::table('booking_status_changes', function (Blueprint $table) {
                $table->renameColumn('old_status_new', 'old_status');
                $table->renameColumn('new_status_new', 'new_status');
                $table->renameColumn('old_payment_status_new', 'old_payment_status');
                $table->renameColumn('new_payment_status_new', 'new_payment_status');
            });

            DB::statement("ALTER TABLE booking_status_changes ADD CONSTRAINT check_bsc_old_status CHECK (old_status IS NULL OR old_status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))");
            DB::statement("ALTER TABLE booking_status_changes ADD CONSTRAINT check_bsc_new_status CHECK (new_status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))");
            DB::statement("ALTER TABLE booking_status_changes ADD CONSTRAINT check_bsc_old_payment_status CHECK (old_payment_status IS NULL OR old_payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed'))");
            DB::statement("ALTER TABLE booking_status_changes ADD CONSTRAINT check_bsc_new_payment_status CHECK (new_payment_status IS NULL OR new_payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed'))");

            DB::statement("ALTER TABLE booking_status_changes ALTER COLUMN new_status SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixBookingScheduleChanges(): void
    {
        if (!Schema::hasTable('booking_schedule_changes')) {
            return;
        }

        try {
            Schema::table('booking_schedule_changes', function (Blueprint $table) {
                $table->string('change_type_new', 50)->nullable();
                $table->string('old_status_new', 50)->nullable();
                $table->string('new_status_new', 50)->nullable();
            });

            DB::statement("UPDATE booking_schedule_changes SET change_type_new = change_type::text");
            DB::statement("UPDATE booking_schedule_changes SET old_status_new = old_status::text WHERE old_status IS NOT NULL");
            DB::statement("UPDATE booking_schedule_changes SET new_status_new = new_status::text WHERE new_status IS NOT NULL");

            Schema::table('booking_schedule_changes', function (Blueprint $table) {
                $table->dropColumn(['change_type', 'old_status', 'new_status']);
            });

            Schema::table('booking_schedule_changes', function (Blueprint $table) {
                $table->renameColumn('change_type_new', 'change_type');
                $table->renameColumn('old_status_new', 'old_status');
                $table->renameColumn('new_status_new', 'new_status');
            });

            DB::statement("ALTER TABLE booking_schedule_changes ADD CONSTRAINT check_bschc_change_type CHECK (change_type IN ('reschedule', 'cancel', 'complete', 'no_show', 'status_change'))");
            DB::statement("ALTER TABLE booking_schedule_changes ADD CONSTRAINT check_bschc_old_status CHECK (old_status IS NULL OR old_status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'))");
            DB::statement("ALTER TABLE booking_schedule_changes ADD CONSTRAINT check_bschc_new_status CHECK (new_status IS NULL OR new_status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'))");

            DB::statement("ALTER TABLE booking_schedule_changes ALTER COLUMN change_type SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixBookingScheduleActivities(): void
    {
        if (!Schema::hasTable('booking_schedule_activities')) {
            return;
        }

        try {
            Schema::table('booking_schedule_activities', function (Blueprint $table) {
                if (Schema::hasColumn('booking_schedule_activities', 'assignment_status')) {
                    $table->string('assignment_status_new', 50)->nullable();
                }
            });

            if (Schema::hasColumn('booking_schedule_activities', 'assignment_status')) {
                DB::statement("UPDATE booking_schedule_activities SET assignment_status_new = assignment_status::text");

                Schema::table('booking_schedule_activities', function (Blueprint $table) {
                    $table->dropColumn('assignment_status');
                });

                Schema::table('booking_schedule_activities', function (Blueprint $table) {
                    $table->renameColumn('assignment_status_new', 'assignment_status');
                });

                DB::statement("ALTER TABLE booking_schedule_activities ADD CONSTRAINT check_bsa_assignment_status CHECK (assignment_status IN ('draft', 'assigned', 'confirmed'))");
                DB::statement("ALTER TABLE booking_schedule_activities ALTER COLUMN assignment_status SET DEFAULT 'draft'");
                DB::statement("ALTER TABLE booking_schedule_activities ALTER COLUMN assignment_status SET NOT NULL");
            }
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixActivityLogs(): void
    {
        if (!Schema::hasTable('activity_logs')) {
            return;
        }

        try {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->string('status_new', 50)->nullable();
            });

            DB::statement("UPDATE activity_logs SET status_new = status::text");

            Schema::table('activity_logs', function (Blueprint $table) {
                $table->dropColumn('status');
            });

            Schema::table('activity_logs', function (Blueprint $table) {
                $table->renameColumn('status_new', 'status');
            });

            DB::statement("ALTER TABLE activity_logs ADD CONSTRAINT check_al_status CHECK (status IN ('in_progress', 'completed', 'needs_attention'))");
            DB::statement("ALTER TABLE activity_logs ALTER COLUMN status SET DEFAULT 'in_progress'");
            DB::statement("ALTER TABLE activity_logs ALTER COLUMN status SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixPackages(): void
    {
        if (!Schema::hasTable('packages')) {
            return;
        }

        try {
            Schema::table('packages', function (Blueprint $table) {
                $table->string('difficulty_level_new', 50)->nullable();
            });

            DB::statement("UPDATE packages SET difficulty_level_new = difficulty_level::text");

            Schema::table('packages', function (Blueprint $table) {
                $table->dropColumn('difficulty_level');
            });

            Schema::table('packages', function (Blueprint $table) {
                $table->renameColumn('difficulty_level_new', 'difficulty_level');
            });

            DB::statement("ALTER TABLE packages ADD CONSTRAINT check_pkg_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))");
            DB::statement("ALTER TABLE packages ALTER COLUMN difficulty_level SET DEFAULT 'beginner'");
            DB::statement("ALTER TABLE packages ALTER COLUMN difficulty_level SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixActivities(): void
    {
        if (!Schema::hasTable('activities')) {
            return;
        }

        try {
            Schema::table('activities', function (Blueprint $table) {
                if (Schema::hasColumn('activities', 'difficulty_level')) {
                    $table->string('difficulty_level_new', 50)->nullable();
                }
            });

            if (Schema::hasColumn('activities', 'difficulty_level')) {
                DB::statement("UPDATE activities SET difficulty_level_new = difficulty_level::text WHERE difficulty_level IS NOT NULL");

                Schema::table('activities', function (Blueprint $table) {
                    $table->dropColumn('difficulty_level');
                });

                Schema::table('activities', function (Blueprint $table) {
                    $table->renameColumn('difficulty_level_new', 'difficulty_level');
                });

                DB::statement("ALTER TABLE activities ADD CONSTRAINT check_act_difficulty CHECK (difficulty_level IS NULL OR difficulty_level IN ('beginner', 'intermediate', 'advanced'))");
                DB::statement("ALTER TABLE activities ALTER COLUMN difficulty_level SET DEFAULT 'beginner'");
            }
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixTestimonials(): void
    {
        if (!Schema::hasTable('testimonials')) {
            return;
        }

        try {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->string('source_type_new', 50)->nullable();
            });

            DB::statement("UPDATE testimonials SET source_type_new = source_type::text");

            Schema::table('testimonials', function (Blueprint $table) {
                $table->dropColumn('source_type');
            });

            Schema::table('testimonials', function (Blueprint $table) {
                $table->renameColumn('source_type_new', 'source_type');
            });

            DB::statement("ALTER TABLE testimonials ADD CONSTRAINT check_test_source_type CHECK (source_type IN ('manual', 'google', 'trustpilot', 'other'))");
            DB::statement("ALTER TABLE testimonials ALTER COLUMN source_type SET DEFAULT 'manual'");
            DB::statement("ALTER TABLE testimonials ALTER COLUMN source_type SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixTrainerNotes(): void
    {
        if (!Schema::hasTable('trainer_notes')) {
            return;
        }

        try {
            Schema::table('trainer_notes', function (Blueprint $table) {
                $table->string('type_new', 50)->nullable();
            });

            DB::statement("UPDATE trainer_notes SET type_new = type::text");

            Schema::table('trainer_notes', function (Blueprint $table) {
                $table->dropColumn('type');
            });

            Schema::table('trainer_notes', function (Blueprint $table) {
                $table->renameColumn('type_new', 'type');
            });

            DB::statement("ALTER TABLE trainer_notes ADD CONSTRAINT check_tn_type CHECK (type IN ('general', 'incident', 'feedback', 'attendance'))");
            DB::statement("ALTER TABLE trainer_notes ALTER COLUMN type SET DEFAULT 'general'");
            DB::statement("ALTER TABLE trainer_notes ALTER COLUMN type SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixReviewSources(): void
    {
        if (!Schema::hasTable('review_sources')) {
            return;
        }

        try {
            Schema::table('review_sources', function (Blueprint $table) {
                $table->string('provider_new', 50)->nullable();
            });

            DB::statement("UPDATE review_sources SET provider_new = provider::text");

            Schema::table('review_sources', function (Blueprint $table) {
                $table->dropColumn('provider');
            });

            Schema::table('review_sources', function (Blueprint $table) {
                $table->renameColumn('provider_new', 'provider');
            });

            DB::statement("ALTER TABLE review_sources ADD CONSTRAINT check_rs_provider CHECK (provider IN ('google', 'trustpilot', 'other'))");
            DB::statement("ALTER TABLE review_sources ALTER COLUMN provider SET DEFAULT 'google'");
            DB::statement("ALTER TABLE review_sources ALTER COLUMN provider SET NOT NULL");
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixPages(): void
    {
        if (!Schema::hasTable('pages')) {
            return;
        }

        try {
            // Check if pages table has type column as ENUM (might already be fixed)
            $hasTypeEnum = false;
            try {
                $result = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'type'");
                $hasTypeEnum = !empty($result) && $result[0]->data_type !== 'character varying';
            } catch (\Exception $e) {
                // Column might not exist or already converted
            }

            if ($hasTypeEnum) {
                Schema::table('pages', function (Blueprint $table) {
                    $table->text('type_new')->nullable();
                });

                DB::statement("UPDATE pages SET type_new = type::text");

                Schema::table('pages', function (Blueprint $table) {
                    $table->dropColumn('type');
                });

                Schema::table('pages', function (Blueprint $table) {
                    $table->renameColumn('type_new', 'type');
                });

                DB::statement("ALTER TABLE pages ADD CONSTRAINT check_pages_type CHECK (type IN ('about', 'contact', 'privacy', 'terms', 'faq', 'blog', 'home', 'other'))");
                DB::statement("ALTER TABLE pages ALTER COLUMN type SET NOT NULL");
            }
        } catch (\Exception $e) {
            if (!str_contains($e->getMessage(), 'already exists')) {
                throw $e;
            }
        }
    }

    private function fixUsersAdditional(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        try {
            // Fix approval_status if exists and is ENUM
            if (Schema::hasColumn('users', 'approval_status')) {
                $hasEnum = false;
                try {
                    $result = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'approval_status'");
                    $hasEnum = !empty($result) && $result[0]->data_type !== 'character varying';
                } catch (\Exception $e) {
                    // Already converted or doesn't exist
                }

                if ($hasEnum) {
                    Schema::table('users', function (Blueprint $table) {
                        $table->string('approval_status_new', 50)->nullable();
                    });

                    DB::statement("UPDATE users SET approval_status_new = approval_status::text");

                    Schema::table('users', function (Blueprint $table) {
                        $table->dropColumn('approval_status');
                    });

                    Schema::table('users', function (Blueprint $table) {
                        $table->renameColumn('approval_status_new', 'approval_status');
                    });

                    DB::statement("ALTER TABLE users ADD CONSTRAINT check_user_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected'))");
                    DB::statement("ALTER TABLE users ALTER COLUMN approval_status SET DEFAULT 'pending'");
                    DB::statement("ALTER TABLE users ALTER COLUMN approval_status SET NOT NULL");
                }
            }

            // Fix registration_source if exists and is ENUM
            if (Schema::hasColumn('users', 'registration_source')) {
                $hasEnum = false;
                try {
                    $result = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'registration_source'");
                    $hasEnum = !empty($result) && $result[0]->data_type !== 'character varying';
                } catch (\Exception $e) {
                    // Already converted or doesn't exist
                }

                if ($hasEnum) {
                    Schema::table('users', function (Blueprint $table) {
                        $table->string('registration_source_new', 50)->nullable();
                    });

                    DB::statement("UPDATE users SET registration_source_new = registration_source::text");

                    Schema::table('users', function (Blueprint $table) {
                        $table->dropColumn('registration_source');
                    });

                    Schema::table('users', function (Blueprint $table) {
                        $table->renameColumn('registration_source_new', 'registration_source');
                    });

                    DB::statement("ALTER TABLE users ADD CONSTRAINT check_user_registration_source CHECK (registration_source IN ('contact_page', 'direct', 'referral'))");
                    DB::statement("ALTER TABLE users ALTER COLUMN registration_source SET DEFAULT 'direct'");
                    DB::statement("ALTER TABLE users ALTER COLUMN registration_source SET NOT NULL");
                }
            }
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
            // Remove all CHECK constraints
            $constraints = [
                'booking_status_changes' => ['check_bsc_old_status', 'check_bsc_new_status', 'check_bsc_old_payment_status', 'check_bsc_new_payment_status'],
                'booking_schedule_changes' => ['check_bschc_change_type', 'check_bschc_old_status', 'check_bschc_new_status'],
                'booking_schedule_activities' => ['check_bsa_assignment_status'],
                'activity_logs' => ['check_al_status'],
                'packages' => ['check_pkg_difficulty'],
                'activities' => ['check_act_difficulty'],
                'testimonials' => ['check_test_source_type'],
                'trainer_notes' => ['check_tn_type'],
                'review_sources' => ['check_rs_provider'],
                'pages' => ['check_pages_type'],
                'users' => ['check_user_approval_status', 'check_user_registration_source'],
            ];

            foreach ($constraints as $table => $tableConstraints) {
                foreach ($tableConstraints as $constraint) {
                    DB::statement("ALTER TABLE $table DROP CONSTRAINT IF EXISTS $constraint");
                }
            }
        } catch (\Exception $e) {
            // Ignore errors during rollback
        }
    }
};
