<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Layer: Infrastructure (Persistence)
     * Purpose: Store parent-reported safeguarding concerns from the dashboard.
     *          Designated Safeguarding Lead can triage and follow up.
     */
    public function up(): void
    {
        Schema::create('safeguarding_concerns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('concern_type', 32);
            $table->text('description');
            $table->foreignId('child_id')->nullable()->constrained('children')->nullOnDelete();
            $table->date('date_of_concern')->nullable();
            $table->string('contact_preference', 500)->nullable();
            $table->string('status', 32)->default('pending');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 1024)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('safeguarding_concerns');
    }
};
