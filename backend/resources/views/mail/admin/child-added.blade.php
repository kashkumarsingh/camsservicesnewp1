<x-mail::message>
# New child added

**Child:** {{ $child->name }}

@if($child->date_of_birth)
**Date of birth:** {{ $child->date_of_birth->format('j M Y') }}
@endif

**Parent:** {{ $parent?->name ?? 'Unknown' }} ({{ $parent?->email ?? '—' }})

The safeguarding checklist has not been submitted yet. Review the child profile when ready.

<x-mail::button :url="$viewUrl" color="primary">
View children
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
