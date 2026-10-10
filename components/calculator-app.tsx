"use client";

import { useState } from "react";
import { CalculatorForm } from "@/components/calculator-form";
import { HeroHeader } from "@/components/hero-header";
import { ResultsDashboard } from "@/components/results-dashboard";
import type { CalculationResult } from "@/lib/panchang/types";

export function CalculatorApp() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  return (
    <div className="flex min-h-full flex-col">
      <HeroHeader />
      <main className="flex-1 px-4">
        <CalculatorForm onResult={setResult} />
        {result && <ResultsDashboard result={result} />}
      </main>
      <footer className="mt-auto border-t border-amber-100 px-4 py-8 text-center text-xs leading-relaxed text-slate-500">
        Educational companion for diaspora families. Tithi, Adhik Maas, and regional Panchang
        conventions can differ. This tool does not replace a priest or a published almanac.
      </footer>
    </div>
  );
}
