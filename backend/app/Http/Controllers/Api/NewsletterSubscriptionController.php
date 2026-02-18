<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\SubscribeNewsletterRequest;
use App\Http\Requests\UnsubscribeNewsletterRequest;
use App\Models\NewsletterSubscription;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;

class NewsletterSubscriptionController extends Controller
{
    use BaseApiController;

    /**
     * Subscribe an email address.
     */
    public function subscribe(SubscribeNewsletterRequest $request): JsonResponse
    {
        $subscription = NewsletterSubscription::firstOrNew([
            'email' => $request->string('email'),
        ]);

        $subscription->fill([
            'name' => $request->input('name'),
            'active' => true,
            'subscribed_at' => CarbonImmutable::now(),
            'unsubscribed_at' => null,
            'ip_address' => $request->ip(),
            'source' => $request->input('source', 'contact-page'),
        ])->save();

        return $this->successResponse(
            $subscription,
            'Subscription confirmed. Welcome aboard!',
            [],
            201
        );
    }

    /**
     * Unsubscribe an email address.
     */
    public function unsubscribe(UnsubscribeNewsletterRequest $request): JsonResponse
    {
        $subscription = NewsletterSubscription::where('email', $request->string('email'))->first();

        if (! $subscription) {
            return $this->notFoundResponse('Subscription');
        }

        $subscription->fill([
            'active' => false,
            'unsubscribed_at' => CarbonImmutable::now(),
            'ip_address' => $request->ip(),
        ])->save();

        return $this->successResponse(
            $subscription,
            'You have been unsubscribed.'
        );
    }
}

