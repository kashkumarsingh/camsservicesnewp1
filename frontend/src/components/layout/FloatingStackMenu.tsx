"use client";

import Link from "next/link";
import type { ReactElement } from "react";

export type FloatingStackAction = {
  id: string;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  icon: ReactElement;
  className?: string;
};

type FloatingStackMenuProps = {
  actions: readonly FloatingStackAction[];
  onAction?: () => void;
};

const baseActionClass =
  "inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-slate-200/90 py-2.5 pl-3 pr-4 text-sm font-semibold shadow-lg transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cams-primary/50";

export function FloatingStackMenu({ actions, onAction }: FloatingStackMenuProps): ReactElement {
  return (
    <div className="mb-1 flex flex-col items-end gap-2">
      {actions.map((action) => {
        const className = `${baseActionClass} ${action.className ?? "bg-white text-cams-ink"}`;

        if (action.href) {
          const isExternal =
            action.external || action.href.startsWith("http") || action.href.startsWith("tel:");

          if (isExternal) {
            return (
              <a
                key={action.id}
                href={action.href}
                target={action.href.startsWith("http") ? "_blank" : undefined}
                rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={className}
                onClick={onAction}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5">
                  {action.icon}
                </span>
                {action.label}
              </a>
            );
          }

          return (
            <Link key={action.id} href={action.href} className={className} onClick={onAction}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5">
                {action.icon}
              </span>
              {action.label}
            </Link>
          );
        }

        return (
          <button
            key={action.id}
            type="button"
            className={className}
            onClick={() => {
              action.onClick?.();
              onAction?.();
            }}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5">
              {action.icon}
            </span>
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
