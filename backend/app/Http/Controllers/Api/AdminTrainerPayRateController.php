<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\TrainerSessionPay\GetTrainerPayRateAction;
use App\Actions\TrainerSessionPay\UpsertTrainerPayRateAction;
use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Admin: set trainer pay rate (hourly or per-session). Used for pay-after-session.
 */
class AdminTrainerPayRateController extends Controller
{
    use BaseApiController;

    public function __construct(
        private readonly GetTrainerPayRateAction $getRatesAction,
        private readonly UpsertTrainerPayRateAction $upsertRateAction
    ) {
    }

    /** GET /api/v1/admin/trainers/{id}/pay-rates */
    public function index(string $id): JsonResponse
    {
        $trainer = Trainer::find((int) $id);
        if (!$trainer) {
            return $this->notFoundResponse('Trainer');
        }
        $rates = $this->getRatesAction->forTrainer($trainer->id, false);
        $data = $rates->map(fn ($r) => [
            'id' => $r->id,
            'rateType' => $r->rate_type,
            'amount' => (float) $r->amount,
            'currency' => $r->currency,
            'effectiveFrom' => $r->effective_from?->format('Y-m-d'),
            'effectiveTo' => $r->effective_to?->format('Y-m-d'),
            'notes' => $r->notes,
        ]);
        return $this->successResponse($data);
    }

    /** POST /api/v1/admin/trainers/{id}/pay-rates. Body: rate_type (hourly|per_session), amount, currency (optional), effective_from (optional) */
    public function store(Request $request, string $id): JsonResponse
    {
        $trainer = Trainer::find((int) $id);
        if (!$trainer) {
            return $this->notFoundResponse('Trainer');
        }
        $validator = Validator::make($request->all(), [
            'rate_type' => 'required|in:hourly,per_session',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'effective_from' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse('Validation failed.', null, $validator->errors()->toArray(), 422);
        }
        $data = $validator->validated();
        $data['currency'] = $data['currency'] ?? 'GBP';
        $rate = $this->upsertRateAction->execute($trainer->id, $data);
        return $this->successResponse([
            'id' => $rate->id,
            'rateType' => $rate->rate_type,
            'amount' => (float) $rate->amount,
            'currency' => $rate->currency,
        ], 'Pay rate added.', [], 201);
    }
}
