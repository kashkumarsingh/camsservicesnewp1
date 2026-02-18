<?php

namespace App\Actions\Booking;

use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Trainer;
use App\Contracts\Booking\IBookingScheduleRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Auto-Assign Trainer Action (Application Layer)
 *
 * Intelligent auto-assignment:
 * 1. Activity qualifications
 * 2. Location (postcode service area)
 * 3. Trainer availability (TrainerAvailability calendar)
 * 4. No scheduling conflicts
 * 5. Score and pick best match
 */
class AutoAssignTrainerAction
{
    public function __construct(
        private readonly IBookingScheduleRepository $scheduleRepository,
        private readonly CheckTrainerAvailabilityAction $checkTrainerAvailability,
        private readonly ScoreTrainerForSessionAction $scoreTrainerForSession
    ) {
    }

    /**
     * Attempt to auto-assign a qualified trainer to the schedule.
     *
     * @param BookingSchedule $schedule
     * @param array<int> $excludeTrainerIds Trainers to skip (e.g. after decline)
     * @return Trainer|null
     */
    public function execute(BookingSchedule $schedule, array $excludeTrainerIds = []): ?Trainer
    {
        $booking = $schedule->booking;

        if (!$booking) {
            Log::warning('AutoAssignTrainer: No booking found for schedule', [
                'schedule_id' => $schedule->id,
            ]);
            return null;
        }

        // Step 1: Get package activities
        $packageActivities = $booking->package?->activities ?? collect();

        if ($packageActivities->isEmpty()) {
            Log::info('AutoAssignTrainer: No package activities to match', [
                'schedule_id' => $schedule->id,
                'booking_id' => $booking->id,
            ]);
            // No specific activities required - get all active trainers
            $qualifiedTrainers = Trainer::where('is_active', true)->get();
        } else {
            // Step 2: Find trainers qualified for these activities
            $activityIds = $packageActivities->pluck('id')->toArray();
            
            $qualifiedTrainers = Trainer::query()
                ->where('is_active', true)
                ->whereHas('activities', function ($query) use ($activityIds) {
                    $query->whereIn('activities.id', $activityIds);
                })
                // Exclude trainers who have any of these activities in their exclusion list
                // Use Laravel's JSON helpers for MySQL/PostgreSQL compatibility (no raw JSON_CONTAINS)
                ->where(function ($query) use ($activityIds) {
                    $query->whereNull('excluded_activity_ids')
                        ->orWhere(function ($query) use ($activityIds) {
                            foreach ($activityIds as $id) {
                                $query->whereJsonDoesntContain('excluded_activity_ids', (int) $id);
                            }
                        });
                })
                ->get();
        }

        if ($qualifiedTrainers->isEmpty()) {
            Log::warning('AutoAssignTrainer: No qualified trainers found', [
                'schedule_id' => $schedule->id,
                'activity_ids' => $packageActivities->pluck('id')->toArray(),
            ]);
            return null;
        }

        if ($excludeTrainerIds !== []) {
            $qualifiedTrainers = $qualifiedTrainers->whereNotIn('id', $excludeTrainerIds)->values();
            if ($qualifiedTrainers->isEmpty()) {
                Log::warning('AutoAssignTrainer: All qualified trainers excluded', [
                    'schedule_id' => $schedule->id,
                    'exclude_trainer_ids' => $excludeTrainerIds,
                ]);
                return null;
            }
        }

        Log::info('AutoAssignTrainer: Found qualified trainers', [
            'schedule_id' => $schedule->id,
            'qualified_count' => $qualifiedTrainers->count(),
            'trainer_ids' => $qualifiedTrainers->pluck('id')->toArray(),
        ]);

        // Step 3: Filter by location/postcode (if parent postcode is available)
        $locationFilteredTrainers = $this->filterByLocation($qualifiedTrainers, $booking);

        if ($locationFilteredTrainers->isEmpty()) {
            Log::warning('AutoAssignTrainer: No trainers service this location', [
                'schedule_id' => $schedule->id,
                'parent_postcode' => $booking->user?->postcode,
                'qualified_count' => $qualifiedTrainers->count(),
            ]);
            // Fallback to all qualified trainers if no location match
            $locationFilteredTrainers = $qualifiedTrainers;
        }

        // Step 4: Filter by trainer availability calendar (TrainerAvailability)
        $availabilityFiltered = $this->filterByTrainerAvailability($locationFilteredTrainers, $schedule);

        if ($availabilityFiltered->isEmpty()) {
            Log::warning('AutoAssignTrainer: No trainers available in calendar for this slot', [
                'schedule_id' => $schedule->id,
                'date' => $schedule->date,
                'time' => $schedule->start_time . ' - ' . $schedule->end_time,
            ]);
            return null;
        }

        // Step 5: No scheduling conflicts
        $availableTrainers = $this->filterByAvailability($availabilityFiltered, $schedule);

        if ($availableTrainers->isEmpty()) {
            Log::warning('AutoAssignTrainer: No available trainers (all have conflicts)', [
                'schedule_id' => $schedule->id,
                'date' => $schedule->date,
                'time' => $schedule->start_time . ' - ' . $schedule->end_time,
                'availability_filtered_count' => $availabilityFiltered->count(),
            ]);
            return null;
        }

        // Step 6: Score and pick best match
        $scored = $availableTrainers->map(function (Trainer $trainer) use ($schedule) {
            return [
                'trainer' => $trainer,
                'score' => $this->scoreTrainerForSession->execute($trainer, $schedule),
            ];
        });

        $sorted = $scored->sortByDesc('score')->values();
        $best = $sorted->first();
        $selectedTrainer = $best['trainer'];
        $score = $best['score'];

        Log::info('AutoAssignTrainer: Best trainer selected', [
            'schedule_id' => $schedule->id,
            'trainer_id' => $selectedTrainer->id,
            'trainer_name' => $selectedTrainer->name,
            'score' => $score,
            'candidates_count' => $availableTrainers->count(),
        ]);

        return $selectedTrainer;
    }

