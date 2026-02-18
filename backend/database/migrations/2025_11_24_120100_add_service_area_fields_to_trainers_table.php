<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('trainers')) {
            return;
        }
        
        // Check if columns already exist (idempotent)
        if (Schema::hasColumn('trainers', 'home_postcode')) {
            return;
        }
        
        Schema::table('trainers', function (Blueprint $table) {
            $table->string('home_postcode', 12)->nullable()->after('availability_notes');
            $table->unsignedTinyInteger('travel_radius_km')->nullable()->after('home_postcode');
            $table->json('service_area_postcodes')->nullable()->after('travel_radius_km');
            $table->json('preferred_age_groups')->nullable()->after('service_area_postcodes');
            $table->json('availability_preferences')->nullable()->after('preferred_age_groups');

            $table->index('home_postcode', 'idx_trainers_home_postcode');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn([
                'home_postcode',
                'travel_radius_km',
                'service_area_postcodes',
                'preferred_age_groups',
                'availability_preferences',
            ]);
            $table->dropIndex('idx_trainers_home_postcode');
        });
    }
};


