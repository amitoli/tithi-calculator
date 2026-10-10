import { CITIES } from "../lib/panchang/cities";
import { calculateBarshik, dayPanchang } from "../lib/panchang/engine";
import { zonedDate } from "../lib/timezone";

function city(id: string) {
  const found = CITIES.find((c) => c.id === id);
  if (!found) throw new Error(`Missing city ${id}`);
  return found;
}

function fail(message: string): never {
  console.error("FAIL", message);
  process.exit(1);
}

function assert(cond: boolean, message: string) {
  if (!cond) fail(message);
}

const kathmandu = city("kathmandu");
const bengaluru = city("bangalore");

const dwadashi = calculateBarshik({
  dateOfPassing: "2025-09-04",
  timeOfPassing: "04:00",
  timeUnknown: false,
  location: kathmandu,
  calendar: "purnimanta",
  dateInputCalendar: "ad",
});

assert(
  dwadashi.deathPanchang.tithi.name === "Dwadashi" &&
    dwadashi.deathPanchang.tithi.paksha === "Shukla",
  `Kathmandu death tithi should be Shukla Dwadashi, got ${dwadashi.deathPanchang.displayName}`,
);
assert(
  dwadashi.barshik.civilDate.includes("September 23, 2026"),
  `Kathmandu barshik should be 23 Sep 2026, got ${dwadashi.barshik.civilDate}`,
);
assert(
  dwadashi.barshik.tithiName.includes("Dwadashi"),
  `Kathmandu barshik tithi should be Dwadashi, got ${dwadashi.barshik.tithiName}`,
);

const bengaluruCase = calculateBarshik({
  dateOfPassing: "2023-02-27",
  timeOfPassing: "22:30",
  timeUnknown: false,
  location: bengaluru,
  calendar: "purnimanta",
  dateInputCalendar: "ad",
});

assert(
  bengaluruCase.deathPanchang.tithi.name === "Ashtami" &&
    bengaluruCase.deathPanchang.tithi.paksha === "Shukla",
  `Bengaluru death tithi should be Shukla Ashtami, got ${bengaluruCase.deathPanchang.displayName}`,
);
assert(
  bengaluruCase.barshik.civilDate.includes("March 17, 2024"),
  `Bengaluru barkhanta should stay 17 Mar 2024, got ${bengaluruCase.barshik.civilDate}`,
);
assert(
  bengaluruCase.barshik.tithiName.includes("Ashtami") &&
    bengaluruCase.barshik.tithiName.includes("Phalguna"),
  `Bengaluru barkhanta tithi should be Phalguna Shukla Ashtami, got ${bengaluruCase.barshik.tithiName}`,
);

const year2 = bengaluruCase.annualShraddha[1];
assert(Boolean(year2), "Year 2 annual shraddha missing");
assert(
  year2.civilDate.includes("March 7, 2025"),
  `2025 shraddha should be 7 Mar 2025 (sunrise Ashtami), got ${year2.civilDate}`,
);
assert(
  year2.tithiName.includes("Ashtami") && !year2.tithiName.includes("Saptami"),
  `2025 shraddha label should be Ashtami, got ${year2.tithiName}`,
);

const mar6 = dayPanchang(zonedDate(2025, 3, 6, 12, 0, bengaluru.timeZone), bengaluru, "purnimanta");
const mar7 = dayPanchang(zonedDate(2025, 3, 7, 12, 0, bengaluru.timeZone), bengaluru, "purnimanta");
assert(
  mar6.tithi.name === "Saptami",
  `6 Mar 2025 sunrise tithi should be Saptami, got ${mar6.displayName}`,
);
assert(
  mar7.tithi.name === "Ashtami",
  `7 Mar 2025 sunrise tithi should be Ashtami, got ${mar7.displayName}`,
);

const year4 = bengaluruCase.annualShraddha[3];
assert(
  Boolean(year4?.tithiName.includes("Phalguna") && year4.tithiName.includes("Ashtami")),
  `Year 4 should stay Phalguna Shukla Ashtami, got ${year4?.civilDate} ${year4?.tithiName}`,
);

console.log("PASS");
console.log("Kathmandu barshik:", dwadashi.barshik.civilDate, dwadashi.barshik.tithiName);
console.log("Bengaluru barkhanta:", bengaluruCase.barshik.civilDate, bengaluruCase.barshik.tithiName);
console.log("Bengaluru 2025:", year2.civilDate, year2.tithiName);
console.log("Bengaluru year 4:", year4.civilDate, year4.tithiName);
