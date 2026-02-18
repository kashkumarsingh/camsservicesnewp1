<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture Layer: Infrastructure (Data Persistence)
     * Purpose: Add package_benefits JSON field to site_settings table
     */
    public function up(): void
    {
        if (! Schema::hasTable('site_settings')) {
            // On new environments (e.g., Render, Railway) the site_settings table
            // may not exist yet when this migration runs due to timestamp ordering.
            // We simply skip here and allow a later migration (post-table creation)
            // to add the column.
            return;
        }

        if (Schema::hasColumn('site_settings', 'package_benefits')) {
            return;
        }

        Schema::table('site_settings', function (Blueprint $table) {
            $table->json('package_benefits')->nullable()->after('quick_links');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('site_settings')) {
            return;
        }

        if (! Schema::hasColumn('site_settings', 'package_benefits')) {
            return;
        }

        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn('package_benefits');
        });
    }
};

