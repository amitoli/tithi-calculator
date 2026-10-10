import {
  Body,
  MoonPhase,
  Observer,
  SearchMoonPhase,
  SearchRiseSet,
} from "astronomy-engine";

const TZ = "Asia/Kathmandu";
const LAT = 27.7172;
const LON = 85.324;

function zoneParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const map = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function offsetMs(date) {
  const p = zoneParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
}

function zoned(y, m, d, h, min) {
  const utcGuess = Date.UTC(y, m - 1, d, h, min, 0);
  let instant = new Date(utcGuess - offsetMs(new Date(utcGuess)));
  instant = new Date(utcGuess - offsetMs(instant));
  return instant;
}

function wrap360(deg) {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

const NAMES = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami",
  "Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi",
];

function tithiAt(date) {
  const elongation = wrap360(MoonPhase(date));
  const index = Math.min(29, Math.floor(elongation / 12));
  const paksha = index < 15 ? "Shukla" : "Krishna";
  const number = (index % 15) + 1;
  const name = number === 15 ? (paksha === "Shukla" ? "Purnima" : "Amavasya") : NAMES[number - 1];
  return { elongation, index, number, paksha, name, frac: elongation / 12 - index };
}

function fmt(date) {
  const p = zoneParts(date);
  return `${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")} ${String(p.hour).padStart(2,"0")}:${String(p.minute).padStart(2,"0")} KTM  (${date.toISOString()})`;
}

function sunTimes(around) {
  const observer = new Observer(LAT, LON, 0);
  const start = new Date(around.getTime() - 3600 * 1000);
  const rise = SearchRiseSet(Body.Sun, observer, +1, start, 2);
  const sunrise = rise.date;
  const set = SearchRiseSet(Body.Sun, observer, -1, sunrise, 1.5);
  return { sunrise, sunset: set.date };
}

function aparahna(sunrise, sunset) {
  const span = sunset.getTime() - sunrise.getTime();
  const part = span / 5;
  const start = new Date(sunrise.getTime() + 3 * part);
  const end = new Date(sunrise.getTime() + 4 * part);
  const mid = new Date((start.getTime() + end.getTime()) / 2);
  return { start, end, mid };
}

function tithiStart(index, from, dir = 1) {
  const target = index * 12;
  return SearchMoonPhase(target, from, dir * 5)?.date;
}

function dumpMoment(label, date) {
  const t = tithiAt(date);
  console.log(
    `${label.padEnd(28)} ${fmt(date)}  elon=${t.elongation.toFixed(3)}  ${t.paksha} ${t.name} (#${t.number}) frac=${t.frac.toFixed(3)}`,
  );
}

function dumpDay(y, m, d) {
  const midnight = zoned(y, m, d, 0, 0);
  const { sunrise, sunset } = sunTimes(midnight);
  const ap = aparahna(sunrise, sunset);
  console.log(`\n=== ${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")} ===`);
  dumpMoment("midnight", midnight);
  dumpMoment("sunrise", sunrise);
  dumpMoment("aparahna start", ap.start);
  dumpMoment("aparahna mid", ap.mid);
  dumpMoment("aparahna end", ap.end);
  dumpMoment("sunset", sunset);
}

console.log("--- Death ---");
const death = zoned(2025, 9, 4, 4, 0);
dumpMoment("death 4 AM", death);
const { sunrise: srDeath, sunset: ssDeath } = sunTimes(zoned(2025, 9, 4, 0, 0));
dumpMoment("sunrise Sept 4", srDeath);
dumpMoment("sunset Sept 4", ssDeath);
const { sunrise: srPrev } = sunTimes(zoned(2025, 9, 3, 0, 0));
dumpMoment("sunrise Sept 3", srPrev);

const dwadashiStart = tithiStart(11, new Date(death.getTime() - 2 * 86400000), 1);
const dwadashiEnd = tithiStart(12, new Date(death.getTime() - 1 * 86400000), 1);
const ekadashiStart = tithiStart(10, new Date(death.getTime() - 2 * 86400000), 1);
console.log("\nTithi boundaries near death:");
if (ekadashiStart) dumpMoment("Shukla Ekadashi start", ekadashiStart);
if (dwadashiStart) dumpMoment("Shukla Dwadashi start", dwadashiStart);
if (dwadashiEnd) dumpMoment("Shukla Trayodashi start", dwadashiEnd);

dumpDay(2026, 9, 21);
dumpDay(2026, 9, 22);
dumpDay(2026, 9, 23);
dumpDay(2026, 9, 24);

console.log("\nTithi boundaries near anniversary:");
const around = zoned(2026, 9, 22, 12, 0);
for (const idx of [10, 11, 12, 13]) {
  const t = tithiStart(idx, new Date(around.getTime() - 3 * 86400000), 1);
  if (t) dumpMoment(`index ${idx} start`, t);
}
