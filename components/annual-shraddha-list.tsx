import type { CalculationResult, Milestone } from "@/lib/panchang/types";
import { formatShortDate } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import { formatBsCompactFromInstant } from "@/lib/calendar/bikram-sambat";

function rowLabel(item: Milestone) {
  if (item.kind === "barshik" || item.yearIndex === 1) return "Barkhanta";
  return `Shraddha ${item.yearIndex ?? ""}`.trim();
}

export function AnnualShraddhaList({ result }: { result: CalculationResult }) {
  const tz = result.input.location.timeZone;
  const now = Date.now();

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[20rem] table-fixed text-left text-[13px] leading-snug">
        <thead className="bg-zinc-50 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="w-[26%] px-3 py-2">Rite</th>
            <th className="w-[32%] px-3 py-2">Gregorian</th>
            <th className="w-[42%] px-3 py-2">Nepali (B.S.)</th>
          </tr>
        </thead>
        <tbody>
          {result.annualShraddha.map((item) => {
            const isNext = result.nextAnnual?.id === item.id;
            const past = item.date.getTime() < now - 12 * 3600 * 1000 && !isNext;
            return (
              <tr
                key={item.id}
                className={cn(
                  "border-t border-line",
                  isNext && "bg-accent-soft font-medium",
                  past && "text-zinc-400",
                )}
              >
                <td className="px-3 py-1.5">
                  {rowLabel(item)}
                  {isNext ? (
                    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      next
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-1.5 tabular-nums">{formatShortDate(item.date, tz)}</td>
                <td className="px-3 py-1.5 tabular-nums">
                  {formatBsCompactFromInstant(item.date, tz)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
