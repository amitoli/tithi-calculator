import {
  Body,
  MakeTime,
  MoonPhase,
  Observer,
  SearchMoonPhase,
  SearchRiseSet,
  SunPosition,
} from "astronomy-engine";
import {
  LAHIRI_AYANAMSA_J2000,
  LAHIRI_RATE_ARCSEC_PER_YEAR,
  TITHI_NAMES,
} from "./constants";
import type { TithiInfo } from "./types";

export function julianDay(date: Date): number {
  return MakeTime(date).ut + 2451545.0;
}

export function lahiriAyanamsa(date: Date): number {
  const jd = julianDay(date);
  const years = (jd - 2451545.0) / 365.25;
  return LAHIRI_AYANAMSA_J2000 + (LAHIRI_RATE_ARCSEC_PER_YEAR / 3600) * years;
}

function wrap360(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

export function siderealSunLongitude(date: Date): number {
  const tropical = SunPosition(date).elon;
  return wrap360(tropical - lahiriAyanamsa(date));
}

export function sunRashiIndex(date: Date): number {
  return Math.floor(siderealSunLongitude(date) / 30) % 12;
}

export function moonElongation(date: Date): number {
  return wrap360(MoonPhase(date));
}

export function tithiAt(date: Date): TithiInfo {
  const elongation = moonElongation(date);
  const index = Math.min(29, Math.floor(elongation / 12));
  const paksha = index < 15 ? "Shukla" : "Krishna";
  const number = (index % 15) + 1;
  const name =
    number === 15
      ? paksha === "Shukla"
        ? "Purnima"
        : "Amavasya"
      : TITHI_NAMES[number - 1];

  return { index, number, name, paksha, elongation };
}

function requirePhase(target: number, from: Date, limitDays: number, label: string): Date {
  const found = SearchMoonPhase(target, from, limitDays);
  if (!found) {
    throw new Error(`Could not find ${label} near ${from.toISOString()}`);
  }
  return found.date;
}

export function previousNewMoon(date: Date): Date {
  const found = requirePhase(0, new Date(date.getTime() - 2 * 3600 * 1000), -45, "previous new moon");
  if (found.getTime() > date.getTime()) {
    return requirePhase(0, new Date(found.getTime() - 24 * 3600 * 1000), -45, "previous new moon");
  }
  return found;
}

export function nextNewMoon(date: Date): Date {
  const found = requirePhase(0, new Date(date.getTime() + 2 * 3600 * 1000), 45, "next new moon");
  if (found.getTime() <= date.getTime()) {
    return requirePhase(0, new Date(found.getTime() + 24 * 3600 * 1000), 45, "next new moon");
  }
  return found;
}

export function sunTimes(
  around: Date,
  latitude: number,
  longitude: number,
): { sunrise: Date; sunset: Date } {
  const observer = new Observer(latitude, longitude, 0);
  const searchFrom = new Date(around.getTime() - 60 * 60 * 1000);
  const rise = SearchRiseSet(Body.Sun, observer, +1, searchFrom, 2);
  const sunrise = rise?.date ?? new Date(around.getTime() + 6 * 3600 * 1000);
  const set = SearchRiseSet(Body.Sun, observer, -1, sunrise, 1.5);
  const sunset = set?.date ?? new Date(sunrise.getTime() + 12 * 3600 * 1000);
  return { sunrise, sunset };
}

export function aparahnaWindow(sunrise: Date, sunset: Date): {
  start: Date;
  end: Date;
  mid: Date;
} {
  const span = sunset.getTime() - sunrise.getTime();
  const part = span / 5;
  const start = new Date(sunrise.getTime() + 3 * part);
  const end = new Date(sunrise.getTime() + 4 * part);
  const mid = new Date((start.getTime() + end.getTime()) / 2);
  return { start, end, mid };
}
