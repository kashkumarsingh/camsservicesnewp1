import type { ReactElement } from "react";
import { cn } from "@/marketing/lib/utils";

/** Floating label matching /packages (Most Popular, Best for Complex Needs). */
export function PackageTierHighlightBadge({
  label,
  style
}: {
  label: string;
  style: "gradient" | "outline";
}): ReactElement {
  return (
    <div
      className={cn(
        "absolute -top-3 left-8 z-10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide",
        style === "gradient" &&
          "bg-gradient-to-br from-cams-primary to-cams-secondary text-white shadow-sm",
        style === "outline" &&
          "border-2 border-cams-secondary bg-white text-cams-secondary"
      )}
    >
      {label}
    </div>
  );
}
