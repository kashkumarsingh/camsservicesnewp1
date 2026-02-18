<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add Reminder Tracking Columns
 * 
 * Clean Architecture: Infrastructure Layer (Data Persistence)
 * Purpose: Add columns to track sent reminders for bookings and schedules
 * Location: backend/database/migrations/2026_01_08_000000_add_reminder_tracking_columns_to_bookings_and_schedules.php
 * 
 * Adds columns for:
 * - Draft booking reminder tracking (bookings table)
 * - Payment reminder tracking (bookings table)
 * - Session reminder tracking (booking_schedules table)
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add reminder tracking columns to bookings table
        if (!Schema::hasColumn('bookings', 'last_reminder_sent_at')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->timestamp('last_reminder_sent_at')->nullable();
            });
        }
        
        if (!Schema::hasColumn('bookings', 'reminder_count')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->unsignedTinyInteger('reminder_count')->default(0);
            });
        }
        
        if (!Schema::hasColumn('bookings', 'last_payment_reminder_sent_at')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->timestamp('last_payment_reminder_sent_at')->nullable();
            });
        }
        
        if (!Schema::hasColumn('bookings', 'last_payment_reminder_type')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('last_payment_reminder_type', 20)->nullable()
                    ->comment('Values: 24h_before, 3d_before, 7d_after');
            });
        }
        
        if (!Schema::hasColumn('bookings', 'payment_reminder_count')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->unsignedTinyInteger('payment_reminder_count')->default(0);
            });
        }
        
        if (!Schema::hasColumn('bookings', 'payment_due_date')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->date('payment_due_date')->nullable();
            });
        }
        
        // Add indexes for scheduled job queries
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->index(['status', 'created_at'], 'idx_bookings_status_created');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
        
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->index(['payment_status', 'payment_due_date'], 'idx_bookings_payment_status_due');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }

        // Add reminder tracking to booking_schedules table
        if (!Schema::hasColumn('booking_schedules', 'reminder_sent_at')) {
            Schema::table('booking_schedules', function (Blueprint $table) {
                $table->timestamp('reminder_sent_at')->nullable();
            });
        }
        
        // Add index for scheduled job queries
        try {
            Schema::table('booking_schedules', function (Blueprint $table) {
                $table->index(['status', 'date'], 'idx_schedules_status_date');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Remove indexes first
            $table->dropIndex('idx_bookings_status_created');
            $table->dropIndex('idx_bookings_payment_status_due');
            
            // Remove columns
            $table->dropColumn([
                'last_reminder_sent_at',
                'reminder_count',
                'last_payment_reminder_sent_at',
                'last_payment_reminder_type',
                'payment_reminder_count',
            ]);
        });

        Schema::table('booking_schedules', function (Blueprint $table) {
            // Remove index first
            $table->dropIndex('idx_schedules_status_date');
            
            // Remove column
            $table->dropColumn('reminder_sent_at');
        });
    }
};
