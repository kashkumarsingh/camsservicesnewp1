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
     * Purpose: Creates child_checklists table for UK compliance checklists
     * Location: backend/database/migrations/
     * 
     * This migration creates:
     * - Medical information (conditions, allergies, medications)
     * - Emergency contacts
     * - Special needs and behavioral notes
     * - Consent flags (photography, medical treatment)
     * - Admin review tracking
     */
    public function up(): void
    {
        Schema::create('child_checklists', function (Blueprint $table) {
            $table->id();
            
            // Child relationship (one-to-one)
            $table->foreignId('child_id')
                ->unique()
                ->constrained('children')
                ->onDelete('cascade')
                ->comment('Child this checklist belongs to');
            
            // Medical Information
            $table->text('medical_conditions')->nullable()
                ->comment('Any existing medical conditions');
            $table->text('allergies')->nullable()
                ->comment('Known allergies (food, medication, environmental)');
            $table->text('medications')->nullable()
                ->comment('Current medications');
            $table->text('dietary_requirements')->nullable()
                ->comment('Dietary restrictions or requirements');
            
            // Emergency Contacts
            $table->string('emergency_contact_name', 100)
                ->comment('Primary emergency contact name');
            $table->string('emergency_contact_relationship', 50)->nullable()
                ->comment('Relationship (e.g., Grandparent, Aunt, Family Friend)');
            $table->string('emergency_contact_phone', 15)
                ->comment('Primary emergency contact phone');
            $table->string('emergency_contact_phone_alt', 15)->nullable()
                ->comment('Alternative emergency contact phone');
            $table->text('emergency_contact_address')->nullable()
                ->comment('Emergency contact address');
            
            // Additional Information
            $table->text('special_needs')->nullable()
                ->comment('SEN, disabilities, learning difficulties');
            $table->text('behavioral_notes')->nullable()
                ->comment('Behavioral considerations');
            $table->text('activity_restrictions')->nullable()
                ->comment('Activities child cannot participate in');
            
            // Consent Flags
            $table->boolean('consent_photography')->default(false)
                ->comment('Consent for photos/videos');
            $table->boolean('consent_medical_treatment')->default(false)
                ->comment('Consent for emergency medical treatment');
            
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
            $table->index('checklist_completed', 'idx_child_checklists_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('child_checklists');
    }
};

