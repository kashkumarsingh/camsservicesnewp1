<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Child;
use App\Models\Payment;
use App\Models\SafeguardingConcern;
use App\Models\Trainer;
use App\Models\TrainerApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Admin Dashboard Stats Controller
 *
 * Clean Architecture: Application / Interface Layer
 * Purpose: Provides system-wide aggregates for the admin dashboard
 * Guards: Protected by auth:sanctum + admin middleware
 */
class AdminDashboardStatsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        // Bookings overview
        $totalBookings = Booking::count();
        $confirmedBookings = Booking::where('status', Booking::STATUS_CONFIRMED)->count();
        $pendingBookings = Booking::whereIn('status', [Booking::STATUS_DRAFT, Booking::STATUS_PENDING])->count();
        $cancelledBookings = Booking::where('status', Booking::STATUS_CANCELLED)->count();

        // Trend: total bookings now vs at end of last month
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();
        $bookingsLastMonth = Booking::where('created_at', '<=', $endOfLastMonth)->count();
        $bookingsTrendPercent = $bookingsLastMonth > 0
            ? round((($totalBookings - $bookingsLastMonth) / $bookingsLastMonth) * 100, 1)
            : ($totalBookings > 0 ? 100.0 : 0.0);

        // Users overview (focus on parents for approvals)
        $totalUsers = User::count();
        $approvedParents = User::where('role', 'parent')
            ->where('approval_status', User::STATUS_APPROVED)
            ->count();
        $parentsLastMonth = User::where('role', 'parent')
            ->where('approval_status', User::STATUS_APPROVED)
            ->where('created_at', '<=', $endOfLastMonth)
            ->count();
        $parentsTrendPercent = $parentsLastMonth > 0
            ? round((($approvedParents - $parentsLastMonth) / $parentsLastMonth) * 100, 1)
            : ($approvedParents > 0 ? 100.0 : 0.0);

        $pendingParentApprovals = User::where('role', 'parent')
            ->where('approval_status', User::STATUS_PENDING)
            ->count();

        // Trainers overview
        $totalTrainers = Trainer::count();
        $activeTrainers = Trainer::active()->count();
        $trainersLastMonth = Trainer::where('created_at', '<=', $endOfLastMonth)->count();
        $trainersTrendPercent = $trainersLastMonth > 0
            ? round((($totalTrainers - $trainersLastMonth) / $trainersLastMonth) * 100, 1)
            : ($totalTrainers > 0 ? 100.0 : 0.0);

        // Safeguarding & risk alerts
        $pendingSafeguardingConcerns = SafeguardingConcern::where('status', SafeguardingConcern::STATUS_PENDING)->count();

        // Trainer applications awaiting admin review (submitted, not yet approved/rejected)
        $pendingTrainerApplications = TrainerApplication::where('status', TrainerApplication::STATUS_SUBMITTED)->count();

        // Child checklists awaiting admin review:
        // - Child is still pending approval
        // - Checklist has been submitted (exists)
        // - Checklist has not yet been marked as completed by an admin
        $pendingChildChecklists = Child::where('approval_status', Child::STATUS_PENDING)
            ->whereHas('checklist', function ($query) {
                $query->where('checklist_completed', false);
            })
            ->count();

        // Sessions (confirmed bookings) that are scheduled in the future but have no trainer assigned yet.
        // Admin needs to assign a trainer so the parent sees "Trainer to be confirmed" → assigned.
        $today = Carbon::today()->toDateString();
        $sessionsAwaitingTrainerQuery = BookingSchedule::query()
            ->whereNull('trainer_id')
            ->where('status', BookingSchedule::STATUS_SCHEDULED)
            ->whereDate('date', '>=', $today)
            ->whereHas('booking', function ($q) {
                $q->where('status', Booking::STATUS_CONFIRMED);
            });

        $sessionsAwaitingTrainer = (clone $sessionsAwaitingTrainerQuery)->count();

        // Specific list so admin sees which child(ren) need a trainer assigned (e.g. "Test child · 14 Feb · Ref ABC123").
        $sessionsAwaitingTrainerList = (clone $sessionsAwaitingTrainerQuery)
            ->with([
                'booking:id,reference,parent_first_name,parent_last_name',
                'booking.participants.child:id,name',
            ])
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(15)
            ->get()
            ->map(function (BookingSchedule $schedule) {
                $booking = $schedule->booking;
                $childrenSummary = $booking->participants
                    ->map(fn ($p) => $p->child ? $p->child->name : trim(($p->first_name ?? '') . ' ' . ($p->last_name ?? '')))
                    ->filter()
                    ->unique()
                    ->join(', ') ?: '—';

                return [
                    'sessionId' => (string) $schedule->id,
                    'bookingId' => (string) $schedule->booking_id,
                    'reference' => $booking->reference,
                    'parentName' => trim($booking->parent_first_name . ' ' . $booking->parent_last_name) ?: '—',
                    'childrenSummary' => $childrenSummary,
                    'date' => $schedule->date->toDateString(),
                    'startTime' => $schedule->start_time,
                    'endTime' => $schedule->end_time,
                ];
            })
            ->values()
            ->all();

        // Revenue: completed payments for bookings this month and last month (for trend)
        $now = Carbon::now();
        $thisMonthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $revenueThisMonth = (float) Payment::forPayableType(Booking::class)
            ->completed()
            ->where('processed_at', '>=', $thisMonthStart)
            ->sum('amount');

        $revenueLastMonth = (float) Payment::forPayableType(Booking::class)
            ->completed()
            ->whereBetween('processed_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        $revenueTrendPercent = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : ($revenueThisMonth > 0 ? 100.0 : 0.0);

        // Upcoming sessions count (next 7 days, confirmed bookings only)
        $todayCarbon = Carbon::today();
        $upcomingEnd = $todayCarbon->copy()->addDays(7);
        $upcomingSessionsCount = BookingSchedule::query()
            ->where('status', BookingSchedule::STATUS_SCHEDULED)
            ->whereDate('date', '>', $today)
            ->whereDate('date', '<=', $upcomingEnd->toDateString())
            ->whereHas('booking', function ($q) {
                $q->where('status', Booking::STATUS_CONFIRMED);
            })
            ->count();

        // Last 7 days daily session counts for sparklines
        $sparklineStart = $todayCarbon->copy()->subDays(6);
        $sparklineCounts = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $sparklineStart->copy()->addDays($i);
            $sparklineCounts[] = BookingSchedule::query()
                ->where('status', BookingSchedule::STATUS_SCHEDULED)
                ->whereDate('date', $day->toDateString())
                ->whereHas('booking', function ($q) {
                    $q->where('status', Booking::STATUS_CONFIRMED);
                })
                ->count();
        }

        // Current week Mon–Fri session counts for mini week calendar
        $weekStart = $todayCarbon->copy()->startOfWeek(Carbon::MONDAY);
        $weekDayCounts = [];
        for ($i = 0; $i < 5; $i++) {
            $day = $weekStart->copy()->addDays($i);
            $weekDayCounts[] = BookingSchedule::query()
                ->where('status', BookingSchedule::STATUS_SCHEDULED)
                ->whereDate('date', $day->toDateString())
                ->whereHas('booking', function ($q) {
                    $q->where('status', Booking::STATUS_CONFIRMED);
                })
                ->count();
        }

        // Pending payments: confirmed/draft/pending bookings with outstanding amount (payment_status pending/partial)
        $pendingPaymentsQuery = Booking::query()
            ->whereIn('status', [Booking::STATUS_DRAFT, Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
            ->whereIn('payment_status', [Booking::PAYMENT_STATUS_PENDING, Booking::PAYMENT_STATUS_PARTIAL])
            ->whereRaw('(total_price - COALESCE(paid_amount, 0) - COALESCE(discount_amount, 0)) > 0');

        $pendingPaymentsCount = (clone $pendingPaymentsQuery)->count();
        $pendingPaymentsList = (clone $pendingPaymentsQuery)
            ->with('package:id,name')
            ->orderByRaw('CASE WHEN next_payment_due_at IS NOT NULL AND next_payment_due_at < ? THEN 0 ELSE 1 END', [$today])
            ->orderBy('next_payment_due_at')
            ->limit(15)
            ->get()
            ->map(function (Booking $b) use ($today) {
                $outstanding = (float) max(0, $b->total_price - $b->paid_amount - ($b->discount_amount ?? 0));
                $dueAt = $b->next_payment_due_at?->toDateString();
                return [
                    'bookingId' => (string) $b->id,
                    'reference' => $b->reference,
                    'amount' => round($outstanding, 2),
                    'parentName' => trim($b->parent_first_name . ' ' . $b->parent_last_name) ?: '—',
                    'nextPaymentDueAt' => $dueAt,
                    'overdueDays' => $dueAt ? max(0, (int) Carbon::parse($today)->diffInDays(Carbon::parse($dueAt), false) * -1) : null,
                    'packageName' => $b->package?->name ?? '—',
                ];
            })
            ->values()
            ->all();

        // Children with 0 hours: distinct children linked to a confirmed booking with remaining_hours <= 0
        $zeroHoursBookings = Booking::query()
            ->where('status', Booking::STATUS_CONFIRMED)
            ->where('remaining_hours', '<=', 0)
            ->with(['participants.child', 'package:id,name'])
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get();
        $seenChildIds = [];
        $childrenWithZeroHoursList = [];
        foreach ($zeroHoursBookings as $booking) {
            foreach ($booking->participants as $participant) {
                $child = $participant->child;
                if (!$child || in_array($child->id, $seenChildIds, true)) {
                    continue;
                }
                $seenChildIds[] = $child->id;
                $childrenWithZeroHoursList[] = [
                    'childId' => (string) $child->id,
                    'childName' => $child->name,
                    'parentName' => trim($booking->parent_first_name . ' ' . $booking->parent_last_name) ?: '—',
                    'bookingId' => (string) $booking->id,
                    'reference' => $booking->reference,
                    'packageName' => $booking->package?->name ?? '—',
                    'remainingHours' => (float) $booking->remaining_hours,
                ];
                if (count($childrenWithZeroHoursList) >= 15) {
                    break 2;
                }
            }
        }
        $childrenWithZeroHoursCount = Child::query()
            ->whereHas('bookingParticipants', function ($q) {
                $q->whereHas('booking', function ($q2) {
                    $q2->where('status', Booking::STATUS_CONFIRMED)->where('remaining_hours', '<=', 0);
                });
            })
            ->count();

        // Today's sessions count (for alert bar)
        $todaySessionsCount = BookingSchedule::query()
            ->where('status', BookingSchedule::STATUS_SCHEDULED)
            ->whereDate('date', $today)
            ->whereHas('booking', function ($q) {
                $q->where('status', Booking::STATUS_CONFIRMED);
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'bookings' => [
                    'total' => $totalBookings,
                    'confirmed' => $confirmedBookings,
                    'pending' => $pendingBookings,
                    'cancelled' => $cancelledBookings,
                    'trendPercent' => $bookingsTrendPercent,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'parentsApproved' => $approvedParents,
                    'parentsPendingApproval' => $pendingParentApprovals,
                    'trendPercent' => $parentsTrendPercent,
                ],
                'trainers' => [
                    'total' => $totalTrainers,
                    'active' => $activeTrainers,
                    'trendPercent' => $trainersTrendPercent,
                ],
                'alerts' => [
                    'pendingSafeguardingConcerns' => $pendingSafeguardingConcerns,
                    'pendingParentApprovals' => $pendingParentApprovals,
                    'pendingChildChecklists' => $pendingChildChecklists,
                    'pendingTrainerApplications' => $pendingTrainerApplications,
                    'sessionsAwaitingTrainer' => $sessionsAwaitingTrainer,
                    'sessionsAwaitingTrainerList' => $sessionsAwaitingTrainerList,
                    'pendingPaymentsCount' => $pendingPaymentsCount,
                    'pendingPaymentsList' => $pendingPaymentsList,
                    'childrenWithZeroHoursCount' => $childrenWithZeroHoursCount,
                    'childrenWithZeroHoursList' => $childrenWithZeroHoursList,
                ],
                'revenue' => [
                    'thisMonth' => $revenueThisMonth,
                    'lastMonth' => $revenueLastMonth,
                    'trendPercent' => $revenueTrendPercent,
                ],
                'upcomingSessionsCount' => $upcomingSessionsCount,
                'sparklineCounts' => $sparklineCounts,
                'weekDayCounts' => $weekDayCounts,
                'todaySessionsCount' => $todaySessionsCount,
            ],
        ]);
    }
}

