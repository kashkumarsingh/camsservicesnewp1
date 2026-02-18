<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Purpose: Add indexes to optimize duplicate submission checks
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('contact_submissions')) {
            return;
        }
        
        // Check if indexes already exist (idempotent)
        // Try to add indexes - if they exist, Laravel will handle gracefully
        // For SQLite (testing), we'll catch the exception
        try {
            Schema::table('contact_submissions', function (Blueprint $table) {
                // Index for email-based duplicate checks (email + created_at)
                $table->index(['email', 'created_at'], 'idx_contact_submissions_email_created');
                
                // Index for IP-based duplicate checks (ip_address + created_at)
                $table->index(['ip_address', 'created_at'], 'idx_contact_submissions_ip_created');
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Index might already exist, which is fine (idempotent)
            // Handle different database error messages
            $errorMessage = $e->getMessage();
            if (str_contains($errorMessage, 'Duplicate key name') || 
                str_contains($errorMessage, 'already exists') ||
                str_contains($errorMessage, 'duplicate') ||
                str_contains($errorMessage, 'relation') && str_contains($errorMessage, 'already exists')) {
                return;
            }
            throw $e;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_contact_submissions_email_created');
            $table->dropIndex('idx_contact_submissions_ip_created');
        });
    }
};

