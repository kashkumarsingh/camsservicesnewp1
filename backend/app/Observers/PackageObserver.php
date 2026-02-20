<?php

namespace App\Observers;

use App\Models\Package;
use App\Support\Revalidation\RevalidateTag;

class PackageObserver
{
    public function saved(Package $package): void
    {
        $this->revalidate($package);
    }

    public function deleted(Package $package): void
    {
        $this->revalidate($package);
    }

    protected function revalidate(Package $package): void
    {
        RevalidateTag::dispatch('packages');
        RevalidateTag::dispatch("package:{$package->slug}");
    }
}
