<?php

use App\Http\Controllers\Api\ContactSubmissionController;
use App\Http\Controllers\Api\NewsletterSubscriptionController;
use App\Http\Controllers\Api\TrainerApplicationController;
use App\Support\ApiResponseHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint (no caching, always fresh, outside cache middleware for speed)
// Uses standard envelope (success, data, meta) via ApiResponseHelper
Route::prefix('v1')->get('/health', function (Request $request) {
    $health = [
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => 'Laravel API',
        'version' => 'v1',
        'environment' => config('app.env'),
        'database' => [
            'status' => 'connected',
            'driver' => config('database.default'),
        ],
        'cache' => [
            'status' => 'operational',
            'driver' => config('cache.default'),
        ],
    ];

    try {
        DB::connection()->getPdo();
        $health['database']['status'] = 'connected';
    } catch (\Exception $e) {
        $health['database']['status'] = 'disconnected';
        $health['database']['error'] = $e->getMessage();
    }

    \Cache::put('health_check', 'ok', 1);

    return ApiResponseHelper::successResponse($health, null, [], 200, $request);
});

// Authentication routes
Route::prefix('v1')->group(function () {
    Route::post('auth/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/user', [\App\Http\Controllers\Api\AuthController::class, 'user']);
        Route::post('auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
        
        // Parent profile (self-service)
        Route::get('user/profile', [\App\Http\Controllers\Api\ParentProfileController::class, 'show']);
        Route::put('user/profile', [\App\Http\Controllers\Api\ParentProfileController::class, 'update']);
        
        // Children CRUD
        Route::post('children/{id}/archive', [\App\Http\Controllers\Api\ChildController::class, 'archive']);
        Route::apiResource('children', \App\Http\Controllers\Api\ChildController::class);
        
        // Child Checklists
        Route::get('children/{childId}/checklist', [\App\Http\Controllers\Api\ChildChecklistController::class, 'show']);
        Route::post('children/{childId}/checklist', [\App\Http\Controllers\Api\ChildChecklistController::class, 'store']);
        Route::put('children/{childId}/checklist', [\App\Http\Controllers\Api\ChildChecklistController::class, 'store']); // POST and PUT both use store method
        
        // User Checklists
        Route::get('user/checklist', [\App\Http\Controllers\Api\UserChecklistController::class, 'show']);
        Route::post('user/checklist', [\App\Http\Controllers\Api\UserChecklistController::class, 'store']);
        Route::put('user/checklist', [\App\Http\Controllers\Api\UserChecklistController::class, 'store']); // POST and PUT both use store method
        
        // Centralised dashboard notifications (bell) – parents, trainers, admin
        Route::get('notifications', [\App\Http\Controllers\Api\NotificationsController::class, 'index']);
        Route::patch('notifications/{id}/read', [\App\Http\Controllers\Api\NotificationsController::class, 'markRead']);
        Route::post('notifications/mark-all-read', [\App\Http\Controllers\Api\NotificationsController::class, 'markAllRead']);

        // Centralised live-refresh (context versions for parents, trainers, admin – no browser refresh)
        Route::get('live-refresh', [\App\Http\Controllers\Api\LiveRefreshController::class, 'index']);

        // Broadcasting auth for Echo private channels (Reverb/Pusher). Uses same channel rules as routes/channels.php.
        Route::post('broadcasting/auth', [\Illuminate\Broadcasting\BroadcastController::class, 'authenticate']);

        // Dashboard Stats (Parent)
        Route::get('/dashboard/stats', \App\Http\Controllers\Api\DashboardStatsController::class);
        // Parent dashboard: session notes (trainer notes for completed sessions)
        Route::get('/dashboard/session-notes', [\App\Http\Controllers\Api\ParentSessionNotesController::class, 'index']);
        // Parent dashboard: activity logs (for progress timeline)
        Route::get('/dashboard/activity-logs', [\App\Http\Controllers\Api\ParentActivityLogController::class, 'index']);
        // Parent dashboard: session detail for one schedule (activity logs, current activity, time entries – read-only)
        Route::get('/dashboard/schedules/{scheduleId}', [\App\Http\Controllers\Api\ParentScheduleDetailController::class, 'show']);
        // Parent dashboard: submit safeguarding concern
        Route::post('/dashboard/safeguarding-concerns', [\App\Http\Controllers\Api\ParentSafeguardingConcernController::class, 'store']);

        // Admin-only endpoints (protected by admin middleware)
        Route::middleware('admin')->group(function () {
            // Admin dashboard stats
            Route::get('admin/dashboard/stats', \App\Http\Controllers\Api\AdminDashboardStatsController::class);

            // Admin users (full CRUD + approve/reject)
            Route::apiResource('admin/users', \App\Http\Controllers\Api\AdminUserController::class);
            Route::post('admin/users/{id}/approve', [\App\Http\Controllers\Api\AdminUserController::class, 'approve']);
            Route::post('admin/users/{id}/reject', [\App\Http\Controllers\Api\AdminUserController::class, 'reject']);

            // Admin children (full CRUD + approve/reject + link parent + notify parent)
            Route::apiResource('admin/children', \App\Http\Controllers\Api\AdminChildController::class)->names('admin.children');
            Route::post('admin/children/{id}/approve', [\App\Http\Controllers\Api\AdminChildController::class, 'approve']);
            Route::post('admin/children/{id}/complete-checklist', [\App\Http\Controllers\Api\AdminChildController::class, 'completeChecklist']);
            Route::post('admin/children/{id}/reject', [\App\Http\Controllers\Api\AdminChildController::class, 'reject']);
            Route::post('admin/children/{id}/link-parent', [\App\Http\Controllers\Api\AdminChildController::class, 'linkParent']);
            Route::post('admin/children/{id}/notify-parent', [\App\Http\Controllers\Api\AdminChildController::class, 'notifyParentToCompleteChecklist']);

            // Admin bookings (full CRUD + status updates + trainer assignment + bulk operations)
            Route::get('admin/bookings', [\App\Http\Controllers\Api\AdminBookingsController::class, 'index']);
            Route::get('admin/bookings/export', [\App\Http\Controllers\Api\AdminBookingsController::class, 'export']);
            Route::get('admin/bookings/{id}', [\App\Http\Controllers\Api\AdminBookingsController::class, 'show']);
            Route::put('admin/bookings/{id}/status', [\App\Http\Controllers\Api\AdminBookingsController::class, 'updateStatus']);
            Route::put('admin/bookings/{id}/notes', [\App\Http\Controllers\Api\AdminBookingsController::class, 'updateNotes']);
            Route::get('admin/bookings/sessions/{sessionId}/available-trainers', [\App\Http\Controllers\Api\AdminBookingsController::class, 'availableTrainersForSession']);
            Route::get('admin/bookings/sessions/{sessionId}/available-trainers-debug', [\App\Http\Controllers\Api\AdminBookingsController::class, 'availableTrainersForSessionDebug']);
            Route::put('admin/bookings/sessions/{sessionId}/trainer', [\App\Http\Controllers\Api\AdminBookingsController::class, 'assignTrainer']);
            Route::get('admin/bookings/sessions/{sessionId}/activity-logs', [\App\Http\Controllers\Api\AdminBookingsController::class, 'sessionActivityLogs']);
            Route::post('admin/bookings/bulk-cancel', [\App\Http\Controllers\Api\AdminBookingsController::class, 'bulkCancel']);
            Route::post('admin/bookings/bulk-confirm', [\App\Http\Controllers\Api\AdminBookingsController::class, 'bulkConfirm']);

            // Admin trainers (full CRUD + activate/deactivate + export + media uploads)
            Route::get('admin/trainers', [\App\Http\Controllers\Api\AdminTrainerController::class, 'index']);
            Route::get('admin/trainers/availability', [\App\Http\Controllers\Api\AdminTrainerController::class, 'availability']);
            Route::get('admin/trainers/absence-dates', [\App\Http\Controllers\Api\AdminTrainerController::class, 'absenceDatesBulk']);
            Route::get('admin/trainers/export', [\App\Http\Controllers\Api\AdminTrainerController::class, 'export']);
            Route::get('admin/trainers/{id}', [\App\Http\Controllers\Api\AdminTrainerController::class, 'show']);
            Route::post('admin/trainers', [\App\Http\Controllers\Api\AdminTrainerController::class, 'store']);
            Route::put('admin/trainers/{id}', [\App\Http\Controllers\Api\AdminTrainerController::class, 'update']);
            Route::delete('admin/trainers/{id}', [\App\Http\Controllers\Api\AdminTrainerController::class, 'destroy']);
            Route::put('admin/trainers/{id}/activate', [\App\Http\Controllers\Api\AdminTrainerController::class, 'activate']);
            Route::post('admin/trainers/{id}/image', [\App\Http\Controllers\Api\AdminTrainerController::class, 'uploadImage']);
            Route::post('admin/trainers/{id}/qualifications', [\App\Http\Controllers\Api\AdminTrainerController::class, 'uploadQualification']);
            Route::delete('admin/trainers/{id}/qualifications/{certificationId}', [\App\Http\Controllers\Api\AdminTrainerController::class, 'deleteQualification']);
            Route::get('admin/trainers/{id}/schedules', [\App\Http\Controllers\Api\AdminTrainerScheduleController::class, 'index']);
            Route::get('admin/trainers/{id}/schedules/{scheduleId}', [\App\Http\Controllers\Api\AdminTrainerScheduleController::class, 'show']);
            /** Sync from trainer dashboard: get availability dates this trainer set (read-only). */
            Route::get('admin/trainers/{id}/availability-dates', [\App\Http\Controllers\Api\AdminTrainerController::class, 'availabilityDates']);
            /** Absence dates (approved + pending) for admin calendar sync with trainer calendar. */
            Route::get('admin/trainers/{id}/absence-dates', [\App\Http\Controllers\Api\AdminTrainerController::class, 'absenceDates']);
            // Trainer pay rate (for session pay): list and add
            Route::get('admin/trainers/{id}/pay-rates', [\App\Http\Controllers\Api\AdminTrainerPayRateController::class, 'index']);
            Route::post('admin/trainers/{id}/pay-rates', [\App\Http\Controllers\Api\AdminTrainerPayRateController::class, 'store']);

            // Admin services (full CRUD)
            Route::apiResource('admin/services', \App\Http\Controllers\Api\AdminServicesController::class);

            // Admin packages (full CRUD)
            Route::apiResource('admin/packages', \App\Http\Controllers\Api\AdminPackagesController::class);
            
            // Admin activities (full CRUD)
            Route::apiResource('admin/activities', \App\Http\Controllers\Api\AdminActivitiesController::class);

            // Admin trainer applications (list, show, approve, reject)
            Route::get('admin/trainer-applications', [\App\Http\Controllers\Api\AdminTrainerApplicationsController::class, 'index']);
            Route::get('admin/trainer-applications/{id}', [\App\Http\Controllers\Api\AdminTrainerApplicationsController::class, 'show']);
            Route::post('admin/trainer-applications/{id}/approve', [\App\Http\Controllers\Api\AdminTrainerApplicationsController::class, 'approve']);
            Route::post('admin/trainer-applications/{id}/reject', [\App\Http\Controllers\Api\AdminTrainerApplicationsController::class, 'reject']);
            Route::post('admin/trainer-applications/{id}/request-information', [\App\Http\Controllers\Api\AdminTrainerApplicationsController::class, 'requestInformation']);
            Route::patch('admin/trainer-applications/{id}', [\App\Http\Controllers\Api\AdminTrainerApplicationsController::class, 'update']);

            // Trainer absence requests (pending approval; approve/reject)
            Route::get('admin/trainer-absence-requests', [\App\Http\Controllers\Api\AdminTrainerAbsenceRequestController::class, 'index']);
            Route::post('admin/trainer-absence-requests/{id}/approve', [\App\Http\Controllers\Api\AdminTrainerAbsenceRequestController::class, 'approve']);
            Route::post('admin/trainer-absence-requests/{id}/reject', [\App\Http\Controllers\Api\AdminTrainerAbsenceRequestController::class, 'reject']);
            
            // Approval endpoints (admin only)
            Route::post('approvals/users/{userId}/approve', [\App\Http\Controllers\Api\ApprovalController::class, 'approveUser']);
            Route::post('approvals/users/{userId}/reject', [\App\Http\Controllers\Api\ApprovalController::class, 'rejectUser']);
            Route::post('approvals/children/{childId}/approve', [\App\Http\Controllers\Api\ApprovalController::class, 'approveChild']);
            Route::post('approvals/children/{childId}/reject', [\App\Http\Controllers\Api\ApprovalController::class, 'rejectChild']);

            // In-house spend management (admin): list, analytics, export, approve/reject, receipt download
            Route::get('admin/expenses/analytics', [\App\Http\Controllers\Api\AdminExpenseController::class, 'analytics']);
            Route::get('admin/expenses/export', [\App\Http\Controllers\Api\AdminExpenseController::class, 'export']);
            Route::get('admin/expenses', [\App\Http\Controllers\Api\AdminExpenseController::class, 'index']);
            Route::get('admin/expenses/{id}', [\App\Http\Controllers\Api\AdminExpenseController::class, 'show']);
            Route::get('admin/expenses/{id}/receipt', [\App\Http\Controllers\Api\AdminExpenseController::class, 'downloadReceipt']);
            Route::post('admin/expenses/{id}/approve', [\App\Http\Controllers\Api\AdminExpenseController::class, 'approve']);
            Route::post('admin/expenses/{id}/reject', [\App\Http\Controllers\Api\AdminExpenseController::class, 'reject']);

            // Trainer session pay (admin): list payments, mark as paid
            Route::get('admin/trainer-session-payments', [\App\Http\Controllers\Api\AdminTrainerSessionPayController::class, 'index']);
            Route::get('admin/trainer-session-payments/{id}', [\App\Http\Controllers\Api\AdminTrainerSessionPayController::class, 'show']);
            Route::post('admin/trainer-session-payments/{id}/mark-paid', [\App\Http\Controllers\Api\AdminTrainerSessionPayController::class, 'markPaid']);
        });

        // Content admin endpoints (admins, super_admins and editors)
        Route::middleware('content-admin')->group(function () {
            // Admin public pages (Next.js dashboard - full CRUD)
            Route::get('admin/public-pages', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'index']);
            Route::get('admin/public-pages/export', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'export']);
            Route::get('admin/public-pages/{id}', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'show']);
            Route::post('admin/public-pages', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'store']);
            Route::put('admin/public-pages/{id}', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'update']);
            Route::delete('admin/public-pages/{id}', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'destroy']);
            Route::put('admin/public-pages/{id}/publish', [\App\Http\Controllers\Api\AdminPublicPagesController::class, 'togglePublish']);
        });
        
        // Trainer endpoints (trainer only)
        Route::middleware('trainer')->prefix('trainer')->group(function () {
            // Bookings
            Route::get('bookings', [\App\Http\Controllers\Api\TrainerBookingController::class, 'index']);
            Route::get('bookings/stats', [\App\Http\Controllers\Api\TrainerBookingController::class, 'stats']);
            Route::get('bookings/{id}', [\App\Http\Controllers\Api\TrainerBookingController::class, 'show']);
            Route::post('bookings/{bookingId}/schedules', [\App\Http\Controllers\Api\TrainerBookingController::class, 'bookSession']); // Trainer can book sessions
            Route::put('bookings/{bookingId}/schedules/{scheduleId}/status', [\App\Http\Controllers\Api\TrainerBookingController::class, 'updateScheduleStatus']);
            
            // Schedule Management (Phase 2)
            Route::get('schedules', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'index']);
            Route::get('schedules/{scheduleId}/activity-logs', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'indexBySchedule']);
            Route::get('schedules/{scheduleId}', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'show']);
            Route::put('schedules/{scheduleId}/assignment/confirm', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'confirmAssignment']);
            Route::put('schedules/{scheduleId}/assignment/decline', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'declineAssignment']);
            Route::put('schedules/{scheduleId}/attendance', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'markAttendance']);
            Route::put('schedules/{scheduleId}/current-activity', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'updateCurrentActivity']);
            Route::get('schedules/{scheduleId}/notes', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'getNotes']);
            Route::post('schedules/{scheduleId}/notes', [\App\Http\Controllers\Api\TrainerScheduleController::class, 'createNote']);
            
            // Activity Assignment (New Feature)
            Route::get('schedules/{scheduleId}/activities', [\App\Http\Controllers\Api\TrainerActivityController::class, 'getSessionActivities']);
            Route::post('schedules/{scheduleId}/activities', [\App\Http\Controllers\Api\TrainerActivityController::class, 'assignActivity']);
            Route::post('schedules/{scheduleId}/activities/confirm', [\App\Http\Controllers\Api\TrainerActivityController::class, 'confirmActivities']);
            Route::put('schedules/{scheduleId}/activities/override', [\App\Http\Controllers\Api\TrainerActivityController::class, 'overrideActivityCount']);
            Route::delete('schedules/{scheduleId}/activities/override', [\App\Http\Controllers\Api\TrainerActivityController::class, 'removeOverride']);
            Route::delete('schedules/{scheduleId}/activities/{activityId}', [\App\Http\Controllers\Api\TrainerActivityController::class, 'removeActivity']);
            
            // Activity Logging (Phase 3)
            Route::get('activity-logs', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'index']);
            Route::get('activity-logs/children/{childId}', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'getChildLogs']);
            Route::get('activity-logs/{id}', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'show']);
            Route::post('activity-logs', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'store']);
            Route::put('activity-logs/{id}', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'update']);
            Route::post('activity-logs/{id}/photos', [\App\Http\Controllers\Api\TrainerActivityLogController::class, 'uploadPhoto']);
            
            // Profile Management (Phase 5)
            Route::get('profile', [\App\Http\Controllers\Api\TrainerProfileController::class, 'show']);
            Route::put('profile', [\App\Http\Controllers\Api\TrainerProfileController::class, 'update']);
            Route::post('profile/image', [\App\Http\Controllers\Api\TrainerProfileController::class, 'uploadImage']);
            Route::post('profile/qualifications', [\App\Http\Controllers\Api\TrainerProfileController::class, 'uploadQualification']);
            Route::delete('profile/qualifications/{certificationId}', [\App\Http\Controllers\Api\TrainerProfileController::class, 'deleteQualification']);
            Route::put('profile/availability', [\App\Http\Controllers\Api\TrainerProfileController::class, 'updateAvailability']);
            // Availability by calendar dates (single/multi select on dashboard calendar)
            Route::get('availability-dates', [\App\Http\Controllers\Api\TrainerAvailabilityDatesController::class, 'index']);
            Route::put('availability-dates', [\App\Http\Controllers\Api\TrainerAvailabilityDatesController::class, 'update']);
            // Absence requests (pending admin approval; approved = red scribble on calendar)
            Route::get('absence-requests', [\App\Http\Controllers\Api\TrainerAbsenceRequestController::class, 'index']);
            Route::post('absence-requests', [\App\Http\Controllers\Api\TrainerAbsenceRequestController::class, 'store']);
            // Profile emergency contacts
            Route::get('profile/emergency-contacts', [\App\Http\Controllers\Api\TrainerEmergencyContactController::class, 'index']);
            Route::post('profile/emergency-contacts', [\App\Http\Controllers\Api\TrainerEmergencyContactController::class, 'store']);
            Route::put('profile/emergency-contacts/{id}', [\App\Http\Controllers\Api\TrainerEmergencyContactController::class, 'update']);
            Route::delete('profile/emergency-contacts/{id}', [\App\Http\Controllers\Api\TrainerEmergencyContactController::class, 'destroy']);

            // Time tracking (clock in/out + history)
            Route::get('time-entries', [\App\Http\Controllers\Api\TrainerTimeEntryController::class, 'index']);
            Route::post('schedules/{scheduleId}/clock-in', [\App\Http\Controllers\Api\TrainerTimeEntryController::class, 'clockIn']);
            Route::post('schedules/{scheduleId}/clock-out', [\App\Http\Controllers\Api\TrainerTimeEntryController::class, 'clockOut']);

            // Safeguarding: concerns related to children the trainer has sessions with
            Route::get('safeguarding-concerns', [\App\Http\Controllers\Api\TrainerSafeguardingConcernController::class, 'index']);
            Route::patch('safeguarding-concerns/{id}', [\App\Http\Controllers\Api\TrainerSafeguardingConcernController::class, 'update']);

            // Session pay: trainer sees own payments and summary
            Route::get('session-payments', [\App\Http\Controllers\Api\TrainerSessionPayController::class, 'index']);
            Route::get('session-payments/{id}', [\App\Http\Controllers\Api\TrainerSessionPayController::class, 'show']);
        });
    });
});

