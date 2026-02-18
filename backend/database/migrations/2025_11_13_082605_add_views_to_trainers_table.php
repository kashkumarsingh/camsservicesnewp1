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
     * Purpose: Adds views field to trainers table for analytics
     * Location: backend/database/migrations/
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('trainers')) {
            return;
        }
        
        // Check if column already exists (idempotent)
        if (Schema::hasColumn('trainers', 'views')) {
            return;
        }
        
        Schema::table('trainers', function (Blueprint $table) {
            $table->unsignedInteger('views')->default(0)->after('is_featured')->comment('View counter for analytics');
            
            // Index for views (used in sorting/filtering)
            $table->index('views', 'idx_trainers_views');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn('views');
        });
    }
};
