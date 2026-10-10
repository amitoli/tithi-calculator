import { localDateParts } from "../timezone";
import monthDaysByYear from "./bs-month-days.json";

export interface CivilDate {
  year: number;
  month: number;
  day: number;
}

export interface BsDate extends CivilDate {}

export const BS_MONTHS = [
  { index: 1, name: "Baisakh", nepali: "बैशाख" },
  { index: 2, name: "Jestha", nepali: "जेठ" },
  { index: 3, name: "Ashadh", nepali: "असार" },
  { index: 4, name: "Shrawan", nepali: "साउन" },
  { index: 5, name: "Bhadra", nepali: "भदौ" },
  { index: 6, name: "Ashwin", nepali: "असोज" },
  { index: 7, name: "Kartik", nepali: "कात्तिक" },
  { index: 8, name: "Mangsir", nepali: "मंसिर" },
  { index: 9, name: "Poush", nepali: "पुस" },
  { index: 10, name: "Magh", nepali: "माघ" },
  { index: 11, name: "Falgun", nepali: "फागुन" },
  { index: 12, name: "Chaitra", nepali: "चैत" },
] as const;

const DAYS = monthDaysByYear as Record<string, number[]>;

/** Baisakh 1, 2000 B.S. = 14 April 1943 A.D. */
const EPOCH_UTC = Date.UTC(1943, 3, 14);
export const BS_MIN_YEAR = 2000;
export const BS_MAX_YEAR = 2100;

function yearDays(year: number): number[] {
  const days = DAYS[String(year)];
  if (!days) {
    throw new Error(`Nepali calendar data is available for B.S. ${BS_MIN_YEAR}–${BS_MAX_YEAR} only.`);
  }
  return days;
}

export function daysInBsMonth(year: number, month: number): number {
  const days = yearDays(year)[month - 1];
  if (!days) throw new Error("Invalid Nepali month.");
  return days;
}

export function isValidBsDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) return false;
  if (month < 1 || month > 12) return false;
  const dim = DAYS[String(year)]?.[month - 1];
  return Boolean(dim && day >= 1 && day <= dim);
}

export function bsToAd(year: number, month: number, day: number): CivilDate {
  if (!isValidBsDate(year, month, day)) {
    throw new Error("That Nepali date is not valid. Check year, month, and gatey.");
  }
  let elapsed = 0;
  for (let y = BS_MIN_YEAR; y < year; y += 1) {
    elapsed += yearDays(y).reduce((sum, n) => sum + n, 0);
  }
  const months = yearDays(year);
  for (let m = 0; m < month - 1; m += 1) elapsed += months[m];
  elapsed += day - 1;
  const utc = new Date(EPOCH_UTC + elapsed * 86400000);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function adToBs(year: number, month: number, day: number): BsDate {
  const utc = Date.UTC(year, month - 1, day);
  let remaining = Math.round((utc - EPOCH_UTC) / 86400000);
  if (remaining < 0) {
    throw new Error(`Nepali calendar conversion starts at 14 April 1943 (1 Baisakh 2000 B.S.).`);
  }

  let bsYear = BS_MIN_YEAR;
  while (bsYear <= BS_MAX_YEAR) {
    const total = yearDays(bsYear).reduce((sum, n) => sum + n, 0);
    if (remaining < total) break;
    remaining -= total;
    bsYear += 1;
  }
  if (bsYear > BS_MAX_YEAR) {
    throw new Error(`Nepali calendar data ends at B.S. ${BS_MAX_YEAR}.`);
  }

  const months = yearDays(bsYear);
  let bsMonth = 1;
  for (const dim of months) {
    if (remaining < dim) {
      return { year: bsYear, month: bsMonth, day: remaining + 1 };
    }
    remaining -= dim;
    bsMonth += 1;
  }
  throw new Error("Could not convert that Gregorian date to Bikram Sambat.");
}

export function isoFromCivil(date: CivilDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function civilFromIso(isoDate: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function monthMeta(month: number) {
  return BS_MONTHS[month - 1];
}

export function formatBs(date: BsDate, options?: { compact?: boolean }): string {
  const month = monthMeta(date.month);
  if (!month) return "";
  if (options?.compact) {
    return `${date.day} ${month.name} ${date.year}`;
  }
  return `${date.day} ${month.name} ${date.year} B.S. (${month.nepali})`;
}

export function formatAd(date: CivilDate): string {
  const utc = Date.UTC(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(utc);
}

export function tryAdToBs(year: number, month: number, day: number): BsDate | null {
  try {
    return adToBs(year, month, day);
  } catch {
    return null;
  }
}

export function formatBsFromInstant(date: Date, timeZone: string): string {
  const p = localDateParts(date, timeZone);
  const bs = tryAdToBs(p.year, p.month, p.day);
  return bs ? formatBs(bs) : "";
}

export function formatBsCompactFromInstant(date: Date, timeZone: string): string {
  const p = localDateParts(date, timeZone);
  const bs = tryAdToBs(p.year, p.month, p.day);
  return bs ? formatBs(bs, { compact: true }) : "";
}
