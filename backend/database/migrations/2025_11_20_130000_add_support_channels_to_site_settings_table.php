<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add support notification channels to site settings.
     */
    public function up(): void
    {
        // Check if table exists before modifying
        if (!Schema::hasTable('site_settings')) {
            return;
        }
        
        // Check if columns already exist (idempotent)
        if (Schema::hasColumn('site_settings', 'support_emails')) {
            return;
        }
        
        Schema::table('site_settings', function (Blueprint $table) {
            $table->json('support_emails')
                ->nullable()
                ->after('map_embed_url')
                ->comment('Array of email recipients for contact notifications');

            $table->json('support_whatsapp_numbers')
                ->nullable()
                ->after('support_emails')
                ->comment('Array of WhatsApp numbers for contact notifications');
        });
    }

    /**
     * Rollback support notification columns.
     */
    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['support_emails', 'support_whatsapp_numbers']);
        });
    }
};

