<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add columns for admin "request information" workflow.
     * Admin can send a message to the applicant; applicant can respond; status becomes information_requested until they respond.
     */
    public function up(): void
    {
        Schema::table('trainer_applications', function (Blueprint $table) {
            $table->text('admin_request_message')->nullable()->after('review_notes');
            $table->timestamp('admin_requested_at')->nullable()->after('admin_request_message');
            $table->text('trainer_response_message')->nullable()->after('admin_requested_at');
            $table->timestamp('trainer_response_at')->nullable()->after('trainer_response_message');
        });
    }

    public function down(): void
    {
        Schema::table('trainer_applications', function (Blueprint $table) {
            $table->dropColumn([
                'admin_request_message',
                'admin_requested_at',
                'trainer_response_message',
                'trainer_response_at',
            ]);
        });
    }
};
