<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;

/**
 * Creates Application Trait
 * 
 * Clean Architecture: Infrastructure Layer (Testing)
 * Purpose: Provides application creation for tests
 * Location: backend/tests/CreatesApplication.php
 */
trait CreatesApplication
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__ . '/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}

