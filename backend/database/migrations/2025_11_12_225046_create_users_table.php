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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone', 15)->nullable();
            $table->text('address')->nullable();
            $table->string('postcode', 10)->nullable();
            $table->enum('role', ['parent', 'trainer', 'admin', 'super_admin'])->default('parent');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('email', 'idx_users_email');
            $table->index('role', 'idx_users_role');
            $table->index('deleted_at', 'idx_users_deleted_at');
            
            // Composite indexes for common queries
            $table->index(['role', 'deleted_at'], 'idx_users_role_not_deleted');
            $table->index(['email', 'deleted_at'], 'idx_users_email_not_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
