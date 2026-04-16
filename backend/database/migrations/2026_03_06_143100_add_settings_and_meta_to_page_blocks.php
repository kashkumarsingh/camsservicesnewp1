<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add `settings` and `meta` columns to page_blocks if missing.
 * Safe to run on existing DB; does not drop data.
 * Fixes: "Unknown column 'settings' in 'field list'" when inserting blocks.
 *
 * Copy to backend/database/migrations/ then run: docker compose exec backend php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            if (! Schema::hasColumn('page_blocks', 'settings')) {
                $table->json('settings')->nullable()->after('sort_order');
            }
            if (! Schema::hasColumn('page_blocks', 'meta')) {
                $table->json('meta')->nullable()->after('settings');
            }
        });
    }

    public function down(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            if (Schema::hasColumn('page_blocks', 'settings')) {
                $table->dropColumn('settings');
            }
            if (Schema::hasColumn('page_blocks', 'meta')) {
                $table->dropColumn('meta');
            }
        });
    }
};
