export function HeroHeader() {
  return (
    <header className="border-b border-line pb-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
        Panchang · Nepal &amp; India
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        Barshik date calculator
      </h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600">
        Hindu death anniversary tithi for Barkhanta and annual shraddha. Enter a Nepali month
        and gatey, or a Gregorian date of passing. The lunar tithi, Adhik Maas, and local sunrise
        set the date, not the 365-day anniversary.
      </p>
    </header>
  );
}
