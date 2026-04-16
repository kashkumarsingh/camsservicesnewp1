<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('referrer_name', 200);
            $table->string('referrer_role', 200);
            $table->string('referrer_email', 255);
            $table->string('referrer_phone', 32);
            $table->string('young_person_name', 200);
            $table->string('young_person_age', 32);
            $table->string('school_setting', 255)->nullable();
            $table->string('primary_concern', 255);
            $table->text('background_context');
            $table->text('success_outcome');
            $table->string('preferred_package', 255);
            $table->text('additional_info')->nullable();
            $table->string('status', 32)->default('pending');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index('referrer_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_submissions');
    }
};
