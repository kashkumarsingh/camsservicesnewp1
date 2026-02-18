<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Defines the database schema for trainers table
     * Location: backend/database/migrations/
     * 
     * This migration creates the trainers table which stores
     * trainer/coach profiles and details in the system.
     */
    public function up(): void
    {
        Schema::create('trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->onUpdate('cascade');
            $table->string('name', 100);
            $table->string('slug', 150)->unique();
            $table->string('role', 100)->comment('Job title, e.g., "Lead Activity Coach"');
            $table->text('bio')->comment('Short bio (255 chars recommended)');
            $table->text('full_description')->nullable();
            $table->string('image', 255)->nullable();
            $table->decimal('rating', 3, 2)->default(0.00)->comment('Average rating 0.00 - 5.00');
            $table->unsignedInteger('total_reviews')->default(0);
            $table->json('specialties')->nullable()->comment('Array of specialties');
            $table->json('certifications')->nullable()->comment('Array of certifications with year');
            $table->unsignedTinyInteger('experience_years')->default(0);
            $table->text('availability_notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('slug', 'idx_trainers_slug');
            $table->index('user_id', 'idx_trainers_user');
            $table->index('is_active', 'idx_trainers_active');
            $table->index('is_featured', 'idx_trainers_featured');
            $table->index('rating', 'idx_trainers_rating');
            
            // Composite indexes for common queries
            $table->index(['is_active', 'is_featured'], 'idx_trainers_active_featured');
            $table->index(['is_active', 'deleted_at'], 'idx_trainers_active_not_deleted');
            $table->index(['rating', 'is_active'], 'idx_trainers_rating_active');
            
            // Index for soft-deleted queries
            $table->index('deleted_at', 'idx_trainers_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainers');
    }
};
