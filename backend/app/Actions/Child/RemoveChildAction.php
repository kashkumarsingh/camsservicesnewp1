<?php

namespace App\Actions\Child;

use App\Models\Child;
use Illuminate\Support\Facades\DB;
use App\Services\Audit\AuditLogger;

/**
 * RemoveChildAction (Application Layer)
 * 
 * Clean Architecture: Application Layer
 * Purpose: Encapsulates the business logic for safely removing a child record.
 * Location: backend/app/Actions/Child/RemoveChildAction.php
 * 
 * This action is responsible for:
 * - Transactional integrity (all or nothing)
 * - Deleting the child's checklist
 * - Permanently deleting the child record
 * - Creating an audit log of the removal
 */
class RemoveChildAction
{
    protected $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function execute(Child $child): void
    {
        DB::transaction(function () use ($child) {
            // 1. Delete associated checklist if it exists
            $child->checklist()->delete();

            // 2. Permanently delete the child record
            $child->forceDelete();

            // 3. Log the removal action
            $this->auditLogger->log('child.deleted', [
                'child_id' => $child->id,
                'child_name' => $child->name,
                'deleted_by' => auth()->id(),
            ]);
        });
    }
}
