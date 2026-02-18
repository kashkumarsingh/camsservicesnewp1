@php
    /** @var string $childName */
    /** @var string $parentName */
    /** @var string $status */
    /** @var \App\Models\ChildChecklist $checklist */
    /** @var string $logoUrl */
@endphp

@component('mail::message')
<div style="text-align: center; margin-bottom: 24px;">
    <img src="{{ $logoUrl }}" alt="CAMS" style="max-height: 48px;">
</div>

# Child Checklist Reminder

Hi {{ $parentName }},

This is a quick reminder to complete the **Child Checklist** for **{{ $childName }}**.

- Current checklist status: **{{ $status }}**
- Emergency contact name: **{{ $checklist->emergency_contact_name ?: 'Not provided yet' }}**
- Emergency contact phone: **{{ $checklist->emergency_contact_phone ?: 'Not provided yet' }}**

The checklist helps our team keep your child safe and well cared for during sessions.

@component('mail::button', ['url' => config('app.url') . '/dashboard/parent'])
Go to Parent Dashboard
@endcomponent

If you have already completed the checklist recently, you can ignore this message.

Thanks,  
The {{ config('app.name') }} Team

@endcomponent

