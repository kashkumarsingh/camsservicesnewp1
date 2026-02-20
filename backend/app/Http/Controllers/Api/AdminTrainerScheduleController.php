<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Api\ErrorCodes;
use App\Http\Controllers\Controller;
use App\Models\BookingSchedule;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin Trainer Schedule Controller (Interface Layer)
 *
 * Clean Architecture: Interface Layer
 * Purpose: Admin view of a specific trainer's booking schedules (sessions)
 * Location: backend/app/Http/Controllers/Api/AdminTrainerScheduleController.php
 */
class AdminTrainerScheduleController extends Controller
{
    use BaseApiController;
    /**
     * List all booking schedules assigned to a trainer (admin view).
     *
     * GET /api/v1/admin/trainers/{id}/schedules
     *
     * Query: date_from, date_to, status, month, year, per_page
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $trainer = Trainer::find($id);

        if (! $trainer) {
            return $this->notFoundResponse('Trainer');
        }

        $query = BookingSchedule::where('trainer_id', $trainer->id)
            ->with([
                'booking:id,reference,package_id,status,user_id',
                'booking.package:id,name,slug',
                'booking.user:id,name,email',
                'activities:id,name,slug',
                'trainer:id,name,slug,user_id',
                'trainer.user:id,email',
                'currentActivity:id,name',
            ])
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc');

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('month')) {
            $query->whereMonth('date', $request->month);
        }
        if ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        }

        $perPage = max(1, min((int) $request->get('per_page', 50), 100));
        $schedules = $query->paginate($perPage);

        $items = $schedules->getCollection()->map(function (BookingSchedule $schedule) {
            return $this->formatSchedule($schedule);
        });

        return $this->successResponse(
            ['schedules' => $items->values()->all()],
            null,
            [
                'pagination' => [
                    'currentPage' => $schedules->currentPage(),
                    'perPage' => $schedules->perPage(),
                    'total' => $schedules->total(),
                    'lastPage' => $schedules->lastPage(),
                    'from' => $schedules->firstItem(),
                    'to' => $schedules->lastItem(),
                ],
            ]
        );
    }

    /**
     * Get a single schedule for a trainer (admin view).
     *
     * GET /api/v1/admin/trainers/{id}/schedules/{scheduleId}
     */
    public function show(string $id, string $scheduleId): JsonResponse
    {
        $trainer = Trainer::find($id);

        if (! $trainer) {
            return $this->notFoundResponse('Trainer');
        }

        $schedule = BookingSchedule::where('id', $scheduleId)
            ->where('trainer_id', $trainer->id)
            ->with([
                'booking:id,reference,package_id,status,user_id,parent_first_name,parent_last_name,parent_email,parent_phone',
                'booking.package:id,name,slug',
                'booking.user:id,name,email',
                'booking.participants.child',
                'activities:id,name,slug',
                'trainer:id,name,slug,user_id,image',
                'trainer.user:id,email,phone',
                'currentActivity:id,name',
                'timeEntries',
            ])
            ->first();

        if (! $schedule) {
            return $this->notFoundResponse('Schedule');
        }

        return $this->successResponse(['schedule' => $this->formatScheduleDetail($schedule)]);
    }

    /**
     * Format a schedule for list response.
     *
     * @return array<string, mixed>
     */
    private function formatSchedule(BookingSchedule $schedule): array
    {
        $booking = $schedule->booking;
        $package = $booking?->package;
        $activities = $schedule->activities;

        return [
            'id' => (string) $schedule->id,
            'booking_id' => (string) $schedule->booking_id,
            'reference' => $booking?->reference,
            'date' => $schedule->date?->toDateString(),
            'start_time' => $schedule->start_time,
            'end_time' => $schedule->end_time,
            'duration_hours' => (float) $schedule->duration_hours,
            'status' => $schedule->status,
            'location' => $schedule->location,
            'package_name' => $package?->name,
            'package_slug' => $package?->slug,
            'activities' => $activities->map(fn ($a) => [
                'id' => (string) $a->id,
                'name' => $a->name,
                'slug' => $a->slug,
            ])->values()->all(),
            'current_activity_id' => $schedule->current_activity_id ? (string) $schedule->current_activity_id : null,
            'current_activity_name' => $schedule->currentActivity?->name,
            'trainer_id' => (string) $schedule->trainer_id,
            'trainer_name' => $schedule->trainer?->name,
        ];
    }

    /**
     * Format a schedule for single (detail) response.
     *
     * @return array<string, mixed>
     */
    private function formatScheduleDetail(BookingSchedule $schedule): array
    {
        $base = $this->formatSchedule($schedule);

        $clockIn = $schedule->timeEntries
            ->where('type', \App\Models\TimeEntry::TYPE_CLOCK_IN)
            ->sortByDesc('recorded_at')
            ->first();
        $clockOut = $schedule->timeEntries
            ->where('type', \App\Models\TimeEntry::TYPE_CLOCK_OUT)
            ->sortByDesc('recorded_at')
            ->first();

        $base['clocked_in_at'] = $clockIn?->recorded_at?->toIso8601String();
        $base['clocked_out_at'] = $clockOut?->recorded_at?->toIso8601String();
        $base['parent_name'] = $schedule->booking
            ? trim($schedule->booking->parent_first_name . ' ' . $schedule->booking->parent_last_name)
            : null;
        $base['parent_email'] = $schedule->booking?->parent_email;
        $base['parent_phone'] = $schedule->booking?->parent_phone;
        $base['participants'] = $schedule->booking?->participants?->map(function ($p) {
            $child = $p->child;

            return [
                'id' => (string) $p->child_id,
                'name' => $child?->name ?? 'Unknown',
            ];
        })->values()->all() ?? [];

        return $base;
    }
}
