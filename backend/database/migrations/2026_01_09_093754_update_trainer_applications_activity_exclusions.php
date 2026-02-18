<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * CLIENT REQUIREMENT: Change from "activities you CAN do" to "activities you CANNOT do"
     * Rationale: Trainers are expected to facilitate ALL activities by default.
     * Only exclusions need to be specified (physical/mental/medical limitations).
     * This approach scales better (100-500+ activities planned).
     */
    public function up(): void
    {
        Schema::table('trainer_applications', function (Blueprint $table) {
            // Add new fields for activity exclusions
            $table->json('activity_exclusions')
                ->nullable()
                ->after('activity_specialties')
                ->comment('Categories of activities trainer CANNOT perform (e.g., water-based, high-intensity). Empty = can do ALL activities.');
            
            $table->text('exclusion_reason')
                ->nullable()
                ->after('activity_exclusions')
                ->comment('Reason for activity limitations (e.g., physical injury, medical condition, phobia)');
            
            // Remove old activity_specialties field (user decision: clear old data)
            $table->dropColumn('activity_specialties');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainer_applications', function (Blueprint $table) {
            // Restore old field
            $table->json('activity_specialties')->nullable();
            
            // Remove new fields
            $table->dropColumn(['activity_exclusions', 'exclusion_reason']);
        });
    }
};
