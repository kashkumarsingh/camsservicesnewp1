"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { cn } from "@/marketing/lib/utils";
import { PACKAGES_PAGE_INITIAL_FEATURE_COUNT } from "@/marketing/mock/intervention-packages";

export function PackageFeaturesCollapsible({
  features,
  variant = "packages"
}: {
  features: readonly string[];
  variant?: "packages" | "home";
}): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const limit = PACKAGES_PAGE_INITIAL_FEATURE_COUNT;
  const hiddenCount = features.length - limit;
  const needsToggle = hiddenCount > 0;
  const lines = expanded || !needsToggle ? features : features.slice(0, limit);

  return (
    <div
      className={cn(
        "mt-6",
        variant === "packages" && "grow",
        variant === "home" && "flex-1"
      )}
    >
      <ul
        className={cn(
          "space-y-2.5 text-sm leading-snug md:text-[0.9375rem]",
          variant === "packages" && "text-cams-slate",
          variant === "home" && "text-cams-ink-secondary"
        )}
      >
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 shrink-0 font-bold",
                variant === "packages" && "text-cams-secondary",
                variant === "home" && "text-cams-primary"
              )}
              aria-hidden
            >
              •
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {needsToggle ? (
        <button
          type="button"
          className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-cams-primary underline-offset-2 transition hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-cams-primary/30"
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
        </button>
      ) : null}
    </div>
  );
}
