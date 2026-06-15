<x-mail::message>
# Safeguarding concern reported

**Reported by:** {{ $concern->user?->name ?? 'Unknown parent' }} ({{ $concern->user?->email ?? '—' }})

**Concern type:** {{ ucfirst(str_replace('_', ' ', $concern->concern_type)) }}

@if($concern->child)
**Child:** {{ $concern->child->name }}
@endif

@if($concern->date_of_concern)
**Date of concern:** {{ $concern->date_of_concern->format('j M Y') }}
@endif

@if($concern->contact_preference)
**Preferred contact:** {{ $concern->contact_preference }}
@endif

**Description:**

{{ $concern->description }}

Please review this concern promptly in the admin dashboard.

<x-mail::button :url="$viewUrl" color="primary">
Open admin dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
