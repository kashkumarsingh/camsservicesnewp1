<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\PaymentGatewaySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin Payment Gateway Controller
 *
 * Clean Architecture Layer: Interface (API)
 * Purpose: Admin CRUD for payment gateway keys (Stripe default, PayPal, etc.).
 * Secrets are never returned in list; show returns masked placeholders when set.
 */
class AdminPaymentGatewayController extends Controller
{
    use BaseApiController;

    private const MASKED = '••••••••••••';

    /**
     * Format a gateway for API (no raw secrets in list; show uses masked).
     */
    private function formatGateway(PaymentGatewaySetting $row, bool $maskSecrets = true): array
    {
        $out = [
            'id' => (string) $row->id,
            'gateway' => $row->gateway,
            'displayName' => $row->display_name,
            'hasCredentials' => $row->secret_key !== null && trim((string) $row->secret_key) !== '',
            'isDefault' => (bool) $row->is_default,
            'isActive' => (bool) $row->is_active,
            'createdAt' => $row->created_at?->toIso8601String(),
            'updatedAt' => $row->updated_at?->toIso8601String(),
        ];

        if (! $maskSecrets) {
            $out['publicKey'] = $row->public_key;
            $out['secretKeyMasked'] = $row->secret_key ? self::MASKED : null;
            $out['webhookSecretMasked'] = $row->webhook_secret ? self::MASKED : null;
        }

        return $out;
    }

    /**
     * List all configurable payment gateways (with or without stored config).
     * GET /api/v1/admin/payment-gateways
     */
    public function index(): JsonResponse
    {
        $rows = PaymentGatewaySetting::query()
            ->whereIn('gateway', array_keys(PaymentGatewaySetting::CONFIGURABLE_GATEWAYS))
            ->orderByRaw("CASE WHEN gateway = ? THEN 0 ELSE 1 END", [PaymentGatewaySetting::GATEWAY_STRIPE])
            ->orderBy('gateway')
            ->get();

        $byGateway = $rows->keyBy('gateway');

        $list = [];
        foreach (PaymentGatewaySetting::CONFIGURABLE_GATEWAYS as $slug => $label) {
            $row = $byGateway->get($slug);
            if ($row) {
                $list[] = $this->formatGateway($row, true);
            } else {
                $list[] = [
                    'id' => null,
                    'gateway' => $slug,
                    'displayName' => $label,
                    'hasCredentials' => false,
                    'isDefault' => $slug === PaymentGatewaySetting::GATEWAY_STRIPE,
                    'isActive' => true,
                    'createdAt' => null,
                    'updatedAt' => null,
                ];
            }
        }

        return $this->collectionResponse($list);
    }

    /**
     * Show a single payment gateway by slug.
     * GET /api/v1/admin/payment-gateways/{gateway}
     */
    public function show(string $gateway): JsonResponse
    {
        if (! array_key_exists($gateway, PaymentGatewaySetting::CONFIGURABLE_GATEWAYS)) {
            return $this->notFoundResponse('Payment gateway');
        }

        $row = PaymentGatewaySetting::query()->where('gateway', $gateway)->first();
        if (! $row) {
            return $this->successResponse([
                'id' => null,
                'gateway' => $gateway,
                'displayName' => PaymentGatewaySetting::CONFIGURABLE_GATEWAYS[$gateway],
                'hasCredentials' => false,
                'isDefault' => $gateway === PaymentGatewaySetting::GATEWAY_STRIPE,
                'isActive' => true,
                'publicKey' => null,
                'secretKeyMasked' => null,
                'webhookSecretMasked' => null,
                'createdAt' => null,
                'updatedAt' => null,
            ]);
        }

        return $this->successResponse($this->formatGateway($row, false));
    }

    /**
     * Create or update a payment gateway config.
     * PUT /api/v1/admin/payment-gateways/{gateway}
     */
    public function update(Request $request, string $gateway): JsonResponse
    {
        if (! array_key_exists($gateway, PaymentGatewaySetting::CONFIGURABLE_GATEWAYS)) {
            return $this->notFoundResponse('Payment gateway');
        }

        $validated = $request->validate([
            'secretKey' => ['nullable', 'string', 'max:2048'],
            'publicKey' => ['nullable', 'string', 'max:512'],
            'webhookSecret' => ['nullable', 'string', 'max:2048'],
            'isDefault' => ['nullable', 'boolean'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $row = PaymentGatewaySetting::query()->where('gateway', $gateway)->first();
        if (! $row) {
            $row = new PaymentGatewaySetting();
            $row->gateway = $gateway;
            $row->display_name = PaymentGatewaySetting::CONFIGURABLE_GATEWAYS[$gateway];
            $row->is_default = $gateway === PaymentGatewaySetting::GATEWAY_STRIPE;
            $row->is_active = true;
        }

        if (array_key_exists('secretKey', $validated)) {
            $row->secret_key = $validated['secretKey'] ? trim($validated['secretKey']) : null;
        }
        if (array_key_exists('publicKey', $validated)) {
            $row->public_key = $validated['publicKey'] ? trim($validated['publicKey']) : null;
        }
        if (array_key_exists('webhookSecret', $validated)) {
            $row->webhook_secret = $validated['webhookSecret'] ? trim($validated['webhookSecret']) : null;
        }
        if (array_key_exists('isDefault', $validated)) {
            $row->is_default = (bool) $validated['isDefault'];
        }
        if (array_key_exists('isActive', $validated)) {
            $row->is_active = (bool) $validated['isActive'];
        }

        $row->save();

        return $this->successResponse($this->formatGateway($row->fresh(), false), 'Payment gateway updated.');
    }
}
