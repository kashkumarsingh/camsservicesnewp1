<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Defines the database schema for packages table
     * Location: backend/database/migrations/
     * 
     * This migration creates the packages table which stores
     * package/program offerings in the system.
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('packages')) {
            return;
        }
        
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 150)->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('hours')->comment('Total hours in package');
            $table->unsignedTinyInteger('duration_weeks');
            $table->string('age_group', 50)->nullable();
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->unsignedTinyInteger('max_participants')->default(12);
            $table->unsignedTinyInteger('spots_remaining')->default(12);
            $table->unsignedTinyInteger('total_spots')->default(12);
            $table->json('features')->nullable()->comment('Array of package features');
            $table->text('what_to_expect')->nullable();
            $table->json('requirements')->nullable()->comment('Array of requirements');
            $table->string('image', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('slug', 'idx_packages_slug');
            $table->index('is_active', 'idx_packages_active');
            $table->index('is_popular', 'idx_packages_popular');
            $table->index('price', 'idx_packages_price');
            $table->index('age_group', 'idx_packages_age_group');
            
            // Composite indexes for common queries
            $table->index(['is_active', 'is_popular'], 'idx_packages_active_popular');
            $table->index(['is_active', 'deleted_at'], 'idx_packages_active_not_deleted');
            $table->index(['is_popular', 'is_active'], 'idx_packages_popular_active');
            
            // Index for soft-deleted queries
            $table->index('deleted_at', 'idx_packages_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
