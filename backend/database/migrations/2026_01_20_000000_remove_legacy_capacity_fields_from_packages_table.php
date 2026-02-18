<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table): void {
            // Remove legacy fields that are no longer used anywhere in the UI
            if (Schema::hasColumn('packages', 'age_group')) {
                $table->dropColumn('age_group');
            }

            if (Schema::hasColumn('packages', 'difficulty_level')) {
                $table->dropColumn('difficulty_level');
            }

            if (Schema::hasColumn('packages', 'max_participants')) {
                $table->dropColumn('max_participants');
            }

            if (Schema::hasColumn('packages', 'spots_remaining')) {
                $table->dropColumn('spots_remaining');
            }

            if (Schema::hasColumn('packages', 'total_spots')) {
                $table->dropColumn('total_spots');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table): void {
            // Recreate the removed columns with sensible defaults
            if (! Schema::hasColumn('packages', 'age_group')) {
                $table->string('age_group', 50)->nullable();
            }

            if (! Schema::hasColumn('packages', 'difficulty_level')) {
                $table->string('difficulty_level', 50)->nullable();
            }

            if (! Schema::hasColumn('packages', 'max_participants')) {
                $table->unsignedInteger('max_participants')->default(12);
            }

            if (! Schema::hasColumn('packages', 'spots_remaining')) {
                $table->unsignedInteger('spots_remaining')->default(12);
            }

            if (! Schema::hasColumn('packages', 'total_spots')) {
                $table->unsignedInteger('total_spots')->default(12);
            }
        });
    }
};

