<x-mail::message>
# Newsletter subscription

**Email:** {{ $subscription->email }}

@if($subscription->name)
**Name:** {{ $subscription->name }}
@endif

@if($subscription->source)
**Source:** {{ $subscription->source }}
@endif

**Subscribed at:** {{ $subscription->subscribed_at?->format('j M Y H:i') ?? now()->format('j M Y H:i') }}

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
