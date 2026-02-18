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
     * Purpose: Defines the database schema for activities table
     * Location: backend/database/migrations/
     * 
     * This migration creates the activities table which stores
     * individual activities that can be assigned to packages.
     * Activities are normalized from the JSON structure in packages.
     */
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 150)->unique();
            $table->text('description')->nullable();
            $table->string('image_url', 255)->nullable();
            $table->decimal('duration', 4, 2)->comment('Duration in hours');
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced'])->default('beginner')->nullable();
            $table->unsignedTinyInteger('age_group_min')->nullable()->comment('Minimum age');
            $table->unsignedTinyInteger('age_group_max')->nullable()->comment('Maximum age');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('slug');
            $table->index('is_active');
            $table->index('difficulty_level');
            $table->index(['age_group_min', 'age_group_max']);
            
            // Composite index for common queries: active + not deleted
            $table->index(['is_active', 'deleted_at'], 'idx_activities_active');
            
            // Index for soft-deleted queries
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};

