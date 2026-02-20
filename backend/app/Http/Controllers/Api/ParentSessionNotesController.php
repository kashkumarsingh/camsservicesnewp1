<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Models\BookingSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Parent Session Notes API
 *
 * Clean Architecture: Interface Adapter (API Controller)
 * Purpose: Return trainer notes for completed sessions belonging to the authenticated parent's bookings.
 * Location: backend/app/Http/Controllers/Api/ParentSessionNotesController.php
 *
 * Parents see non-private trainer notes for their children's completed sessions only.
 */
class ParentSessionNotesController extends Controller
{
    use BaseApiController;
    /**
     * Maximum length for note snippet in list view.
     */
    private const NOTE_SNIPPET_LENGTH = 120;

    /**
     * Maximum number of session note items to return.
     */
    private const MAX_ITEMS = 50;

    /**
     * List session notes for the authenticated parent.
     *
     * Returns completed schedules (for the parent's confirmed, paid bookings) that have
     * at least one non-private trainer note. One item per (schedule, child) so each
     * child on the booking gets an entry.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $schedules = BookingSchedule::query()
            ->whereHas('booking', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('status', 'confirmed')
                    ->where('payment_status', 'paid');
            })
            ->where('status', BookingSchedule::STATUS_COMPLETED)
            ->whereHas('notes', function ($q) {
                $q->where('is_private', false);
            })
            ->with([
                'booking.participants.child',
                'notes' => function ($q) {
                    $q->where('is_private', false)->orderBy('created_at', 'desc');
                },
            ])
            ->orderByDesc('date')
            ->orderByDesc('start_time')
            ->limit(self::MAX_ITEMS * 2)
            ->get();

        $items = [];
        $seen = [];

        foreach ($schedules as $schedule) {
            $notes = $schedule->notes;
            if ($notes->isEmpty()) {
                continue;
            }

            $noteBody = $notes->pluck('note')->filter()->implode("\n\n");
            $noteSnippet = \Illuminate\Support\Str::limit($noteBody, self::NOTE_SNIPPET_LENGTH);
            $dateStr = $schedule->date instanceof \Carbon\Carbon
                ? $schedule->date->format('Y-m-d')
                : (string) $schedule->date;

            $participants = $schedule->booking->participants;
            foreach ($participants as $participant) {
                $child = $participant->child;
                $childId = $child?->id;
                $childName = $child?->name ?? $participant->full_name ?? 'Child';

                if ($childId === null) {
                    $childId = 0;
                }

                $key = $schedule->id . '-' . $childId;
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $items[] = [
                    'scheduleId' => (string) $schedule->id,
                    'date' => $dateStr,
                    'childId' => (int) $childId,
                    'childName' => $childName,
                    'noteSnippet' => $noteSnippet,
                    'noteBody' => $noteBody,
                ];
            }

            if (count($items) >= self::MAX_ITEMS) {
                break;
            }
        }

        return $this->successResponse([
            'sessionNotes' => array_slice($items, 0, self::MAX_ITEMS),
        ]);
    }
}
