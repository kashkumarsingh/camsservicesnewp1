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
     * Purpose: Creates children table for storing child entities linked to parents
     * Location: backend/database/migrations/
     * 
     * This migration creates:
     * - children table with approval status per child
     * - Links to users (parents)
     * - Address information (can differ from parent)
     * - Approval tracking (who approved, when, why rejected)
     */
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            
            // Parent/Guardian relationship
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('Parent/Guardian who owns this child record');
            
            // Basic Information
            $table->string('name', 100)->comment('Full name of child');
            $table->unsignedTinyInteger('age')->comment('Current age');
            $table->date('date_of_birth')->nullable()->comment('Date of birth (optional)');
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])
                ->nullable()
                ->comment('Gender identity');
            
            // Address (can be different from parent)
            $table->text('address')->nullable()->comment('Street address');
            $table->string('postcode', 10)->nullable()->comment('UK postcode');
            $table->string('city', 100)->nullable()->comment('City');
            $table->string('region', 100)->nullable()->comment('Region/County');
            $table->decimal('latitude', 10, 8)->nullable()->comment('GPS latitude');
            $table->decimal('longitude', 11, 8)->nullable()->comment('GPS longitude');
            
            // Approval Status
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->comment('Child approval status for booking access');
            
            // Approval tracking
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Admin who approved this child');
            
            // Rejection tracking
            $table->text('rejection_reason')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index('user_id', 'idx_children_user_id');
            $table->index('approval_status', 'idx_children_approval_status');
            $table->index(['user_id', 'approval_status'], 'idx_children_user_approval_status');
            $table->index('deleted_at', 'idx_children_deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};

