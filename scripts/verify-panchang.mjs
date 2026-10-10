import { MakeTime, MoonPhase, SearchMoonPhase, SunPosition } from "astronomy-engine";

const LAHIRI_J2000 = 23.853396667;
const RATE = 50.2388475 / 3600;
const MONTHS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashwin",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
];

function wrap360(d) {
  const x = d % 360;
  return x < 0 ? x + 360 : x;
}

function ayanamsa(date) {
  const jd = MakeTime(date).ut + 2451545.0;
  return LAHIRI_J2000 + RATE * ((jd - 2451545.0) / 365.25);
}

function sunRashi(date) {
  return Math.floor(wrap360(SunPosition(date).elon - ayanamsa(date)) / 30) % 12;
}

function prevNM(date) {
  let f = SearchMoonPhase(0, new Date(date.getTime() - 2 * 3600 * 1000), -45);
  if (f.date > date) f = SearchMoonPhase(0, new Date(f.date.getTime() - 86400000), -45);
  return f.date;
}

function nextNM(date) {
  let f = SearchMoonPhase(0, new Date(date.getTime() + 2 * 3600 * 1000), 45);
  if (f.date <= date) f = SearchMoonPhase(0, new Date(f.date.getTime() + 86400000), 45);
  return f.date;
}

function monthAt(date) {
  const s = prevNM(date);
  const e = nextNM(date);
  const a = sunRashi(s);
  const b = sunRashi(e);
  if (a === b) return { name: MONTHS[(a + 1) % 12], adhik: true, start: s, end: e };
  return { name: MONTHS[b % 12], adhik: false, start: s, end: e };
}

function tithi(date) {
  const el = wrap360(MoonPhase(date));
  const idx = Math.min(29, Math.floor(el / 12));
  return { idx, paksha: idx < 15 ? "Shukla" : "Krishna", n: (idx % 15) + 1, el };
}

let cursor = new Date("2026-01-15T12:00:00Z");
const end = new Date("2027-01-01T00:00:00Z");
const adhik = [];
while (cursor < end) {
  const m = monthAt(cursor);
  if (m.adhik) adhik.push(`${m.name} ${m.start.toISOString().slice(0, 10)} → ${m.end.toISOString().slice(0, 10)}`);
  cursor = new Date(m.end.getTime() + 12 * 3600 * 1000);
}

console.log("Adhik months in 2026:");
console.log(adhik.length ? adhik.join("\n") : "(none found)");

const sample = new Date("2025-12-10T06:45:00Z");
console.log("Sample tithi", tithi(sample), monthAt(sample));
