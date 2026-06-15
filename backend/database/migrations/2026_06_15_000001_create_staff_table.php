<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Internal staff onboarding records (distinct from trainers).
     * Run: cp migrations_trainer_workflow/2026_06_15_000001_create_staff_table.php database/migrations/
     * then: php artisan migrate
     */
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address_line_one')->nullable();
            $table->string('address_line_two')->nullable();
            $table->string('city')->nullable();
            $table->string('county')->nullable();
            $table->string('postcode')->nullable();
            $table->string('job_title');
            $table->string('department')->nullable();
            $table->string('citizenship')->nullable();
            $table->string('visa_status');
            $table->boolean('right_to_work_verified')->default(false);
            $table->date('right_to_work_verified_at')->nullable();
            $table->date('right_to_work_expires_at')->nullable();
            $table->date('start_date')->nullable();
            $table->string('employment_status')->default('active');
            $table->boolean('has_dbs_check')->default(false);
            $table->string('dbs_certificate_number')->nullable();
            $table->date('dbs_issued_at')->nullable();
            $table->date('dbs_expires_at')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('onboarded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('onboarded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
