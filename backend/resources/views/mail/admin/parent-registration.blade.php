@component('mail::message')
# New Parent Registration

Hello Admin,

A new parent has registered and requires your approval to access the platform.

## Parent Details

@component('mail::table')
| Field | Value |
|:------|:------|
| **Name** | {{ $user->name }} |
| **Email** | {{ $user->email }} |
| **Phone** | {{ $user->phone }} |
| **Address** | {{ $user->address }} |
| **Postcode** | {{ $user->postcode }} |
| **Registration Date** | {{ $user->created_at->format('l, jS F Y \a\t H:i') }} |
| **Registration Source** | {{ ucfirst($user->registration_source ?? 'Direct') }} |
@endcomponent

## Action Required

Please review this parent's registration and approve or reject their account.

@component('mail::button', ['url' => $adminUrl, 'color' => 'primary'])
Review Parent Account
@endcomponent

---

**Important:** Parents cannot book sessions until their account has been approved. Please review this registration within 24-48 hours to ensure a positive experience.

Best regards,  
**CAMS Services System**

@endcomponent
