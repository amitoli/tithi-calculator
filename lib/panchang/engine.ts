import { formatBsFromInstant } from "../calendar/bikram-sambat";
import { addGregorianYears, addLocalDays, formatCivilDate, isoDateInZone, localDateParts, parseZonedDateTime, startOfLocalDay } from "../timezone";
import {
  aparahnaWindow,
  nextNewMoon,
  previousNewMoon,
  sunRashiIndex,
  sunTimes,
  tithiAt,
} from "./astronomy";
import { ANNUAL_SHRADDHA_YEARS, LUNAR_MONTHS, SYNODIC_MONTH_DAYS } from "./constants";
import type {
  AdhikShift,
  CalculationInput,
  CalculationResult,
  CalendarSystem,
  DayPanchang,
  GeoLocation,
  MasaInfo,
  Milestone,
  PanchangMoment,
  TithiInfo,
} from "./types";

function monthName(index: number): string {
  return LUNAR_MONTHS[((index % 12) + 12) % 12];
}

function amantaMonthAt(date: Date): { index: number; name: string; adhik: boolean } {
  const start = previousNewMoon(date);
  const end = nextNewMoon(date);
  const rashiStart = sunRashiIndex(start);
  const rashiEnd = sunRashiIndex(end);

  if (rashiStart === rashiEnd) {
    const index = (rashiStart + 1) % 12;
    return { index, name: monthName(index), adhik: true };
  }

  const index = rashiEnd % 12;
  return { index, name: monthName(index), adhik: false };
}

function masaAt(date: Date, tithi: TithiInfo, system: CalendarSystem): MasaInfo {
  const amanta = amantaMonthAt(date);
  let index = amanta.index;
  if (system === "purnimanta" && tithi.paksha === "Krishna") {
    index = (amanta.index + 1) % 12;
  }
  return {
    index,
    name: monthName(index),
    adhik: amanta.adhik,
    system,
    amantaIndex: amanta.index,
    amantaName: amanta.name,
  };
}

export function panchangAt(date: Date, system: CalendarSystem): PanchangMoment {
  const tithi = tithiAt(date);
  const masa = masaAt(date, tithi, system);
  const leap = masa.adhik ? "Adhik " : "";
  const displayName = `${leap}${masa.name} ${tithi.paksha} ${tithi.name}`;
  return { at: date, tithi, masa, displayName };
}

export function dayPanchang(
  localNoonish: Date,
  location: GeoLocation,
  system: CalendarSystem,
): DayPanchang {
  const midnight = startOfLocalDay(localNoonish, location.timeZone);
  const { sunrise, sunset } = sunTimes(midnight, location.latitude, location.longitude);
  const aparahna = aparahnaWindow(sunrise, sunset);
  // Printed panchang tithi is the sunrise tithi, not the Aparahna tithi.
  const moment = panchangAt(sunrise, system);
  return {
    ...moment,
    civilDate: formatCivilDate(sunrise, location.timeZone),
    sunrise,
    sunset,
    aparahnaStart: aparahna.start,
    aparahnaEnd: aparahna.end,
    aparahnaMid: aparahna.mid,
  };
}

function tithiIndicesInWindow(start: Date, end: Date): number[] {
  const found = new Set<number>();
  const span = Math.max(1, end.getTime() - start.getTime());
  for (let i = 0; i <= 8; i += 1) {
    found.add(tithiAt(new Date(start.getTime() + (span * i) / 8)).index);
  }
  return [...found];
}

function coverageOfTithi(start: Date, end: Date, index: number): number {
  const span = Math.max(1, end.getTime() - start.getTime());
  let hits = 0;
  const samples = 8;
  for (let i = 0; i <= samples; i += 1) {
    if (tithiAt(new Date(start.getTime() + (span * i) / samples)).index === index) hits += 1;
  }
  return hits / (samples + 1);
}

/**
 * Hindu civil/panchang day begins at sunrise. A death recorded at 4 AM on a
 * Gregorian date still belongs to that printed date, whose tithi is the sunrise tithi.
 */
export function deathTithiMoment(
  deathMoment: Date,
  location: GeoLocation,
): { moment: Date; sunrise: Date; usedSunrise: boolean } {
  const midnight = startOfLocalDay(deathMoment, location.timeZone);
  const { sunrise } = sunTimes(midnight, location.latitude, location.longitude);
  if (deathMoment.getTime() < sunrise.getTime()) {
    return { moment: sunrise, sunrise, usedSunrise: true };
  }
  return { moment: deathMoment, sunrise, usedSunrise: false };
}

