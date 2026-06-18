import type { ReactElement, ReactNode } from "react";
import { cn } from "@/marketing/lib/utils";

type MarketingSectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  id?: string;
  className?: string;
  align?: "left" | "center";
};

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  id,
  className,
  align = "left",
}: MarketingSectionHeaderProps): ReactElement {
  const centered = align === "center";

  return (
    <header className={cn(centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      <div className={cn("flex items-center gap-4", centered && "justify-center")}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary md:tracking-[0.24em]">
          {eyebrow}
        </p>
        {!centered ? (
          <span
            className="h-px min-w-[3rem] flex-1 bg-gradient-to-r from-cams-primary/35 to-transparent md:min-w-[5rem]"
            aria-hidden
          />
        ) : null}
      </div>
      <h2
        id={id}
        className="mt-4 font-heading text-3xl font-bold leading-[1.08] tracking-tight text-cams-ink md:text-4xl lg:text-5xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-cams-ink-secondary md:text-lg">{description}</p>
      ) : null}
    </header>
  );
}
