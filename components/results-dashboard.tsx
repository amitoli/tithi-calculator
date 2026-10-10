import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ActionBar } from "@/components/action-bar";
import { AnnualShraddhaList } from "@/components/annual-shraddha-list";
import { DualDate } from "@/components/dual-date";
import { Explainer } from "@/components/explainer";
import { MilestoneTimeline } from "@/components/milestone-timeline";
import type { CalculationResult } from "@/lib/panchang/types";
import { formatCivilDate } from "@/lib/timezone";

export function ResultsDashboard({ result }: { result: CalculationResult }) {
  return (
    <section id="results" className="mx-auto mt-10 max-w-3xl space-y-6 px-4 pb-16">
      <Card className="overflow-hidden border-amber-700/20 bg-gradient-to-br from-white to-amber-50">
        <CardContent className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            Barshik / Barkhanta
          </p>
          <DualDate
            gregorian={result.barshik.civilDate}
            nepali={result.barshik.nepaliDate}
            gregorianClassName="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl"
            nepaliClassName="mt-2 font-serif text-lg"
          />
          <p className="mt-3 font-serif text-lg italic text-slate-700">{result.barshik.tithiName}</p>
          <div className="mt-5 rounded-xl border border-amber-200/80 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date of passing
            </p>
            <DualDate
              gregorian={formatCivilDate(result.deathMoment, result.input.location.timeZone)}
              nepali={result.deathNepaliDate}
              gregorianClassName="mt-1 text-sm font-medium"
              nepaliClassName="text-sm"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Death tithi: {result.deathPanchang.displayName}</Badge>
            <Badge variant="outline">
              Civil 365-day: {result.civilAnniversary.civilDate}
            </Badge>
            {result.civilAnniversary.nepaliDate && (
              <Badge variant="outline">{result.civilAnniversary.nepaliDate}</Badge>
            )}
            {result.adhik.occurred && (
              <Badge variant="saffron">Adhik Maas adjusted</Badge>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Observed during Aparahna Kala in {result.input.location.city}. Confirm with your
            family priest before fixing travel or hall bookings.
          </p>
        </CardContent>
      </Card>

      <Explainer result={result} />
      <MilestoneTimeline result={result} />
      <AnnualShraddhaList result={result} />
      <ActionBar result={result} />
    </section>
  );
}
