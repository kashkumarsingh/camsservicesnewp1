<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Internal operational documents (policies and procedures for staff and trainers).
     * Run: cp migrations_trainer_workflow/2026_07_06_000001_create_operational_documents_table.php database/migrations/
     * then: php artisan migrate
     */
    public function up(): void
    {
        Schema::create('operational_documents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('category', 50);
            $table->string('audience', 20)->default('trainer');
            $table->string('storage_path');
            $table->string('file_name');
            $table->string('mime_type', 120)->default('application/pdf');
            $table->string('version', 20)->default('1.0');
            $table->boolean('is_published')->default(false);
            $table->boolean('internal_only')->default(true);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_published', 'audience']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_documents');
    }
};
