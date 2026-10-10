"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CitySearch } from "@/components/city-search";
import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTHS,
  adToBs,
  bsToAd,
  civilFromIso,
  daysInBsMonth,
  formatAd,
  formatBs,
  isoFromCivil,
  isValidBsDate,
  tryAdToBs,
} from "@/lib/calendar/bikram-sambat";
import { CITIES } from "@/lib/panchang/cities";
import { calculateBarshik } from "@/lib/panchang/engine";
import type {
  CalculationInput,
  CalculationResult,
  CalendarSystem,
  DateInputCalendar,
  GeoLocation,
} from "@/lib/panchang/types";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/30 focus-visible:border-amber-700";

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
  const [timeOfPassing, setTimeOfPassing] = useState("12:00");
  const [timeUnknown, setTimeUnknown] = useState(true);
  const [location, setLocation] = useState<GeoLocation | null>(CITIES[0]);
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

  const conversionHint = useMemo(() => {
    try {
      if (dateInputCalendar === "bs") {
        if (!isValidBsDate(bsYear, bsMonth, bsDay)) {
          return "That gatey is not valid for the selected Nepali month.";
        }
        const ad = bsToAd(bsYear, bsMonth, bsDay);
        return `Gregorian equivalent: ${formatAd(ad)}`;
      }
      const civil = civilFromIso(dateOfPassing);
      if (!civil) return "Pick a Gregorian date to see the Nepali (B.S.) equivalent.";
      const bs = adToBs(civil.year, civil.month, civil.day);
      return `Nepali equivalent: ${formatBs(bs)}`;
    } catch (err) {
      return err instanceof Error ? err.message : "Could not convert that date.";
    }
  }, [dateInputCalendar, dateOfPassing, bsYear, bsMonth, bsDay]);

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
        setError("Please enter a valid Nepali year, month, and gatey.");
        return;
      }
      isoDate = isoFromCivil(bsToAd(bsYear, bsMonth, bsDay));
      setDateOfPassing(isoDate);
    } else if (!isoDate) {
      setError("Please enter the date of demise.");
      return;
    }

    if (!location) {
      setError("Please choose a city so sunrise and Aparahna can be calculated.");
      return;
    }

    const input: CalculationInput = {
      dateOfPassing: isoDate,
      timeOfPassing,
      timeUnknown,
      location,
      calendar,
      dateInputCalendar,
    };

    setBusy(true);
    window.setTimeout(() => {
      try {
        onResult(calculateBarshik(input));
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Calculation failed. Try another date or city.");
      } finally {
        setBusy(false);
      }
    }, 30);
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Calculation details</CardTitle>
        <CardDescription>
          Most families remember the Nepali month and gatey, not the English calendar date.
          Enter either one — the other is shown beside it. Location is used for local sunrise
          (the tithi printed for that day) and for Aparahna, when the rite is performed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset
              className={cn(
                "space-y-3 rounded-xl border p-4",
                dateInputCalendar === "bs"
                  ? "border-amber-700 bg-amber-50/50 ring-1 ring-amber-700/40"
                  : "border-slate-200",
              )}
            >
              <legend className="px-1 text-sm font-medium text-slate-800">
                Nepali date (B.S.)
              </legend>
              <p className="text-xs text-slate-600">
                Use this if you remember the month and gatey — e.g. Mangsir 15.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bs-year">B.S. year</Label>
                <Input
                  id="bs-year"
                  type="number"
                  min={BS_MIN_YEAR}
                  max={BS_MAX_YEAR}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="bs-month">Month</Label>
                <select
                  id="bs-month"
                  className={selectClass}
                  value={bsMonth}
                  onFocus={() => setDateInputCalendar("bs")}
                  onChange={(e) => {
                    setDateInputCalendar("bs");
                    applyBs(bsYear, Number(e.target.value), bsDay);
                  }}
                >
                  {BS_MONTHS.map((month) => (
                    <option key={month.index} value={month.index}>
                      {month.name} ({month.nepali})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bs-gatey">Gatey</Label>
                <select
                  id="bs-gatey"
                  className={selectClass}
                  value={Math.min(Number.isFinite(bsDay) ? bsDay : 1, gateyMax)}
                  onFocus={() => setDateInputCalendar("bs")}
                  onChange={(e) => {
                    setDateInputCalendar("bs");
                    applyBs(bsYear, bsMonth, Number(e.target.value));
                  }}
                >
                  {Array.from({ length: gateyMax }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day} gatey
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset
              className={cn(
                "space-y-3 rounded-xl border p-4",
                dateInputCalendar === "ad"
                  ? "border-amber-700 bg-amber-50/50 ring-1 ring-amber-700/40"
                  : "border-slate-200",
              )}
            >
              <legend className="px-1 text-sm font-medium text-slate-800">
                Gregorian date (A.D.)
              </legend>
              <p className="text-xs text-slate-600">
                Use this if you have a passport, hospital, or death-certificate date.
              </p>
              <div className="space-y-2">
                <Label htmlFor="demise-date">Date of demise</Label>
                <Input
                  id="demise-date"
                  type="date"
                  min="1943-04-14"
                  max="2043-12-31"
                  value={dateOfPassing}
                  onFocus={() => setDateInputCalendar("ad")}
                  onChange={(e) => {
                    setDateInputCalendar("ad");
                    applyAdIso(e.target.value);
                  }}
                />
              </div>
            </fieldset>
          </div>

          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{conversionHint}</p>
          <p className="text-xs leading-relaxed text-slate-500">
            The two calendars stay in sync. Nepali gatey is a civil B.S. day; rites follow the
            lunar tithi at that moment — they are often close, but not the same thing.
          </p>

          <div className="space-y-2">
            <Label htmlFor="demise-time">Time of passing</Label>
            <Input
              id="demise-time"
              type="time"
              value={timeOfPassing}
              disabled={timeUnknown}
              onChange={(e) => setTimeOfPassing(e.target.value)}
            />
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="time-unknown"
                checked={timeUnknown}
                onCheckedChange={setTimeUnknown}
              />
              <Label htmlFor="time-unknown" className="font-normal text-slate-600">
                Exact time unknown (use 12:00 PM)
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>City / location</Label>
            <CitySearch value={location} onChange={setLocation} />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-800">Lunar month system</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCalendar("purnimanta")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  calendar === "purnimanta"
                    ? "border-amber-700 bg-amber-50 ring-1 ring-amber-700"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <span className="block text-sm font-semibold text-slate-900">
                  Purnimanta
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  Nepal / North India (default). Month ends on Purnima.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCalendar("amanta")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  calendar === "amanta"
                    ? "border-amber-700 bg-amber-50 ring-1 ring-amber-700"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <span className="block text-sm font-semibold text-slate-900">Amanta</span>
                <span className="mt-1 block text-xs text-slate-600">
                  South / West India. Month ends on Amavasya.
                </span>
              </button>
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Calculate Barshik &amp; Annual Shraddha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
