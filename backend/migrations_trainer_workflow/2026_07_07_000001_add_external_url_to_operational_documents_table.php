<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Optional public URL (e.g. Google Drive) when file is not stored on disk.
     */
    public function up(): void
    {
        Schema::table('operational_documents', function (Blueprint $table) {
            $table->string('external_url', 2048)->nullable()->after('storage_path');
        });
    }

    public function down(): void
    {
        Schema::table('operational_documents', function (Blueprint $table) {
            $table->dropColumn('external_url');
        });
    }
};
