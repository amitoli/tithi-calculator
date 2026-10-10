"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchCities } from "@/lib/panchang/cities";
import type { GeoLocation } from "@/lib/panchang/types";
import { cn } from "@/lib/utils";

interface CitySearchProps {
  value: GeoLocation | null;
  onChange: (city: GeoLocation) => void;
  compact?: boolean;
}

export function CitySearch({ value, onChange, compact }: CitySearchProps) {
  const [query, setQuery] = useState(value ? `${value.city}, ${value.country}` : "");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchCities(query), [query]);

  return (
    <div className="relative min-w-0">
      {compact ? (
        <label className="mb-0.5 block text-[11px] font-medium text-slate-500" htmlFor="city-search">
          Place
        </label>
      ) : null}
      <MapPin
        className={cn(
          "pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400",
          compact ? "top-[1.85rem]" : "top-3",
        )}
      />
      <Input
        id="city-search"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="City or location"
        placeholder="Kathmandu, Nikashi…"
        className={cn(
          "pl-8",
          compact &&
            "h-10 rounded-md px-2 text-base shadow-none focus-visible:ring-1",
        )}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No match.</li>
          )}
          {results.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                role="option"
                aria-selected={value?.id === city.id}
                className={cn(
                  "flex w-full flex-col items-start px-3 py-1.5 text-left text-sm hover:bg-amber-50",
                  value?.id === city.id && "bg-amber-50",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(city);
                  setQuery(`${city.city}, ${city.country}`);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-slate-900">{city.city}</span>
                <span className="text-[11px] text-slate-500">
                  {city.region}, {city.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
