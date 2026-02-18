<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardStatsController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = Auth::user();
        $children = $user->children()->get();
        $approvedChildren = $children->where('approval_status', 'approved');
        $bookings = $user->bookings()->with('participants', 'package')->get();

        $pendingBookings = $bookings->whereIn('status', ['pending', 'draft'])->count();
        $confirmedBookings = $bookings->where('status', 'confirmed')->count();

        $totalBookedSessions = $bookings->reduce(function ($sum, $booking) {
            return $sum + $booking->schedules()->whereNotIn('status', ['cancelled', 'rejected'])->count();
        }, 0);

        $totalOutstanding = $bookings->sum('outstandingAmount');
        $pendingChildren = $children->where('approval_status', 'pending')->count();
        $rejectedChildren = $children->where('approval_status', 'rejected')->count();

        $childrenNeedingChecklist = $children->where('approval_status', 'pending')
            ->where(fn ($child) => !$child->has_checklist)
            ->count();
            
        $childrenWithPendingChecklist = $children->where('approval_status', 'pending')
            ->where(fn ($child) => $child->has_checklist && !$child->checklist_completed)
            ->count();

        $confirmedPaidBookings = $bookings->where('status', 'confirmed')->where('payment_status', 'paid');

        $activeBookings = $approvedChildren->map(function ($child) use ($confirmedPaidBookings) {
            return $confirmedPaidBookings
                ->filter(fn ($b) => $b->participants->pluck('child_id')->contains($child->id))
                ->sortByDesc('created_at')
                ->first();
        })->filter();

        $totalHoursPurchased = $activeBookings->sum('totalHours');
        $totalHoursBooked = $activeBookings->sum('bookedHours');

        $activePackageNames = $activeBookings->pluck('package.name')->unique()->values();

        $activePackagesPerChild = $approvedChildren->map(function ($child) use ($confirmedPaidBookings, $activeBookings) {
            $childBookings = $confirmedPaidBookings
                ->filter(fn ($b) => $b->participants->pluck('child_id')->contains($child->id))
                ->sortByDesc('created_at');

            $activeBooking = $activeBookings->first(fn ($b) => $b->participants->pluck('child_id')->contains($child->id));

            return [
                'childId' => $child->id,
                'childName' => $child->name,
                'activePackagesCount' => $activeBooking ? 1 : 0,
                'activePackages' => $activeBooking ? [[
                    'id' => $activeBooking->id,
                    'reference' => $activeBooking->reference,
                    'packageName' => $activeBooking->package->name ?? 'Package',
                    'totalHours' => $activeBooking->totalHours ?? 0,
                    'bookedHours' => $activeBooking->bookedHours ?? 0,
                    'usedHours' => $activeBooking->usedHours ?? 0,
                    'remainingHours' => $activeBooking->remainingHours ?? 0,
                    'packageExpiresAt' => $activeBooking->packageExpiresAt,
                ]] : [],
                'allBookings' => $childBookings->map(fn ($b) => ([
                    'id' => $b->id,
                    'reference' => $b->reference,
                    'packageName' => $b->package->name ?? 'Package',
                    'totalHours' => $b->totalHours ?? 0,
                    'bookedHours' => $b->bookedHours ?? 0,
                    'usedHours' => $b->usedHours ?? 0,
                    'remainingHours' => $b->remainingHours ?? 0,
                    'isActive' => $b->id === $activeBooking?->id,
                    'createdAt' => $b->createdAt,
                ])),
            ];
        });

        $totalActivePackages = $activePackagesPerChild->sum('activePackagesCount');

        return response()->json([
            'success' => true,
            'data' => [
                'approvedChildrenCount' => $approvedChildren->count(),
                'totalChildren' => $children->count(),
                'pendingChildren' => $pendingChildren,
                'rejectedChildren' => $rejectedChildren,
                'childrenNeedingChecklist' => $childrenNeedingChecklist,
                'childrenWithPendingChecklist' => $childrenWithPendingChecklist,
                'totalBookings' => $bookings->count(),
                'pendingBookings' => $pendingBookings,
                'confirmedBookings' => $confirmedBookings,
                'totalBookedSessions' => $totalBookedSessions,
                'totalOutstanding' => $totalOutstanding,
                'totalHoursPurchased' => $totalHoursPurchased,
                'totalHoursBooked' => $totalHoursBooked,
                'activePackageNames' => $activePackageNames,
                'activePackagesPerChild' => $activePackagesPerChild,
                'totalActivePackages' => $totalActivePackages,
            ],
        ]);
    }
}
