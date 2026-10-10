import { cn } from "@/lib/utils";

export function DualDate({
  gregorian,
  nepali,
  gregorianClassName,
  nepaliClassName,
}: {
  gregorian: string;
  nepali?: string;
  gregorianClassName?: string;
  nepaliClassName?: string;
}) {
  return (
    <div>
      <p className={cn("text-slate-900", gregorianClassName)}>{gregorian}</p>
      {nepali ? (
        <p className={cn("mt-1 text-sm text-slate-600", nepaliClassName)}>{nepali}</p>
      ) : null}
    </div>
  );
}
