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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full table-fixed text-left text-[12px] leading-tight sm:text-[13px]">
        <thead className="bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="w-[28%] px-2 py-1 sm:w-[22%]">Rite</th>
            <th className="w-[36%] px-2 py-1">Gregorian</th>
            <th className="w-[36%] px-2 py-1">Nepali</th>
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
                  "border-t border-slate-100",
                  isNext && "bg-amber-50 font-medium",
                  past && "text-slate-400",
                )}
              >
                <td className="truncate px-2 py-0.5">
                  {rowLabel(item)}
                  {isNext ? (
                    <span className="ml-1 text-[10px] font-semibold uppercase text-amber-800">
                      next
                    </span>
                  ) : null}
                </td>
                <td className="truncate px-2 py-0.5 tabular-nums">
                  {formatShortDate(item.date, tz)}
                </td>
                <td className="truncate px-2 py-0.5 tabular-nums">
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
