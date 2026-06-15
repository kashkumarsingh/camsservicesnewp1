<x-mail::message>
# Trainer availability updated

**Trainer:** {{ $trainerName }}

{{ $trainerName }} updated their calendar availability. You can review their profile and assign sessions as needed.

<x-mail::button :url="$viewUrl" color="primary">
View trainers
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
