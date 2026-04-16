<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add optional JSON content column for Public Pages Content Management.
 * Stores type-specific section data (e.g. about: hero, mission, coreValues, safeguarding).
 *
 * Copy to backend/database/migrations/ then run: docker compose exec backend php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            if (! Schema::hasColumn('pages', 'content')) {
                $table->json('content')->nullable()->after('og_image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            if (Schema::hasColumn('pages', 'content')) {
                $table->dropColumn('content');
            }
        });
    }
};
