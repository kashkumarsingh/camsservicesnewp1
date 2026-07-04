<x-mail::message>
# Thank you for your referral

Dear {{ $name }},

Thank you for referring **{{ $youngPersonName }}** to CAMS services. We have received your referral and our team will review it promptly.

## What happens next?

- Initial review within **one working day**
- We will contact you to discuss context and next steps
- If suitable, we match the young person with the right mentor and programme

<x-mail::button :url="$thankYouUrl" color="primary">
View confirmation page
</x-mail::button>

Thank you for trusting us with this referral.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
