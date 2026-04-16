<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingAuditLog;
use App\Models\BookingSchedule;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminReportsController extends Controller
{
    use BaseApiController;

    public function revenue(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $periodStart = $request->query('date_from')
            ? Carbon::parse((string) $request->query('date_from'))->startOfDay()
            : $now->copy()->startOfMonth();
        $periodEnd = $request->query('date_to')
            ? Carbon::parse((string) $request->query('date_to'))->endOfDay()
            : $now->copy()->endOfMonth();

        $totalRevenue = (float) Payment::forPayableType(Booking::class)
            ->completed()
            ->whereBetween('processed_at', [$periodStart, $periodEnd])
            ->sum('amount');

        $days = max(1, $periodStart->diffInDays($periodEnd) + 1);
        $prevStart = $periodStart->copy()->subDays($days);
        $prevEnd = $periodStart->copy()->subDay()->endOfDay();

        $previousRevenue = (float) Payment::forPayableType(Booking::class)
            ->completed()
            ->whereBetween('processed_at', [$prevStart, $prevEnd])
            ->sum('amount');

        $trendPercent = $previousRevenue > 0
            ? round((($totalRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : ($totalRevenue > 0 ? 100.0 : 0.0);

        $response = $this->successResponse([
            'totalRevenue' => $totalRevenue,
            'currency' => 'GBP',
            'periodStart' => $periodStart->toDateString(),
            'periodEnd' => $periodEnd->toDateString(),
            'trendPercent' => $trendPercent,
        ]);

        // Backward-compat shim: AdminReportsPageClient historically called legacy endpoints.
        $response->headers->set('X-API-Deprecated', 'true');
        $response->headers->set('X-API-Deprecated-Use', '/api/v1/admin/dashboard/stats');

        return $response;
    }

    public function sessions(Request $request): JsonResponse
    {
        $perPage = max(1, min($request->integer('per_page', 10), 50));

        $query = BookingSchedule::query()
            ->with('booking:id,status')
            ->orderByDesc('date')
            ->orderByDesc('start_time');

        if ($dateFrom = $request->query('date_from')) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo = $request->query('date_to')) {
            $query->whereDate('date', '<=', $dateTo);
        }
        if ($status = $request->query('status')) {
            $query->where('status', (string) $status);
        }

        $sessions = $query->limit($perPage)->get()->map(function (BookingSchedule $schedule) {
            return [
                'id' => (string) $schedule->id,
                'bookingId' => $schedule->booking_id ? (string) $schedule->booking_id : null,
                'date' => $schedule->date?->toDateString(),
                'startTime' => $schedule->start_time,
                'endTime' => $schedule->end_time,
                'status' => $schedule->status,
                'trainerId' => $schedule->trainer_id ? (string) $schedule->trainer_id : null,
                'notes' => $schedule->itinerary_notes,
            ];
        })->values()->all();

        $response = $this->successResponse($sessions);

        // Backward-compat shim: replace with admin dashboard stats derived session lists.
        $response->headers->set('X-API-Deprecated', 'true');
        $response->headers->set('X-API-Deprecated-Use', '/api/v1/admin/dashboard/stats');

        return $response;
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $perPage = max(1, min($request->integer('per_page', 20), 100));

        $query = BookingAuditLog::query()
            ->with('changedBy:id,name,email')
            ->orderByDesc('created_at');

        if ($action = $request->query('action')) {
            $query->where('action', (string) $action);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('field_name', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhereHas('changedBy', function ($userQ) use ($search) {
                        $userQ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $logs = $query->limit($perPage)->get()->map(function (BookingAuditLog $log) {
            return [
                'id' => (string) $log->id,
                'action' => $log->action,
                'actorName' => $log->changedBy?->name,
                'actorEmail' => $log->changedBy?->email,
                'entityType' => 'booking',
                'entityId' => $log->booking_id ? (string) $log->booking_id : null,
                'createdAt' => $log->created_at?->toIso8601String(),
                'metadata' => [
                    'fieldName' => $log->field_name,
                    'oldValue' => $log->old_value,
                    'newValue' => $log->new_value,
                    'reason' => $log->reason,
                    'raw' => $log->metadata,
                ],
            ];
        })->values()->all();

        $response = $this->successResponse($logs);

        // Backward-compat shim: for session-level history, use admin booking activity logs.
        $response->headers->set('X-API-Deprecated', 'true');
        $response->headers->set('X-API-Deprecated-Use', '/api/v1/admin/bookings/sessions/{sessionId}/activity-logs');

        return $response;
    }
}
