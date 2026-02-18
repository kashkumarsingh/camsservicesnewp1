<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Clean Architecture: Infrastructure/Data Layer
     * Purpose: Links booking_participants to children table
     * Location: backend/database/migrations/
     * 
     * This migration:
     * - Adds child_id foreign key to booking_participants
     * - Links existing booking participants to approved children
     * - Maintains backward compatibility (child_id is nullable for existing bookings)
     */
    public function up(): void
    {
        Schema::table('booking_participants', function (Blueprint $table) {
            // Add child_id column (nullable for backward compatibility)
            $table->foreignId('child_id')
                ->nullable()
                ->after('booking_id')
                ->constrained('children')
                ->onDelete('set null')
                ->comment('Link to approved child (required for new bookings)');
            
            // Index for performance
            $table->index('child_id', 'idx_booking_participants_child_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_participants', function (Blueprint $table) {
            $table->dropIndex('idx_booking_participants_child_id');
            $table->dropForeign(['child_id']);
            $table->dropColumn('child_id');
        });
    }
};

