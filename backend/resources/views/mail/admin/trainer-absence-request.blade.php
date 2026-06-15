<x-mail::message>
# Trainer absence request

**Trainer:** {{ $trainerName }}

**Dates:** {{ $absence->date_from->format('j M Y') }} – {{ $absence->date_to->format('j M Y') }}

**Status:** {{ ucfirst($absence->status) }}

@if($absence->reason)
**Reason:**

{{ $absence->reason }}
@endif

<x-mail::button :url="$viewUrl" color="primary">
Review absence requests
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