    /**
     * List all trainers that are available for this session (same filters as execute: qualified, location, availability, no conflict), with score for ordering.
     * Used by admin Assign dropdown so only valid options are shown.
     *
     * @return array<int, array{id: int, name: string, score: int}>
     */
    public function listAvailableForSession(BookingSchedule $schedule): array
    {
        $booking = $schedule->booking;
        if (!$booking) {
            return [];
        }

        $packageActivities = $booking->package?->activities ?? collect();
        $qualifiedTrainers = $packageActivities->isEmpty()
            ? Trainer::where('is_active', true)->get()
            : $this->getQualifiedTrainersForActivities($packageActivities->pluck('id')->toArray());

        if ($qualifiedTrainers->isEmpty()) {
            return [];
        }

        $locationFiltered = $this->filterByLocation($qualifiedTrainers, $booking);
        if ($locationFiltered->isEmpty()) {
            $locationFiltered = $qualifiedTrainers;
        }

        $availabilityFiltered = $this->filterByTrainerAvailability($locationFiltered, $schedule);
        $availableTrainers = $this->filterByAvailability($availabilityFiltered, $schedule);

        return $availableTrainers
            ->map(fn (Trainer $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'score' => $this->scoreTrainerForSession->execute($t, $schedule),
            ])
            ->sortByDesc('score')
            ->values()
            ->all();
    }

