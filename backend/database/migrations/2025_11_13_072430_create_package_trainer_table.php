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
     * Purpose: Defines the junction table for many-to-many relationship
     *          between packages and trainers
     * Location: backend/database/migrations/
     * 
     * This migration creates the package_trainer pivot table which links
     * packages to trainers (a package can have multiple trainers,
     * and a trainer can be assigned to multiple packages).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('package_trainer')) {
            return;
        }
        
        // Dependency check: ensure prerequisite tables exist
        if (!Schema::hasTable('packages')) {
            echo "⚠️  Skipping package_trainer migration: packages table does not exist yet\n";
            return;
        }
        if (!Schema::hasTable('trainers')) {
            echo "⚠️  Skipping package_trainer migration: trainers table does not exist yet\n";
            return;
        }
        
        Schema::create('package_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')
                ->constrained('packages')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->foreignId('trainer_id')
                ->constrained('trainers')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['package_id', 'trainer_id'], 'unique_package_trainer');
            
            // Indexes for performance (foreign keys are auto-indexed, but explicit for clarity)
            $table->index('package_id', 'idx_package_trainer_package');
            $table->index('trainer_id', 'idx_package_trainer_trainer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_trainer');
    }
};
