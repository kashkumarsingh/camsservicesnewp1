<x-mail::message>
# Incident report submitted

**Reference:** {{ $incident->reference }}

**Reported by:** {{ $incident->reportedBy?->name ?? 'Unknown' }} ({{ $incident->reportedBy?->email ?? '—' }})

**Type:** {{ ucfirst(str_replace('_', ' ', $incident->incident_type)) }}

**Severity:** {{ ucfirst($incident->severity) }}

@if($incident->child)
**Child:** {{ $incident->child->name }}
@endif

@if($incident->location)
**Location:** {{ $incident->location }}
@endif

@if($incident->occurred_at)
**Occurred at:** {{ $incident->occurred_at->format('j M Y H:i') }}
@endif

**Description:**

{{ $incident->description }}

@if($incident->immediate_actions)
**Immediate actions taken:**

{{ $incident->immediate_actions }}
@endif

Please review this incident promptly in the admin dashboard.

<x-mail::button :url="$viewUrl" color="primary">
Review incident reports
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
