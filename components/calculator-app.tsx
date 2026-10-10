"use client";

import { useState } from "react";
import { CalculatorForm } from "@/components/calculator-form";
import { HeroHeader } from "@/components/hero-header";
import { ResultsDashboard } from "@/components/results-dashboard";
import type { CalculationResult } from "@/lib/panchang/types";

export function CalculatorApp() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-8">
      <HeroHeader />
      <div className="mt-5 rounded-lg border border-line bg-white p-4 sm:p-5">
        <CalculatorForm onResult={setResult} />
      </div>
      <main className="mt-5">
        {result ? (
          <ResultsDashboard result={result} />
        ) : (
          <p className="text-sm text-zinc-600">
            Choose the place of passing so sunrise and the printed tithi are local. Leave the time
            blank if it is unknown.
          </p>
        )}
      </main>
    </div>
  );
}
