<x-mail::message>
# New referral submission

**Referrer:** {{ $submission->referrer_name }} ({{ $submission->referrer_role }})

**Referrer email:** {{ $submission->referrer_email }}

@if($submission->referrer_phone)
**Referrer phone:** {{ $submission->referrer_phone }}
@endif

**Young person:** {{ $submission->young_person_name }}@if($submission->young_person_age), age {{ $submission->young_person_age }}@endif

@if($submission->school_setting)
**School / setting:** {{ $submission->school_setting }}
@endif

**Primary concern:** {{ $submission->primary_concern }}

@if($submission->background_context)
**Background:**

{{ $submission->background_context }}
@endif

@if($submission->success_outcome)
**Desired outcome:** {{ $submission->success_outcome }}
@endif

@if($submission->preferred_package)
**Preferred package:** {{ $submission->preferred_package }}
@endif

@if($submission->additional_info)
**Additional info:**

{{ $submission->additional_info }}
@endif

<x-mail::button :url="$viewUrl" color="primary">
View referral
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
