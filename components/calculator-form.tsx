"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitySearch } from "@/components/city-search";
import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTHS,
  bsToAd,
  daysInBsMonth,
  isoFromCivil,
  isValidBsDate,
  tryAdToBs,
  civilFromIso,
} from "@/lib/calendar/bikram-sambat";
import { DEFAULT_LOCATION } from "@/lib/panchang/cities";
import { calculateBarshik } from "@/lib/panchang/engine";
import type {
  CalculationInput,
  CalculationResult,
  CalendarSystem,
  DateInputCalendar,
  GeoLocation,
} from "@/lib/panchang/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 rounded-md border border-line bg-white px-2 text-base text-ink shadow-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20";

const selectClass = cn(fieldClass, "w-full min-w-0");

const labelClass = "mb-1 block text-xs font-medium text-zinc-600";

interface CalculatorFormProps {
  onResult: (result: CalculationResult) => void;
}

export function CalculatorForm({ onResult }: CalculatorFormProps) {
  const [dateInputCalendar, setDateInputCalendar] = useState<DateInputCalendar>("bs");
  const [bsYear, setBsYear] = useState(2080);
  const [bsMonth, setBsMonth] = useState(8);
  const [bsDay, setBsDay] = useState(15);
  const [dateOfPassing, setDateOfPassing] = useState(() =>
    isoFromCivil(bsToAd(2080, 8, 15)),
  );
  const [timeOfPassing, setTimeOfPassing] = useState("");
  const [location, setLocation] = useState<GeoLocation | null>(DEFAULT_LOCATION);
  const [calendar, setCalendar] = useState<CalendarSystem>("purnimanta");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const gateyMax = useMemo(() => {
    try {
      return daysInBsMonth(bsYear, bsMonth);
    } catch {
      return 32;
    }
  }, [bsYear, bsMonth]);

  function applyAdIso(iso: string) {
    setDateOfPassing(iso);
    const civil = civilFromIso(iso);
    if (!civil) return;
    const bs = tryAdToBs(civil.year, civil.month, civil.day);
    if (!bs) return;
    setBsYear(bs.year);
    setBsMonth(bs.month);
    setBsDay(bs.day);
  }

  function applyBs(year: number, month: number, day: number) {
    setBsYear(year);
    setBsMonth(month);
    const max = (() => {
      try {
        return daysInBsMonth(year, month);
      } catch {
        return 32;
      }
    })();
    const clamped = Math.min(day, max);
    setBsDay(clamped);
    if (isValidBsDate(year, month, clamped)) {
      setDateOfPassing(isoFromCivil(bsToAd(year, month, clamped)));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let isoDate = dateOfPassing;
    if (dateInputCalendar === "bs") {
      if (!isValidBsDate(bsYear, bsMonth, bsDay)) {
        setError("Enter a valid Nepali year, month, and gatey.");
        return;
      }
      isoDate = isoFromCivil(bsToAd(bsYear, bsMonth, bsDay));
      setDateOfPassing(isoDate);
    } else if (!isoDate) {
      setError("Enter the date of demise.");
      return;
    }

    if (!location) {
      setError("Choose the place of passing.");
      return;
    }

    const timeUnknown = !timeOfPassing;
    const input: CalculationInput = {
      dateOfPassing: isoDate,
      timeOfPassing: timeOfPassing || "12:00",
      timeUnknown,
      location,
      calendar,
      dateInputCalendar,
    };

    setBusy(true);
    window.setTimeout(() => {
      try {
        onResult(calculateBarshik(input));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Calculation failed.");
      } finally {
        setBusy(false);
      }
    }, 20);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <label className={labelClass} htmlFor="bs-year">
            Nepali date (B.S.)
          </label>
          <div className="flex min-w-0 gap-1.5">
            <Input
              id="bs-year"
              aria-label="B.S. year"
              type="number"
              inputMode="numeric"
              min={BS_MIN_YEAR}
              max={BS_MAX_YEAR}
              className={cn(fieldClass, "w-[4.2rem] shrink-0 px-1.5 text-center tabular-nums")}
              value={Number.isFinite(bsYear) ? bsYear : ""}
              onFocus={() => setDateInputCalendar("bs")}
              onChange={(e) => {
                setDateInputCalendar("bs");
                const year = Number(e.target.value);
                if (!Number.isFinite(year)) {
                  setBsYear(Number.NaN);
                  return;
                }
                applyBs(year, bsMonth, bsDay);
              }}
            />
            <select
              id="bs-month"
              aria-label="Nepali month"
              className={cn(selectClass, "min-w-0 flex-1 px-1.5")}
              value={bsMonth}
              onFocus={() => setDateInputCalendar("bs")}
              onChange={(e) => {
                setDateInputCalendar("bs");
                applyBs(bsYear, Number(e.target.value), bsDay);
              }}
            >
              {BS_MONTHS.map((month) => (
                <option key={month.index} value={month.index}>
                  {month.name}
                </option>
              ))}
            </select>
            <select
              id="bs-gatey"
              aria-label="Gatey"
              className={cn(selectClass, "w-[3.4rem] shrink-0 px-1 text-center")}
              value={Math.min(Number.isFinite(bsDay) ? bsDay : 1, gateyMax)}
              onFocus={() => setDateInputCalendar("bs")}
              onChange={(e) => {
                setDateInputCalendar("bs");
                applyBs(bsYear, bsMonth, Number(e.target.value));
              }}
            >
              {Array.from({ length: gateyMax }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="demise-date">
            Gregorian date
          </label>
          <Input
            id="demise-date"
            type="date"
            min="1943-04-14"
            max="2043-12-31"
            className={cn(fieldClass, "w-full min-w-0 px-2")}
            value={dateOfPassing}
            onFocus={() => setDateInputCalendar("ad")}
            onChange={(e) => {
              setDateInputCalendar("ad");
              applyAdIso(e.target.value);
            }}
          />
        </div>

        <Button type="submit" className="h-10 w-full sm:w-auto" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : "Calculate"}
        </Button>
      </div>

      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <CitySearch value={location} onChange={setLocation} compact />
        </div>
        <div>
          <label className={labelClass} htmlFor="demise-time">
            Time (optional)
          </label>
          <Input
            id="demise-time"
            type="time"
            className={cn(fieldClass, "w-full px-2 sm:w-[7rem]")}
            value={timeOfPassing}
            onChange={(e) => setTimeOfPassing(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calendar-system">
            Month system
          </label>
          <select
            id="calendar-system"
            className={cn(selectClass, "w-full min-w-[11.5rem]")}
            value={calendar}
            onChange={(e) => setCalendar(e.target.value as CalendarSystem)}
          >
            <option value="purnimanta">Purnimanta (Nepal / North)</option>
            <option value="amanta">Amanta (South / West)</option>
          </select>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-zinc-500">
        The two calendars stay in sync. Gatey is a B.S. civil day. Shraddha follows the lunar tithi
        at this place. Leave the time blank if it is unknown.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
