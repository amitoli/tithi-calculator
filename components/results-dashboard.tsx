import { ActionBar } from "@/components/action-bar";
import type { CalculationResult } from "@/lib/panchang/types";
import { formatBsCompactFromInstant } from "@/lib/calendar/bikram-sambat";
import { formatCivilDate } from "@/lib/timezone";

function observanceTitle(result: CalculationResult) {
  const next = result.nextAnnual;
  if (!next || next.kind === "barshik" || next.yearIndex === 1) return "Barkhanta";
  return "Annual shraddha";
}

export function ResultsDashboard({ result }: { result: CalculationResult }) {
  const tz = result.input.location.timeZone;
  const next = result.nextAnnual;
  const deathBs = formatBsCompactFromInstant(result.deathMoment, tz);

  return (
    <section id="results" className="flex flex-col gap-4" aria-live="polite">
      <p className="text-sm leading-relaxed text-zinc-700">
        <span className="font-medium text-ink">Death tithi.</span> {result.deathPanchang.displayName}
        {", "}
        {formatCivilDate(result.deathMoment, tz)}
        {deathBs ? `, ${deathBs} B.S.` : ""}
        {", "}
        {result.input.location.city}
        {result.input.timeUnknown ? ", time not recorded" : ""}
        .
      </p>
      {result.adhik.occurred && (
        <p className="text-xs text-zinc-500">
          Adhik Maas ({result.adhik.months.join(", ")}) falls before this date, so it is later than a
          plain 12-month count.
        </p>
      )}

      {next && (
        <div className="rounded-lg border border-line border-l-4 border-l-accent bg-accent-soft px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {observanceTitle(result)}
          </p>
          <p className="mt-1 text-xl font-semibold leading-snug text-ink sm:text-2xl">{next.civilDate}</p>
          {next.nepaliDate ? <p className="mt-1 text-sm text-zinc-700">{next.nepaliDate}</p> : null}
          <p className="mt-1 text-sm text-zinc-800">{next.tithiName}</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
            Barkhanta is the first year of the same rite. Each later year is shraddha on this tithi.
            This is the next one.
          </p>
        </div>
      )}

      <ActionBar result={result} />
    </section>
  );
}