function scoreMatch(day: DayPanchang, target: PanchangMoment): number {
  const aparahnaTithis = tithiIndicesInWindow(day.aparahnaStart, day.aparahnaEnd);
  const coverage = coverageOfTithi(day.aparahnaStart, day.aparahnaEnd, target.tithi.index);
  const sunriseHit = day.tithi.index === target.tithi.index;
  const aparahnaHit = aparahnaTithis.includes(target.tithi.index);
  let score = 0;
  if (sunriseHit) score += 120;
  else if (aparahnaHit) score += 40;
  else score -= 80;
  if (day.tithi.paksha === target.tithi.paksha) score += 15;
  else score -= 20;
  if (day.masa.amantaIndex === target.masa.amantaIndex) score += 50;
  else score -= 45;
  if (day.masa.adhik) score -= 25;
  if (aparahnaHit) score += coverage * 8;
  return score;
}

function searchMatchingDay(
  around: Date,
  target: PanchangMoment,
  location: GeoLocation,
  system: CalendarSystem,
  windowDays = 18,
  preferNija = true,
): DayPanchang {
  let best: DayPanchang | null = null;
  let bestScore = -Infinity;

  for (let offset = -windowDays; offset <= windowDays; offset += 1) {
    const candidate = addLocalDays(around, offset, location.timeZone);
    const day = dayPanchang(candidate, location, system);
    let score = scoreMatch(day, target);
    if (preferNija && day.masa.adhik) score -= 18;
    if (score > bestScore) {
      bestScore = score;
      best = day;
    }
  }

  if (!best) {
    throw new Error("Unable to locate a matching tithi day.");
  }
  return best;
}

function adhikMonthsBetween(start: Date, end: Date): string[] {
  const names: string[] = [];
  let cursor = new Date(start.getTime() + 12 * 3600 * 1000);
  const limit = end.getTime();
  const maxSteps = Math.max(8, Math.ceil((limit - cursor.getTime()) / (20 * 86400000)) + 6);
  let guard = 0;
  while (cursor.getTime() < limit && guard < maxSteps) {
    const month = amantaMonthAt(cursor);
    const monthEnd = nextNewMoon(cursor);
    if (month.adhik) names.push(`Adhik ${month.name}`);
    cursor = new Date(monthEnd.getTime() + 12 * 3600 * 1000);
    guard += 1;
  }
  return names;
}

function milestone(
  partial: Omit<Milestone, "civilDate" | "nepaliDate"> & { timeZone: string },
): Milestone {
  return {
    ...partial,
    civilDate: formatCivilDate(partial.date, partial.timeZone),
    nepaliDate: formatBsFromInstant(partial.date, partial.timeZone),
  };
}

function lunarAnniversaryDay(
  deathMoment: Date,
  deathPanchang: PanchangMoment,
  yearIndex: number,
  location: GeoLocation,
  system: CalendarSystem,
): { day: DayPanchang; adhikNames: string[] } {
  const around = new Date(
    deathMoment.getTime() + yearIndex * 12 * SYNODIC_MONTH_DAYS * 86400000,
  );
  const probeEnd = new Date(around.getTime() + 80 * 86400000);
  const adhikNames = adhikMonthsBetween(deathMoment, probeEnd);
  const extra = adhikNames.length;
  const centerOffsets = [...new Set([Math.max(0, extra - 1), extra, extra + 1])];
  let best: DayPanchang | null = null;
  let bestScore = -Infinity;
  for (const k of centerOffsets) {
    const searchCenter = new Date(around.getTime() + k * SYNODIC_MONTH_DAYS * 86400000);
    const day = searchMatchingDay(searchCenter, deathPanchang, location, system, 20, true);
    let score = scoreMatch(day, deathPanchang);
    if (day.masa.adhik) score -= 18;
    if (score > bestScore) {
      bestScore = score;
      best = day;
    }
  }
  if (!best) {
    throw new Error("Unable to locate a matching annual tithi day.");
  }
  return { day: best, adhikNames };
}

