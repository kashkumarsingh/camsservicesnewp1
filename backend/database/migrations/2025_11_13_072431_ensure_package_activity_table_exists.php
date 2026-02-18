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
     * Purpose: Create package_activity pivot table in environments where
     *          earlier migration ran before packages table existed.
     */
    public function up(): void
    {
        if (Schema::hasTable('package_activity')) {
            return;
        }

        if (! Schema::hasTable('packages') || ! Schema::hasTable('activities')) {
            // Safety: defer until prerequisite tables exist.
            return;
        }

        Schema::create('package_activity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')
                ->constrained('packages')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('activity_id')
                ->constrained('activities')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->unsignedTinyInteger('order')->default(0)->comment('Order of activity in package');
            $table->timestamps();

            $table->unique(['package_id', 'activity_id']);
            $table->index('package_id', 'idx_package_activity_package');
            $table->index('activity_id', 'idx_package_activity_activity');
            $table->index(['package_id', 'order'], 'idx_package_activity_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('package_activity')) {
            return;
        }

        Schema::drop('package_activity');
    }
};

