<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Trainer Session Payment (Domain Layer)
 *
 * One record per completed session: amount owed to trainer, status (pending/paid).
 */
class TrainerSessionPayment extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';

    protected $fillable = [
        'booking_schedule_id',
        'trainer_id',
        'amount',
        'currency',
        'rate_type_snapshot',
        'rate_amount_snapshot',
        'duration_hours_used',
        'status',
        'paid_at',
        'paid_by_user_id',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'rate_amount_snapshot' => 'decimal:2',
        'duration_hours_used' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function bookingSchedule(): BelongsTo
    {
        return $this->belongsTo(BookingSchedule::class, 'booking_schedule_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by_user_id');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }
}
