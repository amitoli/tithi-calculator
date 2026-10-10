import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalculationResult } from "@/lib/panchang/types";

export function Explainer({ result }: { result: CalculationResult }) {
  return (
    <Card className="border-amber-300/80 bg-amber-50/60">
      <CardHeader>
        <CardTitle className="text-lg">Why this date?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm leading-relaxed text-slate-700">
          {result.adhik.occurred
            ? `Your Barshik tithi ${
                result.adhik.daysShifted > 0
                  ? `shifted later by about ${result.adhik.daysShifted} days`
                  : "moved relative to the civil anniversary"
              } because ${result.adhik.months.join(" and ") || "an intercalary month"} occurred in the lunar year.`
            : "The matching lunar tithi falls on the ordinary 12-month cycle this year — no Adhik Maas leap-month shift was required."}
        </p>
        <Accordion type="multiple" className="w-full">
          {result.explanation.map((text, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>
                {i === 0
                  ? "Death tithi used"
                  : i === 1
                    ? "Nepali (B.S.) civil date"
                    : i === 2
                      ? "Purnimanta vs Amanta"
                      : i === 3
                        ? "Time of passing"
                        : i === 4
                          ? "Panchang day (sunrise tithi)"
                          : i === 5
                            ? "Civil vs lunar date"
                            : i === 6
                              ? "Annual shraddha"
                              : i === 7
                                ? "Adhik Maas"
                                : "Notes"}
              </AccordionTrigger>
              <AccordionContent>{text}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
