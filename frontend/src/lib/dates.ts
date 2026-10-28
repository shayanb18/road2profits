// Pay dates and bill due dates are calendar days, stored as UTC midnight ("2026-11-05" or
// "2026-11-05T00:00:00.000Z"). Read them in UTC, or they show a day early west of UTC.

export function formatDay(value: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(value).toLocaleDateString("en-CA", { ...opts, timeZone: "UTC" });
}

// Whole calendar days from the user's today to `value`: 0 = today, 1 = tomorrow, negative = past.
export function daysUntil(value: string, now: Date = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(value).getTime() - today) / 864e5);
}
