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
     * Purpose: Store contact form submissions routed from the frontend `/contact`
     *          page. Keeps CRM-ready data, audit details, and processing status.
     */
    public function up(): void
    {
        Schema::create('contact_submissions', function (Blueprint $table) {
            $table->id();

            // Core identity & contact details
            $table->string('name', 200);
            $table->string('email', 255);
            $table->string('phone', 32)->nullable();
            $table->string('child_age', 32)->nullable();

            // Inquiry context
            $table->enum('inquiry_type', ['package', 'service', 'general', 'other'])->default('general');
            $table->string('inquiry_details', 255)->nullable();
            $table->enum('urgency', ['urgent', 'soon', 'exploring'])->default('exploring');
            $table->enum('preferred_contact', ['email', 'phone', 'whatsapp'])->default('email');

            // Message payload
            $table->text('message');
            $table->boolean('newsletter')->default(false);
            $table->string('source_page', 255)->nullable();

            // Operational metadata
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'archived'])->default('pending');
            $table->foreignId('assigned_to_id')->nullable()->constrained('users')->nullOnDelete();
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 1024)->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for querying dashboards & CRM sync jobs
            $table->index(['email', 'deleted_at'], 'idx_contact_submissions_email');
            $table->index('status', 'idx_contact_submissions_status');
            $table->index('inquiry_type', 'idx_contact_submissions_inquiry_type');
            $table->index('urgency', 'idx_contact_submissions_urgency');
            $table->index(['created_at', 'urgency'], 'idx_contact_submissions_created_urgency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_submissions');
    }
};

