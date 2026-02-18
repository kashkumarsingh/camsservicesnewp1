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
        
        // Check if columns already exist (idempotent)
        if (Schema::hasColumn('contact_submissions', 'address')) {
            return;
        }
        
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->text('address')->nullable()->after('phone');
            $table->string('postal_code', 20)->nullable()->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->dropColumn(['address', 'postal_code']);
        });
    }
};
