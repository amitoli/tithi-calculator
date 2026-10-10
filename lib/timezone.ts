function zoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function offsetMs(date: Date, timeZone: string): number {
  const p = zoneParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
}

export function zonedDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instant = new Date(utcGuess - offsetMs(new Date(utcGuess), timeZone));
  const corrected = offsetMs(instant, timeZone);
  instant = new Date(utcGuess - corrected);
  return instant;
}

export function parseZonedDateTime(
  isoDate: string,
  hhmm: string,
  timeZone: string,
): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);
  return zonedDate(year, month, day, hour, minute, timeZone);
}

export function localDateParts(date: Date, timeZone: string) {
  const p = zoneParts(date, timeZone);
  return { year: p.year, month: p.month, day: p.day, hour: p.hour, minute: p.minute };
}

export function startOfLocalDay(date: Date, timeZone: string): Date {
  const p = localDateParts(date, timeZone);
  return zonedDate(p.year, p.month, p.day, 0, 0, timeZone);
}

export function addLocalDays(date: Date, days: number, timeZone: string): Date {
  const p = localDateParts(date, timeZone);
  const civil = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return zonedDate(
    civil.getUTCFullYear(),
    civil.getUTCMonth() + 1,
    civil.getUTCDate(),
    12,
    0,
    timeZone,
  );
}

export function addGregorianYears(date: Date, years: number, timeZone: string): Date {
  const p = localDateParts(date, timeZone);
  const civil = new Date(Date.UTC(p.year + years, p.month - 1, p.day));
  if (civil.getUTCMonth() !== (p.month - 1)) {
    civil.setUTCDate(0);
  }
  return zonedDate(
    civil.getUTCFullYear(),
    civil.getUTCMonth() + 1,
    civil.getUTCDate(),
    p.hour,
    p.minute,
    timeZone,
  );
}

export function formatCivilDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isoDateInZone(date: Date, timeZone: string): string {
  const p = localDateParts(date, timeZone);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  return `${p.year}-${mm}-${dd}`;
}
