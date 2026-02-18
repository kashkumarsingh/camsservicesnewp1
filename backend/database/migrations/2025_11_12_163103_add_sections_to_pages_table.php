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
        if (!Schema::hasTable('pages')) {
            return;
        }
        
        if (Schema::hasColumn('pages', 'sections')) {
            return;
        }
        
        Schema::table('pages', function (Blueprint $table) {
            $table->json('sections')
                ->nullable()
                ->after('content')
                ->comment('Structured page layout blocks (e.g., hero, services, testimonials)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn('sections');
        });
    }
};