export function calculateBarshik(input: CalculationInput): CalculationResult {
  const time = input.timeUnknown ? "12:00" : input.timeOfPassing || "12:00";
  const deathMoment = parseZonedDateTime(
    input.dateOfPassing,
    time,
    input.location.timeZone,
  );
  const tithiRef = deathTithiMoment(deathMoment, input.location);
  const deathPanchang = panchangAt(tithiRef.moment, input.calendar);
  const tz = input.location.timeZone;

  const kriyaDay = addLocalDays(deathMoment, 12, tz);
  const kriyaPanchang = dayPanchang(kriyaDay, input.location, input.calendar);

  const masik: Milestone[] = [];
  for (let n = 1; n <= 11; n += 1) {
    const around = new Date(deathMoment.getTime() + n * SYNODIC_MONTH_DAYS * 86400000);
    const day = searchMatchingDay(around, deathPanchang, input.location, input.calendar, 10, true);
    const isBarkhi = n === 11;
    masik.push(
      milestone({
        id: isBarkhi ? "barkhi" : `masik-${n}`,
        kind: isBarkhi ? "barkhi" : "masik",
        title: isBarkhi ? `11th-month Barkhi` : `Masik Shraddha · Month ${n}`,
        subtitle: day.displayName,
        date: day.aparahnaMid,
        tithiName: day.displayName,
        notes: isBarkhi
          ? "Larger preparatory rites often begin in the 11th lunar month."
          : "Monthly offering observed on the death tithi.",
        timeZone: tz,
      }),
    );
  }

  const firstYear = lunarAnniversaryDay(
    deathMoment,
    deathPanchang,
    1,
    input.location,
    input.calendar,
  );
  const barshikDay = firstYear.day;
  const adhikNames = firstYear.adhikNames;
  const adhikOccurred = adhikNames.length > 0;

  const civil = addGregorianYears(deathMoment, 1, tz);
  const daysShifted = Math.round(
    (startOfLocalDay(barshikDay.aparahnaMid, tz).getTime() -
      startOfLocalDay(civil, tz).getTime()) /
      86400000,
  );

  const adhik: AdhikShift = {
    occurred: adhikOccurred,
    months: adhikNames,
    daysShifted,
  };

  const barshik = milestone({
    id: "barshik",
    kind: "barshik",
    title: "Barshik / Barkhanta",
    subtitle: barshikDay.displayName,
    date: barshikDay.aparahnaMid,
    tithiName: barshikDay.displayName,
    notes: "First-year Barshik / Barkhanta — annual shraddha on the death tithi during Aparahna Kala.",
    yearIndex: 1,
    timeZone: tz,
  });

  const civilAnniversary = milestone({
    id: "civil-365",
    kind: "civil",
    title: "Gregorian 365-day anniversary",
    subtitle: "Civil calendar date (not used for the ritual tithi)",
    date: civil,
    tithiName: panchangAt(civil, input.calendar).displayName,
    notes: "Same month and day next year on the Gregorian calendar.",
    timeZone: tz,
  });

  const kriya = milestone({
    id: "kriya-13",
    kind: "kriya",
    title: "13-day Kiriya completion",
    subtitle: kriyaPanchang.displayName,
    date: kriyaPanchang.aparahnaMid,
    tithiName: kriyaPanchang.displayName,
    notes: "Traditional close of the initial mourning / kiriya period.",
    timeZone: tz,
  });

  const barkhi = masik[masik.length - 1];

  const annualShraddha: Milestone[] = [barshik];
  for (let n = 2; n <= ANNUAL_SHRADDHA_YEARS; n += 1) {
    const found = lunarAnniversaryDay(
      deathMoment,
      deathPanchang,
      n,
      input.location,
      input.calendar,
    );
    const extraAdhik = found.adhikNames.length > firstYear.adhikNames.length;
    annualShraddha.push(
      milestone({
        id: `annual-${n}`,
        kind: "annual",
        title: `Annual Shraddha · Year ${n}`,
        subtitle: found.day.displayName,
        date: found.day.aparahnaMid,
        tithiName: found.day.displayName,
        notes: extraAdhik
          ? `Observed on the death tithi. Extra lunar month(s) (${found.adhikNames.join(", ")}) fall before this year, so the Gregorian date is later than a simple 12-month count.`
          : "Yearly ancestral shraddha on the same lunar tithi as the date of passing.",
        yearIndex: n,
        timeZone: tz,
      }),
    );
  }

  const now = Date.now();
  const nextAnnual =
    annualShraddha.find((item) => item.date.getTime() >= now - 12 * 3600 * 1000) ??
    annualShraddha[annualShraddha.length - 1];

  const deathNepaliDate = formatBsFromInstant(deathMoment, tz);

  const explanation = buildExplanation({
    input,
    deathMoment,
    deathPanchang,
    deathNepaliDate,
    barshik,
    civilAnniversary,
    adhik,
    annualShraddha,
    usedSunriseTithi: tithiRef.usedSunrise,
  });

  const timeline: Milestone[] = [kriya, ...masik, barshik, civilAnniversary];

  return {
    input,
    deathMoment,
    deathPanchang,
    deathNepaliDate,
    barshik,
    civilAnniversary,
    kriya,
    barkhi,
    masik,
    annualShraddha,
    nextAnnual,
    timeline,
    adhik,
    explanation,
  };
}

