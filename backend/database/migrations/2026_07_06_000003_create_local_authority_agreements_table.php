<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-authority data sharing agreements (signed copies tracked by admin).
     * Run: cp migrations_trainer_workflow/2026_07_06_000003_create_local_authority_agreements_table.php database/migrations/
     * then: php artisan migrate
     */
    public function up(): void
    {
        Schema::create('local_authority_agreements', function (Blueprint $table) {
            $table->id();
            $table->string('local_authority_name');
            $table->date('effective_date')->nullable();
            $table->date('expires_at')->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('signed_storage_path')->nullable();
            $table->string('signed_file_name')->nullable();
            $table->string('signed_mime_type', 120)->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'local_authority_name']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('local_authority_agreements');
    }
};
