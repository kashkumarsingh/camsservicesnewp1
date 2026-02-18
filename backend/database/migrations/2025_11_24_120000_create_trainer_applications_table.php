<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')
                ->nullable()
                ->constrained('trainers')
                ->nullOnDelete();
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('email')->index();
            $table->string('phone', 40);
            $table->string('postcode', 12);
            $table->string('address_line_one')->nullable();
            $table->string('address_line_two')->nullable();
            $table->string('city')->nullable();
            $table->string('county')->nullable();
            $table->unsignedTinyInteger('travel_radius_km')->default(10);
            $table->json('service_area_postcodes')->nullable();
            $table->json('availability_preferences')->nullable();
            $table->json('activity_specialties')->nullable();
            $table->json('preferred_age_groups')->nullable();
            $table->unsignedTinyInteger('experience_years')->default(0);
            $table->text('bio')->nullable();
            $table->json('certifications')->nullable();
            $table->boolean('has_dbs_check')->default(false);
            $table->date('dbs_issued_at')->nullable();
            $table->date('dbs_expires_at')->nullable();
            $table->string('insurance_provider')->nullable();
            $table->date('insurance_expires_at')->nullable();
            $table->decimal('desired_hourly_rate', 8, 2)->nullable();
            $table->json('attachments')->nullable();
            $table->string('status', 30)->default('submitted')->index();
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'idx_trainer_app_status_created');
            $table->index(['postcode', 'status'], 'idx_trainer_app_postcode_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_applications');
    }
};


