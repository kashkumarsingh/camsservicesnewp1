<?php

namespace App\Observers;

use App\Models\Service;
use App\Support\Revalidation\RevalidateTag;

class ServiceObserver
{
    public function saved(Service $service): void
    {
        $this->revalidate($service);
    }

    public function deleted(Service $service): void
    {
        $this->revalidate($service);
    }

    protected function revalidate(Service $service): void
    {
        RevalidateTag::dispatch('services');
        RevalidateTag::dispatch("service:{$service->slug}");
    }
}
