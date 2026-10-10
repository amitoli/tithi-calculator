import { CITIES } from "../lib/panchang/cities";
import { calculateBarshik } from "../lib/panchang/engine";

const kathmandu = CITIES.find((c) => c.id === "kathmandu");
if (!kathmandu) throw new Error("Kathmandu missing");

const result = calculateBarshik({
  dateOfPassing: "2025-09-04",
  timeOfPassing: "04:00",
  timeUnknown: false,
  location: kathmandu,
  calendar: "purnimanta",
  dateInputCalendar: "ad",
});

const tz = kathmandu.timeZone;
const death = result.deathPanchang;
const barshikDay = result.barshik.civilDate;

console.log("Death tithi:", death.displayName);
console.log("Barshik:", barshikDay);
console.log("Barshik tithi:", result.barshik.tithiName);
console.log("Barshik ISO-ish:", result.barshik.date.toISOString());

const okTithi =
  death.tithi.name === "Dwadashi" && death.tithi.paksha === "Shukla";
const okDate = barshikDay.includes("September 23, 2026");
const okBarshikTithi = result.barshik.tithiName.includes("Dwadashi");

if (!okTithi || !okDate || !okBarshikTithi) {
  console.error("FAIL", { okTithi, okDate, okBarshikTithi, tz });
  process.exit(1);
}
console.log("PASS");
