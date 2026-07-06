<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Staff and trainer incident reports (accidents, safeguarding, transport, etc.).
     * Run: cp migrations_trainer_workflow/2026_07_06_000002_create_incidents_table.php database/migrations/
     * then: php artisan migrate
     */
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('incident_type', 50);
            $table->string('severity', 20)->default('medium');
            $table->text('description');
            $table->string('location')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->foreignId('child_id')->nullable()->constrained('children')->nullOnDelete();
            $table->foreignId('booking_schedule_id')->nullable()->constrained('booking_schedules')->nullOnDelete();
            $table->foreignId('reported_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('open');
            $table->text('immediate_actions')->nullable();
            $table->text('follow_up_notes')->nullable();
            $table->timestamp('dsl_reviewed_at')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('incident_type');
            $table->index('reported_by_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
