"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, UserCircle2, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Popover } from "@/components/popovers/Popover";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Tables", href: "/dashboard/tables" },
  { label: "Forms", href: "/dashboard/forms" },
  { label: "Modals & toasts", href: "/dashboard/modals" },
  { label: "Popovers", href: "/dashboard/popovers" },
  { label: "Calendar", href: "/dashboard/calendar" },
  { label: "Cards & states", href: "/dashboard/cards" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const navItems = NAV_ITEMS;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const headerBg = darkMode
    ? "bg-slate-900/95 border-slate-700/50 backdrop-blur"
    : "bg-white border-slate-200/80 backdrop-blur-sm";
  const headerText = darkMode ? "text-slate-100" : "text-slate-900";
  const headerMuted = darkMode ? "text-slate-400" : "text-slate-500";
  const headerHover = darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100";
  const headerIconBtn =
    darkMode
      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";
  const searchBar =
    darkMode
      ? "bg-slate-800/80 border-slate-600 text-slate-200 placeholder:text-slate-500"
      : "bg-slate-100/80 border-slate-200 text-slate-900 placeholder:text-slate-500";
  const sidebarBg = darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const sidebarText = darkMode ? "text-slate-300" : "text-slate-700";
  const sidebarLabel = darkMode ? "text-slate-500" : "text-slate-400";
  const sidebarActive = darkMode ? "bg-brand-500/20 text-brand-300" : "bg-brand-50 text-brand-700";
  const sidebarLinkHover = darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100";
  const mainBg = darkMode ? "bg-slate-950" : "bg-slate-50";
  const mainText = darkMode ? "text-slate-100" : "text-slate-900";

  return (
    <div className={`min-h-screen ${mainBg} ${mainText} ${darkMode ? "dark" : ""}`}>
      {/* Header – single bar, minimal chrome */}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b ${headerBg} ${headerText}`}
      >
        <div className="flex h-12 w-full items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${headerIconBtn} md:hidden`}
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 rounded-lg py-1 pr-2"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-ui font-semibold text-white">
                UD
              </span>
              <span className="hidden truncate text-ui font-semibold md:inline">
                Universal Dashboard
              </span>
            </Link>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <div
              className={`flex max-w-md flex-1 items-center gap-2 rounded-lg border px-3 py-2 ${searchBar}`}
            >
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="search"
                placeholder="Search…"
                className="min-w-0 flex-1 bg-transparent text-ui outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${headerIconBtn}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Popover
              contentClassName={darkMode ? "!border-slate-600 !bg-slate-800 !text-slate-200" : undefined}
              trigger={
                <button
                  type="button"
                  className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg ${headerIconBtn}`}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-micro font-medium text-white">
                    3
                  </span>
                </button>
              }
              content={
                <div className="space-y-2">
                  <div className={`text-caption font-semibold ${darkMode ? "text-slate-200" : "text-slate-900"}`}>
                    Notifications
                  </div>
                  <ul className={`space-y-1 text-caption ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    <li>New booking confirmed</li>
                    <li>Session reminder for tomorrow</li>
                    <li>Progress report available</li>
                  </ul>
                </div>
              }
              placement="bottom"
            />
            <Popover
              contentClassName={darkMode ? "!border-slate-600 !bg-slate-800 !text-slate-200" : undefined}
              trigger={
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${headerHover}`}
                >
                  <UserCircle2 className={`h-5 w-5 shrink-0 ${headerMuted}`} />
                  <span className="hidden max-w-[120px] truncate text-ui md:inline">
                    {user ? user.name : "Signed-in user"}
                  </span>
                </button>
              }
              content={
                <div className={`space-y-2 text-caption ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <div className="font-semibold">{user ? user.name : "Guest"}</div>
                  <div className={headerMuted}>{user ? user.role : "Not signed in"}</div>
                  <button
                    type="button"
                    className="w-full rounded-lg bg-brand-600 px-3 py-2 text-left text-caption font-medium text-white hover:bg-brand-500"
                  >
                    View profile
                  </button>
                </div>
              }
              placement="bottom"
            />
          </div>
        </div>
      </header>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar + main */}
      <div className="flex pt-12">
        <aside
          className={`fixed inset-y-12 left-0 z-30 w-56 transform border-r ${sidebarBg} transition-[width,transform] duration-200 ease-out md:static md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } ${sidebarCollapsed ? "md:w-16" : "md:w-56"}`}
        >
          <nav
            className="flex h-full flex-col overflow-y-auto px-2 py-4 text-body"
            aria-label="Component showcase"
          >
            <div className="mb-2 flex items-center justify-between gap-1 px-2">
              <span className={`text-micro font-semibold uppercase tracking-wider ${sidebarCollapsed ? "hidden" : sidebarLabel}`}>
                Components
              </span>
              <button
                type="button"
                className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-caption md:inline-flex ${darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setSidebarCollapsed((prev) => !prev)}
              >
                {sidebarCollapsed ? "»" : "«"}
              </button>
            </div>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 md:justify-start ${active ? sidebarActive : sidebarLinkHover}`}
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-micro font-medium ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                        {item.label.charAt(0)}
                      </span>
                      <span className={`truncate ${sidebarCollapsed ? "hidden md:hidden" : ""} ${sidebarText}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="w-full px-4 py-6 md:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
