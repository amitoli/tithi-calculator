import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DualDate } from "@/components/dual-date";
import type { CalculationResult } from "@/lib/panchang/types";
import { cn } from "@/lib/utils";

export function AnnualShraddhaList({ result }: { result: CalculationResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Annual Shraddha calendar</CardTitle>
        <CardDescription>
          After the first Barshik / Barkhanta, families continue yearly shraddha on the same
          death tithi. Dates below are tithi-based (A.D. and B.S.), not the civil 365-day
          anniversary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.nextAnnual && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
            Next upcoming:{" "}
            <span className="font-medium text-slate-900">{result.nextAnnual.title}</span>
            {" · "}
            {result.nextAnnual.civilDate}
            {result.nextAnnual.nepaliDate ? ` · ${result.nextAnnual.nepaliDate}` : ""}
          </p>
        )}
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {result.annualShraddha.map((item) => {
            const isNext = result.nextAnnual?.id === item.id;
            const isFirst = item.kind === "barshik";
            return (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 px-4 py-3",
                  isNext && "bg-amber-50/80",
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-800">
                  <Repeat className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    {isFirst && <Badge>Barkhanta</Badge>}
                    {isNext && <Badge variant="saffron">Next</Badge>}
                  </div>
                  <DualDate
                    gregorian={item.civilDate}
                    nepali={item.nepaliDate}
                    gregorianClassName="mt-1 text-sm font-medium"
                    nepaliClassName="mt-0.5 text-xs"
                  />
                  <p className="mt-1 font-serif text-sm italic text-slate-700">{item.tithiName}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
