<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Signed data sharing agreement with a local authority.
 */
class LocalAuthorityAgreement extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'local_authority_name',
        'effective_date',
        'expires_at',
        'status',
        'signed_storage_path',
        'signed_file_name',
        'signed_mime_type',
        'contact_name',
        'contact_email',
        'notes',
        'created_by',
        'signed_at',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'expires_at' => 'date',
        'signed_at' => 'datetime',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function hasSignedDocument(): bool
    {
        return $this->signed_storage_path !== null && $this->signed_storage_path !== '';
    }
}
