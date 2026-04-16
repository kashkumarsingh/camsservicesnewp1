import type { ReactElement } from "react";
import { CircleArrowRight } from "lucide-react";
import { cn } from "@/marketing/lib/utils";

export function PackageBestForCallout({
  children,
  variant = "packages"
}: {
  children: string;
  variant?: "packages" | "home";
}): ReactElement {
  return (
    <div
      className={cn(
        "mt-6 flex gap-2.5 text-sm font-medium leading-snug md:text-base",
        variant === "packages" && "text-cams-dark",
        variant === "home" && "text-cams-ink"
      )}
    >
      <CircleArrowRight
        className="mt-0.5 shrink-0 text-cams-primary"
        size={22}
        strokeWidth={2}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}
