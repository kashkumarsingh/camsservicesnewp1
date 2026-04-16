"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  isNavMegaItem,
  NAV_ITEMS,
  type NavItem,
  type NavMegaItem,
} from "@/mock/navigation";

function MegaPanel({ item }: { item: NavMegaItem }): ReactElement {
  return (
    <div
      id="site-mega-services"
      className="absolute left-1/2 top-full z-50 mt-3 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl md:left-0 md:translate-x-0"
    >
      <div className="grid gap-8 md:grid-cols-2">
        {item.columns.map((column) => (
          <div key={column.heading}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cams-primary">{column.heading}</p>
            <ul className="mt-4 space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group block rounded-xl px-2 py-2.5 transition hover:bg-cams-soft">
                    <span className="block text-sm font-semibold text-cams-ink group-hover:text-cams-primary">
                      {link.label}
                    </span>
                    {link.description ? (
                      <span className="mt-0.5 block text-xs leading-snug text-cams-ink-tertiary">
                        {link.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-slate-100 pt-4">
        <Link href={item.href} className="text-sm font-semibold text-cams-primary hover:underline hover:underline-offset-4">
          View full services page →
        </Link>
      </div>
    </div>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ item, pathname }: { item: NavItem; pathname: string }): ReactElement {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rowRef.current || !(event.target instanceof Node)) return;
      if (!rowRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      if (leaveTimer.current !== null) clearTimeout(leaveTimer.current);
    };
  }, [open]);

  if (!isNavMegaItem(item)) {
    const active = isActivePath(pathname, item.href);
    return (
      <li>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={`relative text-sm font-semibold transition after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-cams-primary after:to-cams-secondary after:transition-all ${
            active
              ? "text-cams-primary after:w-full"
              : "text-cams-ink after:w-0 hover:text-cams-primary hover:after:w-full"
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  const active = isActivePath(pathname, item.href);
  const panelId = `site-mega-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
  const clearLeaveTimer = () => {
    if (leaveTimer.current !== null) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };
  const scheduleClose = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <li
      ref={rowRef}
      className="relative"
      onMouseEnter={() => {
        clearLeaveTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <div className="flex items-center gap-1">
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={`relative text-sm font-semibold transition after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-cams-primary after:to-cams-secondary after:transition-all ${
            active
              ? "text-cams-primary after:w-full"
              : "text-cams-ink after:w-0 hover:text-cams-primary hover:after:w-full"
          }`}
        >
          {item.label}
        </Link>
        <button
          type="button"
          className="rounded-md p-1 text-cams-ink transition hover:bg-cams-soft hover:text-cams-primary"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${item.label} submenu`}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            if (!e.currentTarget.parentElement?.parentElement?.contains(e.relatedTarget)) {
              setOpen(false);
            }
          }}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="block text-xs">▾</span>
        </button>
      </div>
      {open ? (
        <div id={panelId}>
          <MegaPanel item={item} />
        </div>
      ) : null}
    </li>
  );
}

type SiteHeaderNavProps = {
  navItems?: readonly NavItem[];
};

export function SiteHeaderNav({ navItems = NAV_ITEMS }: SiteHeaderNavProps): ReactElement {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedKey, setMobileExpandedKey] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileExpandedKey(null);
  };

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    const onMouseDown = (event: MouseEvent) => {
      if (!mobileMenuRef.current) return;
      if (!mobileMenuRef.current.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <ul className="hidden items-center gap-8 lg:flex">
        {navItems.map((item) => (
          <NavRow
            key={isNavMegaItem(item) ? `${item.kind}-${item.label}` : `${item.kind}-${item.href}`}
            item={item}
            pathname={pathname}
          />
        ))}
      </ul>

      <div ref={mobileMenuRef} className="lg:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-cams-ink transition hover:bg-cams-soft"
          aria-expanded={mobileOpen}
          aria-controls="site-mobile-nav"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span aria-hidden className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-5 origin-center rounded bg-current transition duration-300 ${
                mobileOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-0.5 w-5 rounded bg-current transition duration-300 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] block h-0.5 w-5 origin-center rounded bg-current transition duration-300 ${
                mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        <button
          type="button"
          aria-label="Close mobile menu backdrop"
          className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-200 ${
            mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeMobileMenu}
        />
        <div
          id="site-mobile-nav"
          className={`absolute left-0 right-0 top-[70px] z-50 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-xl backdrop-blur-xl transition duration-200 ${
            mobileOpen ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <ul className="space-y-2">
            {navItems.map((item) => {
              if (!isNavMegaItem(item)) {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={`${item.kind}-${item.href}`}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md px-2 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-cams-soft text-cams-primary"
                          : "text-cams-ink hover:bg-cams-soft hover:text-cams-primary"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={`${item.kind}-${item.label}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={item.href}
                      aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                      className={`block rounded-md px-2 py-2 text-sm font-semibold transition ${
                        isActivePath(pathname, item.href)
                          ? "bg-cams-soft text-cams-primary"
                          : "text-cams-ink hover:bg-cams-soft hover:text-cams-primary"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="rounded-md px-2 py-2 text-sm font-semibold text-cams-ink transition hover:bg-cams-soft hover:text-cams-primary"
                      aria-expanded={mobileExpandedKey === item.label}
                      aria-label={`${item.label} submenu`}
                      onClick={() => setMobileExpandedKey((current) => (current === item.label ? null : item.label))}
                    >
                      {mobileExpandedKey === item.label ? "−" : "+"}
                    </button>
                  </div>
                  {mobileExpandedKey === item.label ? (
                    <ul className="ml-3 mt-1 space-y-1 border-l border-slate-200 pl-3">
                      {item.columns.flatMap((column) =>
                        column.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                              className={`block rounded-md px-2 py-1.5 text-sm transition ${
                                isActivePath(pathname, link.href)
                                  ? "bg-cams-soft text-cams-primary"
                                  : "text-cams-ink-tertiary hover:bg-cams-soft hover:text-cams-primary"
                              }`}
                              onClick={closeMobileMenu}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
