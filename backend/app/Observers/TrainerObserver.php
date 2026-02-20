<?php

namespace App\Observers;

use App\Models\Trainer;
use App\Support\Revalidation\RevalidateTag;

class TrainerObserver
{
    public function saved(Trainer $trainer): void
    {
        $this->revalidate($trainer);
    }

    public function deleted(Trainer $trainer): void
    {
        $this->revalidate($trainer);
    }

    protected function revalidate(Trainer $trainer): void
    {
        RevalidateTag::dispatch('trainers');
        RevalidateTag::dispatch("trainer:{$trainer->slug}");
    }
}
