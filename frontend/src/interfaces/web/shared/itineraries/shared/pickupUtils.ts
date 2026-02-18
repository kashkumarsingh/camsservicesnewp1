export function parseTimeToMinutesSafe(t?: string): number {
  if (!t) return 0;
  const [hh, mm] = t.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}

export function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * Compute suggested pickup time options based on event/appointment time and travel estimate.
 * Travel: 120 minutes if addresses differ, else 60 minutes.
 * Returns sorted HH:mm strings, ensuring not earlier than 06:00.
 */
export function getSuggestedPickupOptions(params: {
  eventTime?: string; // HH:mm
  fromAddress?: string;
  toAddress?: string;
  minStartHHMM?: string; // default 06:00
}): string[] {
  const { eventTime, fromAddress, toAddress, minStartHHMM = '06:00' } = params;
  if (!eventTime) return [];

  const eventM = parseTimeToMinutesSafe(eventTime);
  if (eventM === 0) return [];

  const hasDiff = !!(fromAddress && toAddress && fromAddress.trim().toLowerCase() !== toAddress.trim().toLowerCase());
  const travelMinutes = hasDiff ? 120 : 60;
  const minPickupM = eventM - travelMinutes;

  const minAllowed = parseTimeToMinutesSafe(minStartHHMM);
  if (minPickupM < minAllowed) return [];

  const options: string[] = [];
  const suggested = minutesToHHMM(minPickupM);
  options.push(suggested);

  const alternatives = [-30, -60, -90, -120];
  for (const offset of alternatives) {
    const candidate = minPickupM + offset;
    if (candidate >= minAllowed) {
      const opt = minutesToHHMM(candidate);
      if (!options.includes(opt)) options.push(opt);
    }
  }

  return options.sort();
}

