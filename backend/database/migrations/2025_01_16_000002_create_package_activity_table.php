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
     *          between packages and activities
     * Location: backend/database/migrations/
     * 
     * This migration creates the package_activity pivot table which links
     * packages to activities (a package can have multiple activities,
     * and an activity can be used in multiple packages).
     */
    public function up(): void
    {
        if (Schema::hasTable('package_activity')) {
            return;
        }

        if (! Schema::hasTable('packages') || ! Schema::hasTable('activities')) {
            return;
        }

        Schema::create('package_activity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')
                ->constrained('packages')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->foreignId('activity_id')
                ->constrained('activities')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->unsignedTinyInteger('order')->default(0)->comment('Order of activity in package');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate assignments
            $table->unique(['package_id', 'activity_id']);
            
            // Indexes for performance (foreign keys are auto-indexed, but explicit for clarity)
            $table->index('package_id', 'idx_package_activity_package');
            $table->index('activity_id', 'idx_package_activity_activity');
            
            // Composite index for ordering activities within a package
            $table->index(['package_id', 'order'], 'idx_package_activity_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('package_activity')) {
            return;
        }

        Schema::drop('package_activity');
    }
};

