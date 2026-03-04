<x-mail::message>
# New contact request

**Name:** {{ $submission->name }}

**Email:** {{ $submission->email }}

@if($submission->phone)
**Phone:** {{ $submission->phone }}
@endif

**Inquiry type:** {{ ucfirst($submission->inquiry_type ?? 'general') }}

**Urgency:** {{ ucfirst($submission->urgency ?? '—') }}

**Preferred contact:** {{ ucfirst($submission->preferred_contact ?? 'email') }}

@if($submission->message)
**Message:**

{{ $submission->message }}
@endif

<x-mail::button :url="$viewUrl" color="primary">
View submission
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
