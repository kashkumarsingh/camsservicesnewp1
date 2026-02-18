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
        if (Schema::hasTable('activity_trainer')) {
            return;
        }

        if (! Schema::hasTable('activities') || ! Schema::hasTable('trainers')) {
            return;
        }

        Schema::create('activity_trainer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')
                ->constrained('activities')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('trainer_id')
                ->constrained('trainers')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $table->boolean('is_primary')->default(false)->comment('Main trainer for this activity');
            $table->timestamps();

            $table->unique(['activity_id', 'trainer_id'], 'unique_activity_trainer');
            $table->index('activity_id', 'idx_activity_trainer_activity');
            $table->index('trainer_id', 'idx_activity_trainer_trainer');
            $table->index(['activity_id', 'is_primary'], 'idx_activity_trainer_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('activity_trainer')) {
            return;
        }

        Schema::drop('activity_trainer');
    }
};