    /**
     * List trainers qualified for this session (activity + location only; no calendar availability or conflict check).
     * Used so admin can assign when the strict "available" list is empty (e.g. no trainer has set availability).
     *
     * @return array<int, array{id: int, name: string, score: int}>
     */
    public function listQualifiedForSession(BookingSchedule $schedule): array
    {
        $booking = $schedule->booking;
        if (! $booking) {
            return [];
        }

        $packageActivities = $booking->package?->activities ?? collect();
        $qualifiedTrainers = $packageActivities->isEmpty()
            ? Trainer::where('is_active', true)->get()
            : $this->getQualifiedTrainersForActivities($packageActivities->pluck('id')->toArray());

        if ($qualifiedTrainers->isEmpty()) {
            return [];
        }

        $locationFiltered = $this->filterByLocation($qualifiedTrainers, $booking);
        if ($locationFiltered->isEmpty()) {
            $locationFiltered = $qualifiedTrainers;
        }

        return $locationFiltered
            ->map(fn (Trainer $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'score' => $this->scoreTrainerForSession->execute($t, $schedule),
            ])
            ->sortByDesc('score')
            ->values()
            ->all();
    }

    /**
     * Debug: same pipeline as listAvailableForSession but returns trainer IDs at each step
     * so admins can see why a trainer is missing (qualification, location, availability, conflict).
     *
     * @return array{session_date: string, session_time: string, package_activity_ids: array<int>, parent_postcode: string|null, qualified: array<array{id: int, name: string}>, after_location: array<array{id: int, name: string}>, after_availability: array<array{id: int, name: string}>, after_no_conflict: array<array{id: int, name: string}>, summary: string}
     */
    public function listAvailableForSessionDebug(BookingSchedule $schedule): array
    {
        $booking = $schedule->booking;
        $dateStr = $schedule->date instanceof \Carbon\Carbon
            ? $schedule->date->format('Y-m-d')
            : (string) $schedule->date;
        $sessionTime = $schedule->start_time . '–' . $schedule->end_time;
        $packageActivities = $booking?->package?->activities ?? collect();
        $activityIds = $packageActivities->pluck('id')->toArray();
        $parentPostcode = $booking?->user?->postcode ?? null;

        $toList = fn (Collection $c) => $c->map(fn (Trainer $t) => ['id' => $t->id, 'name' => $t->name])->values()->all();

        if (!$booking) {
            return [
                'session_date' => $dateStr,
                'session_time' => $sessionTime,
                'package_activity_ids' => $activityIds,
                'parent_postcode' => $parentPostcode,
                'qualified' => [],
                'after_location' => [],
                'after_availability' => [],
                'after_no_conflict' => [],
                'summary' => 'Session has no booking.',
            ];
        }

        $qualifiedTrainers = $packageActivities->isEmpty()
            ? Trainer::where('is_active', true)->get()
            : $this->getQualifiedTrainersForActivities($activityIds);

        if ($qualifiedTrainers->isEmpty()) {
            return [
                'session_date' => $dateStr,
                'session_time' => $sessionTime,
                'package_activity_ids' => $activityIds,
                'parent_postcode' => $parentPostcode,
                'qualified' => [],
                'after_location' => [],
                'after_availability' => [],
                'after_no_conflict' => [],
                'summary' => 'No trainers qualified for the package activities. Assign those activities to trainers in Admin → Trainers.',
            ];
        }

        $locationFiltered = $this->filterByLocation($qualifiedTrainers, $booking);
        if ($locationFiltered->isEmpty()) {
            $locationFiltered = $qualifiedTrainers;
        }

        $availabilityFiltered = $this->filterByTrainerAvailability($locationFiltered, $schedule);
        $availableTrainers = $this->filterByAvailability($availabilityFiltered, $schedule);

        $summary = '';
        if ($availableTrainers->isNotEmpty()) {
            $summary = count($availableTrainers) . ' trainer(s) available.';
        } elseif ($availabilityFiltered->isEmpty()) {
            $summary = 'All qualified trainers were filtered out by calendar availability. Ensure the trainer has a weekly or specific-date slot that fully contains the session time (e.g. 09:00–12:00 inside 08:00–17:00).';
        } else {
            $summary = 'All remaining trainers have a scheduling conflict at this date/time.';
        }

        return [
            'session_date' => $dateStr,
            'session_time' => $sessionTime,
            'package_activity_ids' => $activityIds,
            'parent_postcode' => $parentPostcode,
            'qualified' => $toList($qualifiedTrainers),
            'after_location' => $toList($locationFiltered),
            'after_availability' => $toList($availabilityFiltered),
            'after_no_conflict' => $toList($availableTrainers),
            'summary' => $summary,
        ];
    }

