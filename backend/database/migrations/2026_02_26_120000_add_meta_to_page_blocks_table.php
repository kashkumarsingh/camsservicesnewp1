<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 5: Visibility/scheduling — per-block visible from/until, hide on mobile.
     */
    public function up(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->json('meta')->nullable()->after('payload');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('page_blocks', function (Blueprint $table) {
            $table->dropColumn('meta');
        });
    }
};
