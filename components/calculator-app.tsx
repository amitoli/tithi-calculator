"use client";

import { useState } from "react";
import { CalculatorForm } from "@/components/calculator-form";
import { HeroHeader } from "@/components/hero-header";
import { ResultsDashboard } from "@/components/results-dashboard";
import type { CalculationResult } from "@/lib/panchang/types";

export function CalculatorApp() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
      <HeroHeader />
      <CalculatorForm onResult={setResult} />
      <main className="mt-2 min-h-0 flex-1">
        {result ? (
          <ResultsDashboard result={result} />
        ) : (
          <p className="px-1 pt-6 text-center text-sm text-slate-500">
            Enter either date. The other stays in sync.
          </p>
        )}
      </main>
    </div>
  );
}
