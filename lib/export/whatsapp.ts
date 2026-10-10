import { formatShortDate } from "../timezone";
import type { CalculationResult } from "../panchang/types";

export function buildWhatsAppText(result: CalculationResult): string {
  const tz = result.input.location.timeZone;
  const lines = [
    "Tithi & Barshik schedule",
    `Passing tithi: ${result.deathPanchang.displayName}`,
    ...(result.deathNepaliDate ? [`Date of passing (B.S.): ${result.deathNepaliDate}`] : []),
    `Barshik / Barkhanta: ${formatShortDate(result.barshik.date, tz)}${result.barshik.nepaliDate ? ` / ${result.barshik.nepaliDate}` : ""} — ${result.barshik.tithiName}`,
    `Civil 365-day date: ${formatShortDate(result.civilAnniversary.date, tz)}`,
    `13-day kiriya: ${formatShortDate(result.kriya.date, tz)}`,
    `11th-month Barkhi: ${formatShortDate(result.barkhi.date, tz)}`,
    "",
    "Monthly Masik Shraddha:",
    ...result.masik.map(
      (m, i) => `${i + 1}. ${formatShortDate(m.date, tz)}${m.nepaliDate ? ` / ${m.nepaliDate}` : ""} — ${m.tithiName}`,
    ),
    "",
    "Annual Shraddha:",
    ...result.annualShraddha.map(
      (m) =>
        `${m.yearIndex ?? ""}. ${formatShortDate(m.date, tz)}${m.nepaliDate ? ` / ${m.nepaliDate}` : ""} — ${m.tithiName}`,
    ),
    "",
    result.adhik.occurred
      ? `Note: ${result.adhik.months.join(", ")} affected the lunar year.`
      : "Note: No Adhik Maas in this first-year window.",
    "Please confirm with your family priest.",
  ];
  return lines.join("\n");
}

export function whatsAppShareUrl(result: CalculationResult): string {
  return `https://wa.me/?text=${encodeURIComponent(buildWhatsAppText(result))}`;
}
