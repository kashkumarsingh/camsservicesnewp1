<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Layer: Infrastructure (Persistence)
     * Purpose: Allow trainers to acknowledge parent-reported concerns and add a note for the DSL.
     */
    public function up(): void
    {
        Schema::table('safeguarding_concerns', function (Blueprint $table) {
            $table->timestamp('trainer_acknowledged_at')->nullable()->after('user_agent');
            $table->text('trainer_note')->nullable()->after('trainer_acknowledged_at');
            $table->foreignId('acknowledged_by_user_id')->nullable()->after('trainer_note')->constrained('users')->nullOnDelete();

            $table->index('acknowledged_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('safeguarding_concerns', function (Blueprint $table) {
            $table->dropForeign(['acknowledged_by_user_id']);
            $table->dropColumn(['trainer_acknowledged_at', 'trainer_note', 'acknowledged_by_user_id']);
        });
    }
};
