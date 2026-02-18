<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds age_group column to packages table for filtering/display (e.g. "5-7", "8-11").
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (! Schema::hasColumn('packages', 'age_group')) {
                $table->string('age_group', 100)->nullable()->after('allow_activity_override');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            if (Schema::hasColumn('packages', 'age_group')) {
                $table->dropColumn('age_group');
            }
        });
    }
};
