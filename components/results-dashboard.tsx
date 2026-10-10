import { ActionBar } from "@/components/action-bar";
import { AnnualShraddhaList } from "@/components/annual-shraddha-list";
import type { CalculationResult } from "@/lib/panchang/types";
import { formatShortDate } from "@/lib/timezone";
import { formatBsCompactFromInstant } from "@/lib/calendar/bikram-sambat";

function upcomingLabel(result: CalculationResult) {
  const next = result.nextAnnual;
  if (!next) return "Upcoming";
  if (next.kind === "barshik" || next.yearIndex === 1) return "Next · Barkhanta";
  return `Next · Shraddha ${next.yearIndex}`;
}

export function ResultsDashboard({ result }: { result: CalculationResult }) {
  const tz = result.input.location.timeZone;
  const next = result.nextAnnual;
  const deathBs = formatBsCompactFromInstant(result.deathMoment, tz);

  return (
    <section id="results" className="flex flex-col gap-2">
      <p className="px-0.5 text-[12px] leading-snug text-slate-600">
        <span className="font-medium text-slate-800">{result.deathPanchang.displayName}</span>
        {" · "}
        {formatShortDate(result.deathMoment, tz)}
        {deathBs ? ` · ${deathBs}` : ""}
        {" · "}
        {result.input.location.city}
        {result.adhik.occurred ? " · Adhik Maas" : ""}
      </p>

      {next && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            {upcomingLabel(result)}
          </p>
          <p className="mt-0.5 font-serif text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
            {formatShortDate(next.date, tz)}
            {next.nepaliDate ? (
              <span className="ml-2 font-sans text-sm font-medium text-slate-600">
                {formatBsCompactFromInstant(next.date, tz)}
              </span>
            ) : null}
          </p>
          <p className="truncate text-[12px] text-slate-600">{next.tithiName}</p>
        </div>
      )}

      <AnnualShraddhaList result={result} />
      <ActionBar result={result} />
    </section>
  );
}
