<x-mail::message>
# Thank you for contacting us

Dear {{ $name }},

Thank you for getting in touch with CAMS services. We have received your enquiry and a member of our team will respond within **one working day**.

## What happens next?

- We review your message and route it to the right specialist
- You will receive a personal reply by email or phone — whichever you preferred
- If your enquiry is urgent, call us on the number on our website

<x-mail::button :url="$thankYouUrl" color="primary">
View confirmation page
</x-mail::button>

We appreciate you reaching out.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
