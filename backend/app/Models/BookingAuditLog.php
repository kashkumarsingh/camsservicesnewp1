<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingAuditLog Model (Domain Layer)
 * 
 * Clean Architecture: Domain Layer
 * Purpose: Represents audit trail entries for booking changes
 * Location: backend/app/Models/BookingAuditLog.php
 * 
 * This model stores a complete audit trail of all changes to bookings,
 * including field-level changes, who made them, and why, for compliance and debugging.
 */
class BookingAuditLog extends Model
{
    use HasFactory;

    /**
     * Action constants
     */
    public const ACTION_CREATED = 'created';
    public const ACTION_UPDATED = 'updated';
    public const ACTION_DELETED = 'deleted';
    public const ACTION_PRICE_CHANGED = 'price_changed';
    public const ACTION_STATUS_CHANGED = 'status_changed';
    public const ACTION_PAYMENT_STATUS_CHANGED = 'payment_status_changed';
    public const ACTION_HOURS_CHANGED = 'hours_changed';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'action',
        'field_name',
        'old_value',
        'new_value',
        'changed_by_user_id',
        'reason',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Indicates if the model should be timestamped.
     * 
     * We only use created_at for audit logs (no updated_at).
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($auditLog) {
            $auditLog->created_at = now();
        });
    }

    /**
     * Get the booking this audit log belongs to.
     *
     * @return BelongsTo
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the user who made the change.
     *
     * @return BelongsTo
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    /**
     * Scope to filter by action type.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $action
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by field name.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $fieldName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByField($query, string $fieldName)
    {
        return $query->where('field_name', $fieldName);
    }

    /**
     * Scope to filter by user who made the change.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('changed_by_user_id', $userId);
    }
}