function buildExplanation(args: {
  input: CalculationInput;
  deathMoment: Date;
  deathPanchang: PanchangMoment;
  deathNepaliDate: string;
  barshik: Milestone;
  civilAnniversary: Milestone;
  adhik: AdhikShift;
  annualShraddha: Milestone[];
  usedSunriseTithi: boolean;
}): string[] {
  const {
    input,
    deathPanchang,
    barshik,
    civilAnniversary,
    adhik,
    deathMoment,
    deathNepaliDate,
    annualShraddha,
    usedSunriseTithi,
  } = args;
  const systemLabel =
    input.calendar === "purnimanta"
      ? "Purnimanta (Nepal / North India) — Krishna paksha belongs to the upcoming month name"
      : "Amanta (South / West India) — the month ends on Amavasya";
  const timeNote = input.timeUnknown
    ? "Exact time was not known, so midday (12:00) was used. If the true time was near sunset, the tithi can change; confirm with a family priest when possible."
    : usedSunriseTithi
      ? `Passing was before local sunrise, so the death tithi is the sunrise tithi of that civil date (${deathPanchang.tithi.paksha} ${deathPanchang.tithi.name}) — the tithi printed in the Panchang for that day. Instantaneous tithi at the recorded clock time can still be the previous one if death falls near a tithi sandhi.`
      : `The tithi was read at the recorded time of passing in ${input.location.city}.`;

  const nepaliLine = deathNepaliDate
    ? input.dateInputCalendar === "bs"
      ? `You entered a Nepali civil date (${deathNepaliDate}). Gatey is the Bikram Sambat calendar day — not the lunar tithi. The death tithi was then read from the moon at that local date and time.`
      : `Nepali civil equivalent of the date of passing: ${deathNepaliDate}.`
    : "This date is outside the bundled Bikram Sambat table (2000–2100 B.S.).";

  const lastAnnual = annualShraddha[annualShraddha.length - 1];

  const lines = [
    `Death tithi: ${deathPanchang.displayName}. Annual rites follow this same masa, paksha, and tithi — not the Gregorian or Nepali civil date.`,
    nepaliLine,
    `Calendar system: ${systemLabel}.`,
    timeNote,
    `Barshik / first annual shraddha is scheduled on ${barshik.civilDate}${barshik.nepaliDate ? ` / ${barshik.nepaliDate}` : ""}. That is the panchang civil day whose sunrise tithi is ${deathPanchang.tithi.paksha} ${deathPanchang.tithi.name} (the tithi printed for that date). The rite itself is still performed in Aparahna on that day. If the tithi is skipped at sunrise (kshaya), the day when it falls in Aparahna is used instead.`,
    `The civil 365-day date is ${civilAnniversary.civilDate}${civilAnniversary.nepaliDate ? ` / ${civilAnniversary.nepaliDate}` : ""}. Hindu / Nepali ancestral rites use the lunar tithi, so these two dates often differ.`,
    `After the first Barshik, the same tithi is observed every lunar year as annual shraddha. This schedule lists ${annualShraddha.length} years, through ${lastAnnual?.civilDate ?? "the coming decade"}.`,
  ];

  if (adhik.occurred) {
    const names = adhik.months.join(", ");
    const dir =
      adhik.daysShifted > 0
        ? `shifted later by about ${adhik.daysShifted} days versus the civil anniversary`
        : adhik.daysShifted < 0
          ? `fell about ${Math.abs(adhik.daysShifted)} days before the civil anniversary`
          : "landed near the civil anniversary";
    lines.push(
      `An intercalary month (${names}) occurs between the date of passing and the next annual cycle. Adhik Maas adds an extra lunar month (~29.5–30 days). The matching nija (regular) tithi was used, so the Barshik date ${dir}.`,
    );
  } else {
    lines.push(
      "No Adhik Maas (leap month) was detected in the first-year window, so the anniversary stays on the ordinary 12-month lunar cycle (~354 days).",
    );
  }

  if (deathPanchang.masa.adhik) {
    lines.push(
      `The original passing itself fell in Adhik ${deathPanchang.masa.name}. Subsequent yearly rites are aligned to the nija (non-leap) month of the same name when both occur.`,
    );
  }

  const parts = localDateParts(deathMoment, input.location.timeZone);
  lines.push(
    `Location used for sunrise and Aparahna: ${input.location.city}, ${input.location.country} (${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")} local). Families should still verify the final date with their pujari or a printed Panchang.`,
  );

  return lines;
}

export function resultFingerprint(result: CalculationResult): string {
  return isoDateInZone(result.barshik.date, result.input.location.timeZone);
}
