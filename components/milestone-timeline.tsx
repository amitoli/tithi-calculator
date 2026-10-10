import { CalendarHeart, CircleDot, Flower2, Landmark, Moon, Repeat } from "lucide-react";
import { DualDate } from "@/components/dual-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalculationResult, Milestone } from "@/lib/panchang/types";
import { formatShortDate } from "@/lib/timezone";
import { cn } from "@/lib/utils";

function iconFor(kind: Milestone["kind"]) {
  switch (kind) {
    case "kriya":
      return Flower2;
    case "barkhi":
      return Landmark;
    case "barshik":
      return CalendarHeart;
    case "civil":
      return CircleDot;
    case "annual":
      return Repeat;
    default:
      return Moon;
  }
}

export function MilestoneTimeline({ result }: { result: CalculationResult }) {
  const tz = result.input.location.timeZone;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">First-year milestone timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0 border-l border-amber-200 pl-6">
          {result.timeline.map((item) => {
            const Icon = iconFor(item.kind);
            const emphasis = item.kind === "barshik" || item.kind === "barkhi" || item.kind === "kriya";
            return (
              <li key={item.id} className="relative pb-8 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[31px] flex h-8 w-8 items-center justify-center rounded-full border bg-white",
                    emphasis ? "border-amber-700 text-amber-800" : "border-slate-200 text-slate-500",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <DualDate
                  gregorian={formatShortDate(item.date, tz)}
                  nepali={item.nepaliDate}
                  gregorianClassName="text-xs font-medium uppercase tracking-wide text-amber-800"
                  nepaliClassName="text-xs text-slate-500"
                />
                <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
                <p className="font-serif text-sm italic text-slate-700">{item.tithiName}</p>
                <p className="mt-1 text-sm text-slate-600">{item.notes}</p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
