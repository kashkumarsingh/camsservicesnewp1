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
     * Purpose: Creates user_checklists table for parent/guardian compliance
     * Location: backend/database/migrations/
     * 
     * This migration creates:
     * - Identity verification
     * - References
     * - Background checks
     * - Consent flags
     * - Admin review tracking
     */
    public function up(): void
    {
        Schema::create('user_checklists', function (Blueprint $table) {
            $table->id();
            
            // User relationship (one-to-one)
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('User (parent/guardian) this checklist belongs to');
            
            // Identity Verification
            $table->boolean('identity_verified')->default(false);
            $table->timestamp('identity_verified_at')->nullable();
            $table->foreignId('identity_verified_by')->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Admin who verified identity');
            $table->string('identity_document_type', 50)->nullable()
                ->comment('Passport, Driving License, etc.');
            $table->string('identity_document_reference', 100)->nullable()
                ->comment('Document reference number');
            
            // References
            $table->string('reference_1_name', 100)->nullable();
            $table->string('reference_1_contact', 100)->nullable();
            $table->boolean('reference_1_verified')->default(false);
            $table->string('reference_2_name', 100)->nullable();
            $table->string('reference_2_contact', 100)->nullable();
            $table->boolean('reference_2_verified')->default(false);
            
            // Additional Checks
            $table->boolean('background_check_completed')->default(false);
            $table->timestamp('background_check_completed_at')->nullable();
            $table->boolean('consent_data_processing')->default(false);
            $table->boolean('consent_marketing')->default(false);
            
            // Admin Review
            $table->boolean('checklist_completed')->default(false)
                ->comment('Admin marks as complete after review');
            $table->timestamp('checklist_completed_at')->nullable();
            $table->foreignId('checklist_completed_by')->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Admin who completed the checklist review');
            $table->text('admin_notes')->nullable()
                ->comment('Internal admin notes');
            
            // Timestamps
            $table->timestamps();
            
            // Indexes
            $table->index('checklist_completed', 'idx_user_checklists_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_checklists');
    }
};

