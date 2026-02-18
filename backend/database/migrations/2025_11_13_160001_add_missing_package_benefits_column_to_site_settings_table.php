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
     * Purpose: Ensure package_benefits column exists on site_settings even when
     *          earlier migrations skipped due to ordering differences between environments.
     */
    public function up(): void
    {
        if (! Schema::hasTable('site_settings')) {
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