    private function getQualifiedTrainersForActivities(array $activityIds): Collection
    {
        return Trainer::query()
            ->where('is_active', true)
            ->whereHas('activities', fn ($q) => $q->whereIn('activities.id', $activityIds))
            ->where(function ($query) use ($activityIds) {
                $query->whereNull('excluded_activity_ids')
                    ->orWhere(function ($query) use ($activityIds) {
                        foreach ($activityIds as $id) {
                            $query->whereJsonDoesntContain('excluded_activity_ids', (int) $id);
                        }
                    });
            })
            ->get();
    }

    /**
     * Filter trainers by TrainerAvailability (weekly + specific date).
     */
    private function filterByTrainerAvailability(Collection $trainers, BookingSchedule $schedule): Collection
    {
        $date = $schedule->date instanceof \Carbon\Carbon
            ? $schedule->date->format('Y-m-d')
            : $schedule->date;
        return $trainers->filter(function (Trainer $trainer) use ($date, $schedule) {
            return $this->checkTrainerAvailability->execute(
                $trainer->id,
                $date,
                $schedule->start_time,
                $schedule->end_time
            );
        })->values();
    }

    /**
     * Filter trainers by location/postcode service area
     *
     * @param \Illuminate\Support\Collection $trainers
     * @param Booking $booking
     * @return \Illuminate\Support\Collection
     */
    private function filterByLocation($trainers, Booking $booking)
    {
        $parentPostcode = $booking->user?->postcode;

        if (!$parentPostcode) {
            // No postcode to filter by - return all trainers
            return $trainers;
        }

        // Filter trainers who service this postcode
        return $trainers->filter(function (Trainer $trainer) use ($parentPostcode) {
            // Check if trainer has service area postcodes defined
            $serviceAreaPostcodes = $trainer->service_area_postcodes;

            if (empty($serviceAreaPostcodes) || !is_array($serviceAreaPostcodes)) {
                // No service area restriction - trainer services all areas
                return true;
            }

            // Check if parent's postcode matches any of trainer's service area
            // Support partial postcode matching (e.g., "SW1A" matches "SW1A 1AA")
            $parentPostcodePrefix = strtoupper(trim(explode(' ', $parentPostcode)[0]));

            foreach ($serviceAreaPostcodes as $servicePostcode) {
                $servicePostcodePrefix = strtoupper(trim(explode(' ', $servicePostcode)[0]));
                
                if (str_starts_with($parentPostcodePrefix, $servicePostcodePrefix) ||
                    str_starts_with($servicePostcodePrefix, $parentPostcodePrefix)) {
                    return true;
                }
            }

            return false;
        });
    }

    /**
     * Filter trainers by availability (no scheduling conflicts)
     *
     * @param \Illuminate\Support\Collection $trainers
     * @param BookingSchedule $newSchedule
     * @return \Illuminate\Support\Collection
     */
    private function filterByAvailability($trainers, BookingSchedule $newSchedule)
    {
        return $trainers->filter(function (Trainer $trainer) use ($newSchedule) {
            return !$this->hasConflict($trainer, $newSchedule);
        });
    }

    /**
     * Check if trainer has a scheduling conflict
     *
     * @param Trainer $trainer
     * @param BookingSchedule $newSchedule
     * @return bool
     */
    private function hasConflict(Trainer $trainer, BookingSchedule $newSchedule): bool
    {
        $conflicts = $this->scheduleRepository->findConflictingSchedules(
            trainerId: $trainer->id,
            date: $newSchedule->date, // Use 'date' not 'scheduled_date'
            startTime: $newSchedule->start_time,
            endTime: $newSchedule->end_time,
            excludeScheduleId: $newSchedule->id
        );

        return $conflicts->isNotEmpty();
    }
}
