<?php

/**
 * Page Builder Phase 1 — copy this file to backend/database/migrations/
 * and rename to: 2026_02_26_071736_create_page_blocks_table.php
 * Then run: docker compose exec backend php artisan migrate
 *
 * @see PAGE_BUILDER_PHASE_PLAN.md
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('type', 64)->index();
            $table->json('payload');
            $table->timestamps();
        });

        Schema::table('page_blocks', function (Blueprint $table) {
            $table->index(['page_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_blocks');
    }
};
