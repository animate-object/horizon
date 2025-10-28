export function minutesToMs(n: number): number {
  return n * 60 * 1000;
}

function addMinutes(signedMinutes: number, now_?: number | undefined): number {
  const now = now_ || Date.now();
  return now + minutesToMs(signedMinutes);
}

export function minutesFromNow(
  minutes: number,
  now_?: number | undefined
): number {
  return addMinutes(Math.abs(minutes), now_);
}

export function minutesAgo(minutes: number, now_?: number | undefined): number {
  return addMinutes(-Math.abs(minutes), now_);
}

export function epochToDate(epochMs: number): Date {
  return new Date(epochMs);
}

export function epochToIso(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

export function isoDateToEpoch(dateString: string): number {
  return new Date(dateString).getTime();
}
