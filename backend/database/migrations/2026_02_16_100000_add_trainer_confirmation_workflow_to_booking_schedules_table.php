<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Intelligent trainer auto-assignment: trainer confirmation workflow.
     */
    public function up(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            $table->string('trainer_assignment_status', 50)->nullable()->after('trainer_approved_by_user_id');
            $table->timestamp('trainer_confirmation_requested_at')->nullable()->after('trainer_assignment_status');
            $table->timestamp('trainer_confirmed_at')->nullable()->after('trainer_confirmation_requested_at');
            $table->timestamp('trainer_declined_at')->nullable()->after('trainer_confirmed_at');
            $table->text('trainer_decline_reason')->nullable()->after('trainer_declined_at');
            $table->unsignedTinyInteger('assignment_attempt_count')->default(1)->after('trainer_decline_reason');
        });
    }

    public function down(): void
    {
        Schema::table('booking_schedules', function (Blueprint $table) {
            $table->dropColumn([
                'trainer_assignment_status',
                'trainer_confirmation_requested_at',
                'trainer_confirmed_at',
                'trainer_declined_at',
                'trainer_decline_reason',
                'assignment_attempt_count',
            ]);
        });
    }
};
