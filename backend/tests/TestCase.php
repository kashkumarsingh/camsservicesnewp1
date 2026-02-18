<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Contracts\Payment\IPaymentService;
use App\Services\Payment\FakePaymentService;

/**
 * Base Test Case
 * 
 * Clean Architecture: Infrastructure Layer (Testing)
 * Purpose: Base test case for all feature tests
 * Location: backend/tests/TestCase.php
 */
abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        // Set testing environment variables before bootstrapping
        // These will override .env values
        $_ENV['APP_ENV'] = 'testing';
        $_ENV['DB_CONNECTION'] = 'sqlite';
        $_ENV['DB_DATABASE'] = ':memory:';
        
        putenv('APP_ENV=testing');
        putenv('DB_CONNECTION=sqlite');
        putenv('DB_DATABASE=:memory:');
        
        $app = require __DIR__ . '/../bootstrap/app.php';

        $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();

        // Force SQLite configuration after bootstrap
        // This ensures it overrides any .env settings
        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
        ]);

        // Use real Stripe test keys if configured, otherwise fall back to fake service
        // This allows feature tests to verify actual Stripe integration when keys are available
        $stripeSecretKey = config('services.stripe.secret_key');
        if (!$stripeSecretKey) {
            // No Stripe keys configured - use fake service for tests
            $app->bind(IPaymentService::class, FakePaymentService::class);
        }
        // If Stripe keys are configured, use real StripePaymentService (bound in AppServiceProvider)

        return $app;
    }
}

