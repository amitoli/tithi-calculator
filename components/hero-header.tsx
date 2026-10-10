import { Flame } from "lucide-react";

export function HeroHeader() {
  return (
    <header className="mx-auto max-w-3xl px-4 pb-8 pt-10 text-center sm:pt-14">
      <div className="mb-4 inline-flex items-center justify-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium tracking-wide text-amber-800">
        <Flame className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Hindu &amp; Nepali Panchang
      </div>
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Tithi &amp; Barshik Companion
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
        Enter a Nepali month and gatey or a Gregorian date. Get Barshik / Barkhanta, monthly
        and annual shraddha dates (A.D. and B.S.), Adhik Maas shifts, and calendar sync.
      </p>
    </header>
  );
}
