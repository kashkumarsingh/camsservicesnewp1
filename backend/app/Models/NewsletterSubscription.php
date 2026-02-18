<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'name',
        'active',
        'subscribed_at',
        'unsubscribed_at',
        'ip_address',
        'source',
    ];

    protected $casts = [
        'active' => 'bool',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    /**
     * Activate the subscription.
     */
    public function activate(?string $ipAddress = null): void
    {
        $this->forceFill([
            'active' => true,
            'subscribed_at' => CarbonImmutable::now(),
            'unsubscribed_at' => null,
            'ip_address' => $ipAddress ?? $this->ip_address,
        ])->save();
    }

    /**
     * Deactivate the subscription.
     */
    public function deactivate(?string $ipAddress = null): void
    {
        $this->forceFill([
            'active' => false,
            'unsubscribed_at' => CarbonImmutable::now(),
            'ip_address' => $ipAddress ?? $this->ip_address,
        ])->save();
    }
}

