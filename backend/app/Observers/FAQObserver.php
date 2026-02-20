<?php

namespace App\Observers;

use App\Models\FAQ;
use App\Support\Revalidation\RevalidateTag;

class FAQObserver
{
    public function saved(FAQ $faq): void
    {
        $this->revalidate($faq);
    }

    public function deleted(FAQ $faq): void
    {
        $this->revalidate($faq);
    }

    protected function revalidate(FAQ $faq): void
    {
        RevalidateTag::dispatch('faqs');
        RevalidateTag::dispatch("faq:{$faq->slug}");
    }
}
