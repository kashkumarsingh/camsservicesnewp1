import type { ReactElement } from "react";
import Link from "next/link";
import { CamsIcon, type CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { PAGE_SURFACES } from "@/marketing/components/shared/page-layout";
import { cn } from "@/marketing/lib/utils";

type MarketingBulletGridProps = {
  items: readonly string[];
  icon?: CamsIconName;
  href?: string;
  columnsClassName?: string;
  className?: string;
};

export function MarketingBulletGrid({
  items,
  icon,
  href,
  columnsClassName = "sm:grid-cols-2 lg:grid-cols-3",
  className,
}: MarketingBulletGridProps): ReactElement {
  return (
    <ul className={cn("grid gap-3", columnsClassName, className)} aria-label={href ? "Service links" : undefined}>
      {items.map((item) => {
        const content = (
          <>
            {icon ? (
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 sm:size-10">
                <CamsIcon name={icon} surface="muted" size={18} />
              </span>
            ) : (
              <span className="mt-2 size-2 shrink-0 rounded-full bg-cams-primary" aria-hidden />
            )}
            <span className="min-w-0 flex-1 text-sm font-semibold leading-relaxed text-cams-ink">{item}</span>
            {href ? (
              <span className="hidden shrink-0 text-cams-primary transition group-hover:translate-x-0.5 sm:inline" aria-hidden>
                →
              </span>
            ) : null}
          </>
        );

        if (href) {
          return (
            <li key={item} className="min-h-0">
              <Link
                href={href}
                className={cn(
                  PAGE_SURFACES.cardHoverLiftPrimary,
                  "group flex h-full min-h-[4.5rem] items-center gap-3 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cams-primary"
                )}
              >
                {content}
              </Link>
            </li>
          );
        }

        return (
          <li key={item} className={cn(PAGE_SURFACES.cardHoverLiftPrimary, "flex items-start gap-3 p-4")}>
            {content}
          </li>
        );
      })}
    </ul>
  );
}