// Public API routes with HTTP caching (ETag + Cache-Control)
// Cache duration: 5 minutes (300 seconds) for list endpoints, 10 minutes (600 seconds) for detail endpoints
Route::prefix('v1')->middleware(['api.cache:300'])->group(function () {
    // Pages (Static Pages) - Currently implemented
    Route::get('pages', [\App\Http\Controllers\Api\PageController::class, 'index']);
    Route::get('pages/{slug}', [\App\Http\Controllers\Api\PageController::class, 'show'])->middleware('api.cache:600');
    
    // Packages - Currently implemented
    Route::get('packages', [\App\Http\Controllers\Api\PackageController::class, 'index']);
    Route::get('packages/{slug}', [\App\Http\Controllers\Api\PackageController::class, 'show'])->middleware('api.cache:600');
    
    // Blog
    Route::get('blog/posts', [\App\Http\Controllers\Api\BlogPostController::class, 'index']);
    Route::get('blog/posts/{slug}', [\App\Http\Controllers\Api\BlogPostController::class, 'show'])->middleware('api.cache:600');
    
    // Trainers - Currently implemented
    Route::get('trainers', [\App\Http\Controllers\Api\TrainerController::class, 'index']);
    Route::get('trainers/{slug}', [\App\Http\Controllers\Api\TrainerController::class, 'show'])->middleware('api.cache:600');
    
    // Activities - Currently implemented
    Route::get('activities', [\App\Http\Controllers\Api\ActivityController::class, 'index']);
    Route::get('activities/{slug}', [\App\Http\Controllers\Api\ActivityController::class, 'show'])->middleware('api.cache:600');
    
    // FAQ
    // Route::apiResource('faq', \App\Http\Controllers\Api\FaqController::class)->only(['index', 'show']);
    
    // Policies
    // Route::apiResource('policies', \App\Http\Controllers\Api\PolicyController::class)->only(['index', 'show']);
    
    // Services - Currently implemented
    Route::get('services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);
    Route::get('services/{slug}', [\App\Http\Controllers\Api\ServiceController::class, 'show'])->middleware('api.cache:600');
    
    // FAQs - Currently implemented
    Route::get('faqs', [\App\Http\Controllers\Api\FAQController::class, 'index']);
    Route::get('faqs/{slug}', [\App\Http\Controllers\Api\FAQController::class, 'show'])->middleware('api.cache:600');
    
    // Site Settings - Currently implemented
    Route::get('site-settings', [\App\Http\Controllers\Api\SiteSettingsController::class, 'index'])->middleware('api.cache:600');

    // Testimonials & Reviews
    Route::get('testimonials', [\App\Http\Controllers\Api\TestimonialController::class, 'index']);
    Route::get('testimonials/{identifier}', [\App\Http\Controllers\Api\TestimonialController::class, 'show'])->middleware('api.cache:600');
    Route::get('reviews/aggregate', [\App\Http\Controllers\Api\ReviewController::class, 'aggregate']);
});

// Write endpoints (no caching)
Route::prefix('v1')->group(function () {
    Route::post('contact/submissions', [ContactSubmissionController::class, 'store'])
        ->middleware('throttle:contact-submissions');
    Route::post('newsletter/subscribe', [NewsletterSubscriptionController::class, 'subscribe']);
    Route::post('newsletter/unsubscribe', [NewsletterSubscriptionController::class, 'unsubscribe']);
    Route::post('trainer-applications', [TrainerApplicationController::class, 'store']);
    Route::post('trainer-applications/respond', [TrainerApplicationController::class, 'respond'])
        ->middleware('throttle:60,1');
    
    // Bookings & Booking Schedules - Write endpoints (no caching)
    // Protected by RequireApproval middleware - ensures user and children are approved
    Route::middleware(['auth:sanctum', 'require.approval'])->group(function () {
        // Bookings
        Route::get('bookings', [\App\Http\Controllers\Api\BookingController::class, 'index']);
        Route::get('bookings/reference/{reference}', [\App\Http\Controllers\Api\BookingController::class, 'showByReference']);
        Route::get('bookings/{id}', [\App\Http\Controllers\Api\BookingController::class, 'show']);
        Route::post('bookings', [\App\Http\Controllers\Api\BookingController::class, 'store']);
        Route::post('bookings/create-after-payment', [\App\Http\Controllers\Api\BookingController::class, 'createAfterPayment']); // Pay First → Book Later flow
        Route::put('bookings/{id}', [\App\Http\Controllers\Api\BookingController::class, 'update']);
        Route::post('bookings/{id}/cancel', [\App\Http\Controllers\Api\BookingController::class, 'cancel']);
        Route::post('bookings/{id}/top-up', [\App\Http\Controllers\Api\BookingController::class, 'topUp']);
        Route::get('children/{childId}/booked-dates', [\App\Http\Controllers\Api\BookingController::class, 'getBookedDatesForChild']);
        Route::get('children/{childId}/active-bookings', [\App\Http\Controllers\Api\BookingController::class, 'getActiveBookingsForChild']);

        // Booking Schedules (parent session booking)
        Route::post('bookings/{bookingId}/schedules', [\App\Http\Controllers\Api\BookingScheduleController::class, 'store']);
        Route::put('bookings/schedules/{id}', [\App\Http\Controllers\Api\BookingScheduleController::class, 'update']);
        Route::delete('bookings/schedules/{id}', [\App\Http\Controllers\Api\BookingScheduleController::class, 'destroy']);
        Route::post('bookings/schedules/{id}/cancel', [\App\Http\Controllers\Api\BookingScheduleController::class, 'cancel']);
    });

    // In-house spend management (expenses) – any authenticated user
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('expense-categories', [\App\Http\Controllers\Api\ExpenseController::class, 'categories']);
        Route::get('expenses', [\App\Http\Controllers\Api\ExpenseController::class, 'index']);
        Route::get('expenses/{id}', [\App\Http\Controllers\Api\ExpenseController::class, 'show']);
        Route::post('expenses', [\App\Http\Controllers\Api\ExpenseController::class, 'store']);
        Route::post('expenses/{id}/receipt', [\App\Http\Controllers\Api\ExpenseController::class, 'uploadReceipt']);
        Route::get('expenses/{id}/receipt', [\App\Http\Controllers\Api\ExpenseController::class, 'downloadReceipt']);
    });
    
    // Payments - Write endpoints (no caching)
    Route::post('bookings/{bookingId}/payments/create-intent', [\App\Http\Controllers\Api\PaymentController::class, 'createIntent']);
    Route::post('bookings/{bookingId}/payments/refresh', [\App\Http\Controllers\Api\PaymentController::class, 'refreshBookingPaymentStatus']);
    Route::post('payments/get-intent-from-session', [\App\Http\Controllers\Api\PaymentController::class, 'getIntentFromSession']);
    Route::post('payments/confirm', [\App\Http\Controllers\Api\PaymentController::class, 'confirm']);
    
    // Stripe Webhook (no CSRF protection)
    Route::post('webhooks/stripe', [\App\Http\Controllers\Api\StripeWebhookController::class, 'handle'])
        ->middleware('throttle:60,1'); // Rate limit: 60 requests per minute

});


