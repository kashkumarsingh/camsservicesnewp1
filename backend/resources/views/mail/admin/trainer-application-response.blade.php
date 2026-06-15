<x-mail::message>
# Trainer application response

**Applicant:** {{ $application->full_name }}

**Email:** {{ $application->email }}

**Response:**

{{ $application->trainer_response_message }}

<x-mail::button :url="$viewUrl" color="primary">
Review application
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
