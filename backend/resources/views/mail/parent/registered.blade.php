@component('mail::message')
# Welcome to CAMS Services!

Dear {{ $userName }},

Thank you for registering with CAMS Services. We've received your account application and are delighted to have you join our community.

## What Happens Next?

Your registration is currently **pending approval** from our team. Here's what you can expect:

@component('mail::panel')
**Registration Status:** Pending Approval

Our admin team will review your account within the next **24-48 hours**. You'll receive an email notification once your account has been approved.
@endcomponent

## Your Registration Details

- **Name:** {{ $userName }}
- **Email:** {{ $userEmail }}
- **Registration Date:** {{ now()->format('l, jS F Y') }}

## While You Wait

Whilst your account is being reviewed, feel free to:

- Browse our [available packages]({{ config('app.frontend_url') }}/packages)
- Read our [latest blog posts]({{ config('app.frontend_url') }}/blog)
- Learn more about [our trainers]({{ config('app.frontend_url') }}/trainers)

## Need Help?

If you have any questions or concerns, please don't hesitate to contact our support team:

@component('mail::button', ['url' => 'mailto:' . $supportEmail, 'color' => 'primary'])
Contact Support
@endcomponent

**Email:** {{ $supportEmail }}

---

We look forward to welcoming you to the CAMS Services family!

Best regards,  
**The CAMS Services Team**

@endcomponent
