<?php

namespace App\Services\Audit;

use Illuminate\Support\Facades\Log;

/**
 * AuditLogger Service (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: Provides a simple implementation for logging audit trails.
 * Location: backend/app/Services/Audit/AuditLogger.php
 * 
 * In a real-world scenario, this could be expanded to write to a dedicated
 * audit trail table in the database, or send logs to an external system.
 * For now, it logs to the standard Laravel log file.
 */
class AuditLogger
{
    public function log(string $action, array $context = []): void
    {
        Log::channel('audit')->info($action, $context);
    }
}
