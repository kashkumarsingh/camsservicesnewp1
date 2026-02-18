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
     * Purpose: Creates the booking_participants table for Phase 1 booking system
     * Location: backend/database/migrations/
     * 
     * This migration creates the booking_participants table which stores
     * child/participant information for each booking (one-to-many relationship).
     */
    public function up(): void
    {
        // Idempotent check: skip if table already exists
        if (Schema::hasTable('booking_participants')) {
            return;
        }
        
        // Note: This migration depends on 'bookings' table
        // If the table doesn't exist, the foreign key constraint will fail
        // which is the correct behavior - migrations should run in order
        // RefreshDatabase trait ensures migrations run in timestamp order
        
        Schema::create('booking_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->date('date_of_birth');
            $table->text('medical_info')->nullable()->comment('Medical conditions, allergies, etc.');
            $table->text('special_needs')->nullable()->comment('Special requirements');
            $table->unsignedTinyInteger('order')->default(0)->comment('Display order');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_id', 'idx_booking_participants_booking_id');
            $table->index(['booking_id', 'order'], 'idx_booking_participants_booking_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_participants');
    }
};


