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
     * Purpose: Adds trust indicators JSON column to packages table
     * 
     * Trust indicators are package-specific social proof elements
     * (e.g., "500+ families", "98% satisfaction", "10+ years experience")
     */
    public function up(): void
    {
        if (!Schema::hasTable('packages')) {
            return;
        }
        
        if (Schema::hasColumn('packages', 'trust_indicators')) {
            return;
        }
        
        Schema::table('packages', function (Blueprint $table) {
            $table->json('trust_indicators')
                ->nullable()
                ->after('color')
                ->comment('Package-specific trust indicators: [{label, value, icon}]');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('trust_indicators');
        });
    }
};

