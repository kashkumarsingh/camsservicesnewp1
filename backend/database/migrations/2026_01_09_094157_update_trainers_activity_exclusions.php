<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * CLIENT REQUIREMENT: Mirror trainer application changes to Trainer profile
     * When trainer application is approved, activity_exclusions are transferred.
     */
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            // Add new fields for activity exclusions
            $table->json('activity_exclusions')
                ->nullable()
                ->after('specialties')
                ->comment('Categories of activities trainer CANNOT perform (transferred from application). Empty = can do ALL activities.');
            
            $table->text('exclusion_reason')
                ->nullable()
                ->after('activity_exclusions')
                ->comment('Reason for activity limitations (transferred from application)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn(['activity_exclusions', 'exclusion_reason']);
        });
    }
};
