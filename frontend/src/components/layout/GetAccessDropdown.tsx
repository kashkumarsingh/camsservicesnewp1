"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/shared/utils/routes";

type GetAccessDropdownProps = {
  onNavigate?: () => void;
};

export function GetAccessDropdown({ onNavigate }: GetAccessDropdownProps): ReactElement {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  const menuLinkClass =
    "block rounded-lg px-3 py-2 text-sm font-semibold text-cams-ink transition hover:bg-cams-soft hover:text-cams-primary";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex min-h-10 items-center justify-center gap-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-ink transition hover:bg-cams-soft hover:text-cams-primary"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="get-access-desktop-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Get Access
        <span aria-hidden className="text-xs">
          ▾
        </span>
      </button>
      {open ? (
        <div
          id="get-access-desktop-menu"
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[10.5rem] rounded-xl border border-slate-200/90 bg-white p-1 shadow-lg shadow-slate-900/10"
        >
          <Link href={ROUTES.LOGIN} role="menuitem" className={menuLinkClass} onClick={close}>
            Sign in
          </Link>
          <Link href={ROUTES.REGISTER} role="menuitem" className={menuLinkClass} onClick={close}>
            Register
          </Link>
        </div>
      ) : null}
    </div>
  );
}
