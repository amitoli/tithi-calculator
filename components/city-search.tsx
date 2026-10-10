"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { placeLabel, searchCities } from "@/lib/panchang/cities";
import type { GeoLocation } from "@/lib/panchang/types";
import { cn } from "@/lib/utils";

interface CitySearchProps {
  value: GeoLocation | null;
  onChange: (city: GeoLocation) => void;
  compact?: boolean;
}

export function CitySearch({ value, onChange, compact }: CitySearchProps) {
  const [query, setQuery] = useState(value ? placeLabel(value) : "");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchCities(query), [query]);

  return (
    <div className="relative min-w-0">
      {compact ? (
        <label className="mb-1 block text-xs font-medium text-zinc-600" htmlFor="city-search">
          Place of passing
        </label>
      ) : null}
      <MapPin
        className={cn(
          "pointer-events-none absolute left-2.5 h-4 w-4 text-zinc-400",
          compact ? "top-[2.05rem]" : "top-3",
        )}
      />
      <Input
        id="city-search"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="Place of passing"
        placeholder="Guwahati, Nigeria, Kathmandu"
        className={cn("pl-9", compact && "h-10 pr-2 text-base")}
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
          className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md border border-line bg-white py-1 shadow-md"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">No matching place.</li>
          )}
          {results.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                role="option"
                aria-selected={value?.id === city.id}
                className={cn(
                  "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-zinc-50",
                  value?.id === city.id && "bg-accent-soft",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(city);
                  setQuery(placeLabel(city));
                  setOpen(false);
                }}
              >
                <span className="font-medium text-ink">{city.city}</span>
                <span className="text-xs text-zinc-500">
                  {city.city === city.country ? city.region : `${city.region}, ${city.country}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
