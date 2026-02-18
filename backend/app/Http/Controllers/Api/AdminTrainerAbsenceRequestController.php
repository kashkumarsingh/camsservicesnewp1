<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainerAbsenceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Admin: list pending trainer absence requests and approve/reject.
 */
class AdminTrainerAbsenceRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TrainerAbsenceRequest::with(['trainer:id,user_id', 'trainer.user:id,name,email'])
            ->pending()
            ->orderBy('date_from');

        if ($request->query('trainer_id')) {
            $query->where('trainer_id', $request->query('trainer_id'));
        }

        $requests = $query->get();

        return response()->json([
            'success' => true,
            'data' => [
                'requests' => $requests->map(fn ($r) => [
                    'id' => $r->id,
                    'trainer_id' => $r->trainer_id,
                    'trainer_name' => $r->trainer?->user?->name,
                    'date_from' => $r->date_from->format('Y-m-d'),
                    'date_to' => $r->date_to->format('Y-m-d'),
                    'reason' => $r->reason,
                    'created_at' => $r->created_at->toIso8601String(),
                ]),
            ],
        ], 200);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $absence = TrainerAbsenceRequest::find($id);
        if (! $absence) {
            return response()->json(['success' => false, 'message' => 'Absence request not found.'], 404);
        }
        if ($absence->status !== TrainerAbsenceRequest::STATUS_PENDING) {
            return response()->json(['success' => false, 'message' => 'Request is not pending.'], 422);
        }

        $absence->update([
            'status' => TrainerAbsenceRequest::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absence approved.',
            'data' => [
                'id' => $absence->id,
                'status' => $absence->status,
                'date_from' => $absence->date_from->format('Y-m-d'),
                'date_to' => $absence->date_to->format('Y-m-d'),
            ],
        ], 200);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => ['nullable', 'string', 'max:500'],
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $absence = TrainerAbsenceRequest::find($id);
        if (! $absence) {
            return response()->json(['success' => false, 'message' => 'Absence request not found.'], 404);
        }
        if ($absence->status !== TrainerAbsenceRequest::STATUS_PENDING) {
            return response()->json(['success' => false, 'message' => 'Request is not pending.'], 422);
        }

        $absence->update([
            'status' => TrainerAbsenceRequest::STATUS_REJECTED,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'reason' => $request->input('reason', $absence->reason),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Absence rejected.',
            'data' => ['id' => $absence->id, 'status' => $absence->status],
        ], 200);
    }
}
