import type { ReactElement, ReactNode } from "react";
import { Button } from "@/marketing/components/ui/button";
import { cn } from "@/marketing/lib/utils";

export type PageCtaAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

/** Gradient clipped text for CTA titles and marketing headings (aligned with static HTML references). */
export const CAMS_GRADIENT_ACCENT_TEXT_CLASS =
  "bg-gradient-to-br from-cams-primary to-cams-secondary bg-clip-text text-transparent";

type PageCtaSectionProps = {
  heading: ReactNode;
  description: string;
  actions: readonly PageCtaAction[];
  className?: string;
};

export function PageCtaSection({
  heading,
  description,
  actions,
  className
}: PageCtaSectionProps): ReactElement {
  const actionCount = actions.length;

  const actionsLayoutClass = cn(
    "grid gap-3",
    actionCount === 1 && "grid-cols-1",
    actionCount === 2 &&
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
    actionCount >= 3 &&
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
  );

  return (
    <section
      className={cn(
        "cams-cta-top-diagonal-clip relative z-0 isolate left-1/2 mt-12 w-screen max-w-none -translate-x-1/2 overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 md:mt-20 md:px-10 md:pb-24 md:pt-28",
        className
      )}
    >
      <div className="absolute inset-0 bg-cams-dark" aria-hidden />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-cams-primary/25 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[380px] w-[65%] rounded-full bg-cams-secondary/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[1600px]">
        <div className="rounded-[2rem] border border-white/15 bg-white/[0.04] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-12 lg:p-14">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cams-secondary/95">
                Take the next step
              </p>
              <h2 className="mt-5 text-left font-heading text-3xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
                {heading}
              </h2>
            </div>
            <div className="flex flex-col gap-6 border-t border-white/10 pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="text-left text-base leading-relaxed text-slate-200/95 md:text-lg">
                {description}
              </p>
              <div className={actionsLayoutClass}>
                {actions.map((action, index) => (
                  <Button
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    variant={
                      action.variant === "secondary" ? "ctaSecondary" : "ctaPrimary"
                    }
                    className={cn(
                      "min-h-[52px] w-full justify-center px-6 text-sm font-semibold sm:px-8",
                      actionCount >= 3 &&
                        index === 2 &&
                        "sm:col-span-2 sm:max-w-md sm:justify-self-center lg:col-span-1 lg:max-w-none lg:justify-self-stretch xl:col-span-2 xl:max-w-lg xl:justify-self-center 2xl:col-span-1 2xl:max-w-none 2xl:justify-self-stretch"
                    )}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
