<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * User Model (Domain Layer)
 *
 * Represents a user entity in the system.
 * This is part of the Domain layer in Clean Architecture.
 * Admin access is handled by the Next.js dashboard.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'postcode',
        'role',
        'approval_status',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'rejected_at',
        'registration_source',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    /**
     * Approval status constants
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Get the in-app dashboard notifications (bell) for this user.
     *
     * @return HasMany
     */
    public function dashboardNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    /**
     * Get the bookings for this user.
     *
     * @return HasMany
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the children for this user (parent/guardian).
     *
     * @return HasMany
     */
    public function children(): HasMany
    {
        return $this->hasMany(Child::class);
    }

    /**
     * Get the approved children for this user.
     *
     * @return HasMany
     */
    public function approvedChildren(): HasMany
    {
        return $this->hasMany(Child::class)->where('approval_status', Child::STATUS_APPROVED);
    }

    /**
     * Get the checklist for this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function checklist(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserChecklist::class);
    }

    /**
     * Get the admin who approved this user.
     *
     * @return BelongsTo
     */
    public function approvedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the users approved by this admin.
     *
     * @return HasMany
     */
    public function approvedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'approved_by');
    }

    /**
     * Get the children approved by this admin.
     *
     * @return HasMany
     */
    public function approvedChildrenAsAdmin(): HasMany
    {
        return $this->hasMany(Child::class, 'approved_by');
    }

    /**
     * Check if the user is approved.
     *
     * @return bool
     */
    public function isApproved(): bool
    {
        return $this->approval_status === self::STATUS_APPROVED;
    }

    /**
     * Check if the user is pending approval.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->approval_status === self::STATUS_PENDING;
    }

    /**
     * Check if the user is rejected.
     *
     * @return bool
     */
    public function isRejected(): bool
    {
        return $this->approval_status === self::STATUS_REJECTED;
    }

    /**
     * Check if the user can book packages.
     * Requires: approved user + at least one approved child
     *
     * @return bool
     */
    public function canBook(): bool
    {
        if (!$this->isApproved()) {
            return false;
        }

        return $this->approvedChildren()->count() > 0;
    }

    /**
     * Check if the user has an admin role (for Next.js dashboard / API guards).
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }
}
