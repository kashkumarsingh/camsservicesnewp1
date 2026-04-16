import type { ReactElement, ReactNode } from "react";
import { cn } from "@/marketing/lib/utils";

type PageShellProps = {
  children: ReactNode;
  maxWidthClassName?: string;
  className?: string;
};

export function PageShell({
  children,
  maxWidthClassName = "max-w-6xl",
  className
}: PageShellProps): ReactElement {
  return (
    <section
      className={cn(
        "mx-auto flex w-full flex-col gap-8 px-4",
        maxWidthClassName,
        className
      )}
    >
      {children}
    </section>
  );
}
