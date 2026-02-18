<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Clean Architecture: Infrastructure (Data Persistence)
     * Purpose: Remove legacy JSON `activities` column from `packages` table
     *          now that activities are fully normalized via `activities` table
     *          and `package_activity` pivot table.
     */
    public function up(): void
    {
        if (! Schema::hasTable('packages')) {
            return;
        }

        if (! Schema::hasColumn('packages', 'activities')) {
            return;
        }

        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('activities');
        });
    }

    /**
     * Reverse the migrations.
     *
     * We recreate the column as nullable JSON for rollback purposes,
     * but without repopulating legacy data.
     */
    public function down(): void
    {
        if (! Schema::hasTable('packages')) {
            return;
        }

        if (Schema::hasColumn('packages', 'activities')) {
            return;
        }

        Schema::table('packages', function (Blueprint $table) {
            $table->json('activities')->nullable()->after('perks')
                ->comment('LEGACY: previous JSON representation of activities (no longer used)');
        });
    }
};


