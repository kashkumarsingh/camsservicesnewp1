export function getTrainerChildDisplayName(rawName?: string | null): string {
  if (!rawName) {
    return 'Child';
  }

  const parts = rawName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'Child';
  }

  const firstName = parts[0];
  const hasSurname = parts.length > 1;

  // Business rule: trainers must never see the full legal name.
  // Show first name + first letter of surname at most (e.g. "Jemma L."),
  // or just the first name when only one token is present.
  if (!hasSurname) {
    return firstName;
  }

  const surnameInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${surnameInitial}.`;
}

