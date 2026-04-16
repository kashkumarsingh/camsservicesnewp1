<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * PaymentGatewaySetting Model
 *
 * Clean Architecture Layer: Domain (Eloquent entity)
 *
 * Stores admin-configured payment gateway keys (Stripe, PayPal, etc.).
 * Default gateway is Stripe. Credentials are encrypted at rest.
 * Server-side code should use getConfigFor() to resolve keys (DB over env).
 */
class PaymentGatewaySetting extends Model
{
    public const GATEWAY_STRIPE = 'stripe';
    public const GATEWAY_PAYPAL = 'paypal';

    /** Gateways that can be configured in the dashboard. */
    public const CONFIGURABLE_GATEWAYS = [
        self::GATEWAY_STRIPE => 'Stripe',
        self::GATEWAY_PAYPAL => 'PayPal',
    ];

    protected $fillable = [
        'gateway',
        'display_name',
        'secret_key',
        'public_key',
        'webhook_secret',
        'is_default',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
        'secret_key' => 'encrypted',
        'webhook_secret' => 'encrypted',
    ];

    /**
     * Get effective Stripe config: DB (admin-configured) over env.
     * For use by StripePaymentService and StripeWebhookController.
     *
     * @return array{secret_key: string|null, public_key: string|null, webhook_secret: string|null}
     */
    public static function getEffectiveStripeConfig(): array
    {
        $fromDb = static::getConfigFor(self::GATEWAY_STRIPE);
        return [
            'secret_key' => $fromDb['secret_key'] ?? config('services.stripe.secret_key'),
            'public_key' => $fromDb['public_key'] ?? config('services.stripe.public_key'),
            'webhook_secret' => $fromDb['webhook_secret'] ?? config('services.stripe.webhook_secret'),
        ];
    }

    /**
     * Get resolved config for a gateway (for server-side use only).
     * Returns secret_key, public_key, webhook_secret from DB if set; otherwise null.
     * Callers should fall back to config('services.stripe') etc. when null.
     *
     * @return array{secret_key: string|null, public_key: string|null, webhook_secret: string|null}|null
     */
    public static function getConfigFor(string $gateway): ?array
    {
        $row = static::query()
            ->where('gateway', $gateway)
            ->where('is_active', true)
            ->first();

        if (! $row) {
            return null;
        }

        $secret = $row->secret_key;
        $secret = is_string($secret) ? trim($secret) : $secret;
        if ($secret === '' || $secret === null) {
            return null;
        }

        return [
            'secret_key' => $row->secret_key,
            'public_key' => $row->public_key ? trim((string) $row->public_key) : null,
            'webhook_secret' => $row->webhook_secret ? trim((string) $row->webhook_secret) : null,
        ];
    }

    /**
     * Ensure exactly one default gateway. If setting this record as default, clear others.
     */
    protected static function booted(): void
    {
        static::saving(function (self $model) {
            if ($model->is_default) {
                static::query()
                    ->where('id', '!=', $model->id ?? 0)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });
    }
}
