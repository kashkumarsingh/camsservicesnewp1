<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Payment Model (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer (Data Persistence)
 * Purpose: Eloquent model for payment transactions
 * Location: backend/app/Models/Payment.php
 * 
 * This model:
 * - Represents payment data in the database
 * - Uses polymorphic relationship (payable_type, payable_id)
 * - Can be used for bookings, subscriptions, or other entities
 * - Is independent of Booking domain
 */
class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payable_type',
        'payable_id',
        'amount',
        'currency',
        'payment_method',
        'payment_provider',
        'transaction_id',
        'status',
        'retry_count',
        'last_retry_at',
        'failure_reason',
        'metadata',
        'processed_at',
        'failed_at',
        'refunded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'retry_count' => 'integer',
        'last_retry_at' => 'datetime',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * Get the parent payable model (Booking, Subscription, etc.).
     *
     * @return MorphTo
     */
    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include completed payments.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include pending payments.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include failed payments.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include refunded payments.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRefunded($query)
    {
        return $query->where('status', 'refunded');
    }

    /**
     * Scope a query to only include payments for a specific payable type.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForPayableType($query, string $type)
    {
        return $query->where('payable_type', $type);
    }

    /**
     * Check if the payment is completed.
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if the payment is pending.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the payment is failed.
     *
     * @return bool
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if the payment is refunded.
     *
     * @return bool
     */
    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    /**
     * Check if the payment can be retried.
     *
     * @param  int  $maxRetries
     * @return bool
     */
    public function canBeRetried(int $maxRetries = 3): bool
    {
        return $this->isFailed() && $this->retry_count < $maxRetries;
    }

    /**
     * Mark the payment as completed.
     *
     * @return void
     */
    public function markAsCompleted(): void
    {
        $this->status = 'completed';
        $this->processed_at = now();
        $this->save();
    }

    /**
     * Mark the payment as failed.
     *
     * @param  string|null  $reason
     * @return void
     */
    public function markAsFailed(?string $reason = null): void
    {
        $this->status = 'failed';
        $this->failure_reason = $reason;
        $this->failed_at = now();
        $this->save();
    }

    /**
     * Increment retry count.
     *
     * @return void
     */
    public function incrementRetryCount(): void
    {
        $this->retry_count++;
        $this->last_retry_at = now();
        $this->save();
    }

    /**
     * Mark the payment as refunded.
     *
     * @return void
     */
    public function markAsRefunded(): void
    {
        $this->status = 'refunded';
        $this->refunded_at = now();
        $this->save();
    }

    /**
     * Check if the payment is a refund (negative amount).
     *
     * @return bool
     */
    public function isRefund(): bool
    {
        return $this->amount < 0;
    }
}

