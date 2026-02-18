<?php

namespace App\Providers;

use App\Contracts\Booking\IBookingRepository;
use App\Contracts\Booking\IBookingScheduleRepository;
use App\Contracts\Expense\IExpenseRepository;
use App\Contracts\TrainerSessionPay\ITrainerSessionPaymentRepository;
use App\Models\BlogPost;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\Child;
use App\Models\Page;
use App\Models\SiteSetting;
use App\Models\TrainerAbsenceRequest;
use App\Models\TrainerAvailability;
use App\Observers\BlogPostObserver;
use App\Observers\BookingObserver;
use App\Observers\BookingScheduleObserver;
use App\Observers\ChildObserver;
use App\Observers\PageObserver;
use App\Observers\SiteSettingObserver;
use App\Observers\TrainerAbsenceRequestObserver;
use App\Observers\TrainerAvailabilityObserver;
use App\Contracts\Payment\IPaymentService;
use App\Repositories\Booking\EloquentBookingRepository;
use App\Repositories\Booking\EloquentBookingScheduleRepository;
use App\Repositories\Expense\EloquentExpenseRepository;
use App\Repositories\TrainerSessionPay\EloquentTrainerSessionPaymentRepository;
use App\Services\Payment\StripePaymentService;
use App\Contracts\Notifications\INotificationDispatcher;
use App\Services\Notifications\CentralNotificationDispatcher;
use App\Services\Notifications\Channels\EmailChannel;
use App\Services\Notifications\Channels\InAppChannel;
use App\Services\Notifications\Channels\WhatsAppChannel;
use App\Services\Notifications\DashboardNotificationService;
use App\Services\Notifications\EmailNotificationService;
use App\Services\Notifications\LaravelEmailNotificationService;
use App\Services\Notifications\WhatsappNotificationService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

/**
 * Application Service Provider
 * 
 * Clean Architecture Layer: Infrastructure
 * Purpose: Bootstrap application services and configure URL scheme
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Models\Child' => 'App\Policies\ChildPolicy',
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register booking repositories
        $this->app->bind(IBookingRepository::class, EloquentBookingRepository::class);
        $this->app->bind(IBookingScheduleRepository::class, EloquentBookingScheduleRepository::class);
        $this->app->bind(IExpenseRepository::class, EloquentExpenseRepository::class);
        $this->app->bind(ITrainerSessionPaymentRepository::class, EloquentTrainerSessionPaymentRepository::class);
        
        // Register payment repository
        $this->app->bind(\App\Domain\Payment\Repositories\IPaymentRepository::class, \App\Repositories\Payment\EloquentPaymentRepository::class);
        
        // Register payment service
        $this->app->bind(IPaymentService::class, StripePaymentService::class);
        
        // Register email notification service (legacy; prefer INotificationDispatcher)
        $this->app->bind(EmailNotificationService::class, LaravelEmailNotificationService::class);

        // Centralised in-app (bell) notifications – used by channels and legacy email service
        $this->app->singleton(DashboardNotificationService::class);

        // Centralised notification dispatcher (single entry point: dedupe, rate limit, channels)
        $this->app->singleton(INotificationDispatcher::class, CentralNotificationDispatcher::class);
        $this->app->singleton(InAppChannel::class);
        $this->app->singleton(EmailChannel::class);
        $this->app->singleton(WhatsAppChannel::class);
    }

    /**
     * Bootstrap any application services.
     * 
     * Forces HTTPS URL scheme when APP_URL uses HTTPS (production environments).
     * This ensures all url() and asset() helpers generate HTTPS URLs automatically.
     */
    public function boot(): void
    {
        // Register policies
        $this->registerPolicies();

        // Grant super_admin role all abilities (Spatie) so admin API/dashboard works for resources without policies
        Gate::before(function ($user, $ability) {
            if ($user && method_exists($user, 'hasRole') && $user->hasRole('super_admin')) {
                return true;
            }
            return null;
        });

        // Force HTTPS scheme if APP_URL is HTTPS
        // This is the proper Laravel way to handle HTTPS behind proxies
        $appUrl = config('app.url', '');
        
        if (str_starts_with($appUrl, 'https://')) {
            URL::forceScheme('https');
        }

        SiteSetting::observe(SiteSettingObserver::class);
        Page::observe(PageObserver::class);
        BlogPost::observe(BlogPostObserver::class);
        Booking::observe(BookingObserver::class);
        BookingSchedule::observe(BookingScheduleObserver::class);
        Child::observe(ChildObserver::class);
        TrainerAvailability::observe(TrainerAvailabilityObserver::class);
        TrainerAbsenceRequest::observe(TrainerAbsenceRequestObserver::class);

        // Phase 1: Basic rate limiting (IP-based)
        // Phase 2: Will enhance with message queue and more sophisticated rate limiting
        RateLimiter::for('contact-submissions', function (Request $request) {
            return [
                Limit::perMinute(2)->by($request->ip()), // Stricter: 2 per minute instead of 5
                Limit::perHour(10)->by($request->ip()), // 10 per hour
                Limit::perDay(50)->by($request->ip()), // 50 per day instead of 100
            ];
        });
    }

    /**
     * Register the application's policies.
     *
     * @return void
     */
    public function registerPolicies()
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}

