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
        // Check if table exists before modifying
        if (!Schema::hasTable('contact_submissions')) {
            return;
        }
        
        // Check if column exists (idempotent)
        if (!Schema::hasColumn('contact_submissions', 'message')) {
            return;
        }
        
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->text('message')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->text('message')->nullable(false)->change();
        });
    }
};
