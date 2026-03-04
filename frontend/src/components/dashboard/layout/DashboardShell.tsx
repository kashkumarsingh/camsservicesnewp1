"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  UserCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  CalendarCheck,
  UserCheck,
  Activity,
  Briefcase,
  Package,
  FileText,
  BarChart2,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
} from "lucide-react";
import type { IconComponent } from "@/types/icons";
import { useAuth } from "@/interfaces/web/hooks/auth/useAuth";
import {
  useDashboardNotifications,
  type DashboardNotification,
  type NotificationCategory,
} from "@/interfaces/web/hooks/dashboard/useDashboardNotifications";
import { useLiveRefresh, useLiveRefreshContext } from "@/core/liveRefresh/LiveRefreshContext";
import { LIVE_REFRESH_ENABLED } from "@/utils/liveRefreshConstants";
import { getDashboardRoute, canAccessRoute } from "@/utils/navigation";
import { ROUTES } from "@/utils/routes";
import type { User } from "@/core/application/auth/types";
import { ThemeToggle } from "@/components/theme";
import ToastContainer from "@/components/ui/Toast/ToastContainer";
import { BaseSonner, showNotificationToast } from "@/components/ui/Sonner";
import { DashboardSkeleton, ListRowsSkeleton } from "@/components/ui/Skeleton";
import { getDashboardSkeletonVariantFromPath } from "@/utils/skeletonManager";
import { SKELETON_COUNTS } from "@/utils/skeletonConstants";
import { DASHBOARD_BASE_FONT_SIZE } from "@/utils/appConstants";
import { toastManager, type Toast } from "@/utils/toast";
import ParentSettingsModal from "@/components/dashboard/modals/ParentSettingsModal";

type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
  /** Optional tooltip explaining what this page is for (e.g. for trainer nav). */
  description?: string;
};

type RoleSection = {
  role: "parent" | "trainer" | "admin" | "editor";
  label: string;
  baseHref: string;
  items: NavItem[];
};

const ROLE_SECTIONS: RoleSection[] = [
  {
    role: "parent",
    label: "Parent",
    baseHref: "/dashboard/parent",
    items: [
      { label: "Overview", href: "/dashboard/parent", icon: LayoutDashboard },
      { label: "Booked hours and packages", href: "/dashboard/parent/bookings", icon: Calendar },
      { label: "My Children", href: "/dashboard/parent/children", icon: Users },
      { label: "Progress", href: "/dashboard/parent/progress", icon: TrendingUp },
    ],
  },
  {
    role: "trainer",
    label: "Trainer",
    baseHref: "/dashboard/trainer",
    items: [
      { label: "Overview", href: "/dashboard/trainer", icon: LayoutDashboard, description: "Your calendar, assigned sessions, availability and quick actions" },
    ],
  },
  {
    role: "admin",
    label: "Admin",
    baseHref: "/dashboard/admin",
    items: [
      { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
      { label: "Users", href: "/dashboard/admin/users", icon: Users },
      { label: "Parents", href: "/dashboard/admin/parents", icon: Users },
      { label: "Children", href: "/dashboard/admin/children", icon: Users },
      { label: "Trainers", href: "/dashboard/admin/trainers", icon: UserCheck },
      { label: "Activities", href: "/dashboard/admin/activities", icon: Activity },
      { label: "Services", href: "/dashboard/admin/services", icon: Briefcase },
      { label: "Packages", href: "/dashboard/admin/packages", icon: Package },
      { label: "Public pages", href: "/dashboard/admin/public-pages", icon: FileText },
      { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart2 },
      { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
    ],
  },
  {
    role: "editor",
    label: "Editor",
    baseHref: "/dashboard/editor",
    items: [
      { label: "Overview", href: "/dashboard/editor", icon: LayoutDashboard },
      { label: "Public pages", href: "/dashboard/editor/public-pages", icon: FileText },
    ],
  },
];

const SIDEBAR_COLLAPSED_KEY = "dashboard-sidebar-collapsed";

function groupNotificationsByCategory(
  notifications: DashboardNotification[]
): Map<string, DashboardNotification[]> {
  const byCategory = new Map<string, DashboardNotification[]>();
  for (const n of notifications) {
    const label = n.categoryLabel;
    if (!byCategory.has(label)) byCategory.set(label, []);
    byCategory.get(label)!.push(n);
  }
  // Sort items within each category by newest first
  byCategory.forEach((items) => {
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
  return byCategory;
}

/** Category with the single most recent notification appears first; items within each category are already newest-first. */
function orderedCategoryEntries(
  grouped: Map<string, DashboardNotification[]>
): [string, DashboardNotification[]][] {
  const entries = Array.from(grouped.entries());
  entries.sort(([, aItems], [, bItems]) => {
    const aLatest = aItems[0]?.createdAt ?? "";
    const bLatest = bItems[0]?.createdAt ?? "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });
  return entries;
}

/** Category label of the single most recent notification (for default expanded section). */
function latestNotificationCategoryLabel(
  notifications: DashboardNotification[]
): string | null {
  if (notifications.length === 0) return null;
  const latest = notifications.reduce((a, b) =>
    new Date(a.createdAt) >= new Date(b.createdAt) ? a : b
  );
  return latest.categoryLabel;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

/** Role that maps to a sidebar section (admin + super_admin both use "admin" section). */
function getSectionRole(user: User | null): "parent" | "trainer" | "admin" | "editor" | null {
  if (!user) return null;
  if (user.role === "trainer") return "trainer";
  if (user.role === "editor") return "editor";
  if (user.role === "admin" || user.role === "super_admin") return "admin";
  return "parent";
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [parentSettingsOpen, setParentSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  /** Only one notification category expanded at a time; default is the category of the latest notification. */
  const [expandedNotificationCategory, setExpandedNotificationCategory] =
    useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentTab = pathname === "/dashboard/parent" ? searchParams.get("tab") : null;
  /** Trainer mobile tab from URL: schedule (default) or more */
  const trainerMobileTab =
    pathname === "/dashboard/trainer" && !pathname.startsWith("/dashboard/trainer/")
      ? (searchParams.get("tab") === "more" ? "more" : "schedule")
      : null;

  /** Parent mobile top bar title: reflects current page (Overview / Children / Booked hours and packages / Progress). */
  const parentMobileTitle = pathname.startsWith("/dashboard/parent")
    ? pathname.startsWith("/dashboard/parent/children")
      ? "Children"
      : pathname.startsWith("/dashboard/parent/bookings")
        ? "Booked hours and packages"
        : pathname.startsWith("/dashboard/parent/progress")
          ? "Progress"
          : pathname === "/dashboard/parent" && parentTab === "hours"
            ? "Hours"
            : "Overview"
    : "";

  /** Trainer mobile top bar title: reflects current page (Overview / Schedule / Settings). */
  const trainerMobileTitle = pathname.startsWith("/dashboard/trainer")
    ? pathname.startsWith("/dashboard/trainer/schedule")
      ? "Schedule"
      : pathname.startsWith("/dashboard/trainer/settings")
        ? "Settings"
        : "Overview"
    : "";

  /** Admin mobile top bar title: reflects current section for context. */
  const adminMobileTitle = pathname.startsWith("/dashboard/admin")
    ? pathname === "/dashboard/admin"
      ? "Overview"
      : pathname.startsWith("/dashboard/admin/bookings")
        ? "Bookings"
        : pathname.startsWith("/dashboard/admin/users")
          ? "Users"
          : pathname.startsWith("/dashboard/admin/parents")
            ? "Parents"
            : pathname.startsWith("/dashboard/admin/children")
              ? "Children"
              : pathname.startsWith("/dashboard/admin/trainers")
                ? "Trainers"
                : pathname.startsWith("/dashboard/admin/activities")
                  ? "Activities"
                  : pathname.startsWith("/dashboard/admin/services")
                    ? "Services"
                    : pathname.startsWith("/dashboard/admin/packages")
                      ? "Packages"
                      : pathname.startsWith("/dashboard/admin/public-pages")
                        ? "Public pages"
                        : pathname.startsWith("/dashboard/admin/reports")
                          ? "Reports"
                          : pathname.startsWith("/dashboard/admin/settings")
                            ? "Settings"
                            : pathname.startsWith("/dashboard/admin/trainer-applications")
                              ? "Trainer applications"
                              : pathname.startsWith("/dashboard/admin/absence-requests")
                                ? "Absence requests"
                                : "Admin"
    : "";

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    refetch: refetchNotifications,
    markRead,
    markAllRead,
  } = useDashboardNotifications();

  // Centralised live refresh: refetch notifications when backend reports changes
  useLiveRefresh(
    "notifications",
    useCallback(() => refetchNotifications(true), [refetchNotifications]),
    { enabled: LIVE_REFRESH_ENABLED }
  );

  const liveRefreshContext = useLiveRefreshContext();
  const [refreshAllBusy, setRefreshAllBusy] = useState(false);
  const handleRefreshAll = useCallback(() => {
    if (!liveRefreshContext?.refreshAll || refreshAllBusy) return;
    setRefreshAllBusy(true);
    liveRefreshContext.refreshAll();
    toastManager.success("Dashboard refreshed.");
    setTimeout(() => setRefreshAllBusy(false), 1500);
  }, [liveRefreshContext, refreshAllBusy]);

  // Dashboard: slightly larger base font size for readability (all rem-based typography scales up).
  useEffect(() => {
    document.documentElement.style.fontSize = DASHBOARD_BASE_FONT_SIZE;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  // Restore collapsed preference from localStorage (client-only to avoid hydration mismatch).
  // Until hydrated we show sidebar narrow (lg:w-16) so it never "widens then shrinks" for users who had it collapsed.
  const [sidebarHydrated, setSidebarHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored !== null) setSidebarCollapsed(JSON.parse(stored));
    } catch {
      // ignore
    }
    setSidebarHydrated(true);
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setSidebarCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, []);
  const { user, loading, loadError, unauthenticatedReason, refresh, logout } = useAuth();
  const sectionRole = getSectionRole(user);
  const isServerLoadError = loadError != null && (loadError.status >= 500 || loadError.status === 0);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return unsubscribe;
  }, []);

  // Close notifications dropdown when clicking outside (overlay can be clipped by header backdrop-blur)
  useEffect(() => {
    if (!notificationsOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [notificationsOpen]);

  // When panel opens or notifications change, expand only the category of the latest notification
  useEffect(() => {
    if (notificationsOpen && notifications.length > 0) {
      setExpandedNotificationCategory(latestNotificationCategoryLabel(notifications));
    }
  }, [notificationsOpen, notifications]);

  // Sonner notification toast: when unread count increases (e.g. after live refresh), show one toast for the newest unread with intelligent link
  const prevUnreadCountRef = useRef<number>(0);
  const hasNotificationsInitiallyLoadedRef = useRef(false);
  useEffect(() => {
    if (notificationsLoading) return;
    if (!hasNotificationsInitiallyLoadedRef.current) {
      hasNotificationsInitiallyLoadedRef.current = true;
      prevUnreadCountRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevUnreadCountRef.current) {
      const newestUnread = notifications.find((n) => !n.readAt);
      if (newestUnread) {
        showNotificationToast(
          { title: newestUnread.title, message: newestUnread.message, link: newestUnread.link },
          { navigate: (path) => router.push(path) }
        );
      }
      prevUnreadCountRef.current = unreadCount;
    } else {
      prevUnreadCountRef.current = unreadCount;
    }
  }, [notificationsLoading, unreadCount, notifications, router]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Redirect unauthenticated users to login (preserve intended destination)
  // Do not redirect when we have a 5xx/network error — show Retry instead
  // Short delay avoids redirecting before token/auth has had a chance to run (hydration / Strict Mode)
  useEffect(() => {
    if (loading) return;
    if (!user && isServerLoadError) return; // Show error UI with Retry
    if (!user) {
      const redirect = encodeURIComponent(pathname);
      if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
        const reason =
          unauthenticatedReason === "no_token"
            ? "no auth token in localStorage (log in first)"
            : unauthenticatedReason === "unauthorized"
              ? "session expired or invalid token (getCurrentUser returned 401/403)"
              : "no user";
        console.warn(
          `[Dashboard] Redirecting to login for ${pathname}: ${reason}. After login you will return here.`
        );
      }
      const timeoutId = setTimeout(() => {
        router.replace(`${ROUTES.LOGIN}?redirect=${redirect}`);
      }, 80);
      return () => clearTimeout(timeoutId);
    }
    // If on role-picker page, redirect to role-specific dashboard
    if (pathname === "/dashboard") {
      router.replace(getDashboardRoute(user));
      return;
    }
    // If user cannot access this route (e.g. parent on /dashboard/admin), redirect to their dashboard
    if (!canAccessRoute(user, pathname)) {
      router.replace(getDashboardRoute(user));
    }
  }, [loading, user, isServerLoadError, unauthenticatedReason, pathname, router]);

  const isActive = (href: string) => {
    if (href === "/dashboard/parent" || href === "/dashboard/trainer" || href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Show loading while checking auth (avoids flash of login redirect)
  if (loading || !user) {
    // Server/network error loading user: show Retry so dashboard doesn't redirect to login
    if (!loading && !user && isServerLoadError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Something went wrong loading your account. Please try again.
            </p>
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return (
      <DashboardSkeleton variant={getDashboardSkeletonVariantFromPath(pathname)} />
    );
  }

  // Sidebar: only show the section for the current user's role
  const visibleSections = sectionRole
    ? ROLE_SECTIONS.filter((s) => s.role === sectionRole)
    : ROLE_SECTIONS;

  // Before we've read localStorage, show collapsed UI so sidebar never "widens then shrinks"
  const sidebarEffectivelyCollapsed = !sidebarHydrated || sidebarCollapsed;

  /** Shared container so header and main content align – fluid width, same horizontal padding. */
  const contentContainerClass = "w-full px-4 sm:px-6 lg:px-8";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top bar – fixed so it stays visible on scroll; spacer below keeps content from sliding under header */}
      <header className="fixed top-0 left-0 right-0 z-header isolate flex h-16 min-h-[4rem] flex-shrink-0 items-center border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-card transition-shadow duration-dashboard">
        <div className={`${contentContainerClass} h-full`}>
          <div className="flex h-full w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {sectionRole !== "parent" && (
            <button
              type="button"
              className="shrink-0 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-dashboard p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 lg:min-h-0 lg:min-w-0 lg:p-1.5 lg:hidden transition-colors duration-dashboard"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            )}
            {/* Parent/Trainer/Admin mobile: center shows current page title */}
            {sectionRole === "parent" ? (
              <span className="md:hidden flex-1 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {parentMobileTitle}
              </span>
            ) : sectionRole === "trainer" ? (
              <span className="md:hidden flex-1 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {trainerMobileTitle}
              </span>
            ) : sectionRole === "admin" ? (
              <span className="lg:hidden flex-1 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {adminMobileTitle}
              </span>
            ) : null}
            {!(sectionRole === "parent" || sectionRole === "trainer") ? (
            <Link
              href={sectionRole ? ROLE_SECTIONS.find((s) => s.role === sectionRole)?.baseHref ?? "/dashboard" : "/dashboard"}
              className="flex items-center min-w-0 rounded-lg py-0.5 -ml-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Dashboard home"
            >
              <div className="relative h-7 w-[7rem] sm:w-24 shrink-0 flex items-center">
                <Image
                  src="/logos/cams-services-logo.webp"
                  alt="CAMS Services"
                  fill
                  sizes="112px"
                  style={{ objectFit: "contain", objectPosition: "left center" }}
                  priority
                />
              </div>
            </Link>
            ) : (
              <Link
                href={sectionRole === "trainer" ? "/dashboard/trainer" : "/dashboard/parent"}
                className="hidden md:flex items-center min-w-0 rounded-lg py-0.5 -ml-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                aria-label="Dashboard home"
              >
                <div className="relative h-7 w-[7rem] sm:w-24 shrink-0 flex items-center">
                  <Image
                    src="/logos/cams-services-logo.webp"
                    alt="CAMS Services"
                    fill
                    sizes="112px"
                    style={{ objectFit: "contain", objectPosition: "left center" }}
                    priority
                  />
                </div>
              </Link>
            )}
            {/* Parent: horizontal header nav (replaces sidebar on desktop) */}
            {sectionRole === "parent" && (
              <nav
                className="hidden md:flex items-center gap-0 ml-2 border-l border-slate-200 dark:border-slate-700 pl-4"
                aria-label="Parent dashboard navigation"
              >
                {ROLE_SECTIONS.find((s) => s.role === "parent")?.items.map((item, index) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.href}>
                      {index > 0 && (
                        <span className="h-4 w-px flex-shrink-0 bg-slate-200 dark:bg-slate-600 mx-1" aria-hidden />
                      )}
                      <Link
                        href={item.href}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                          active
                            ? "bg-gcal-primary-light text-gcal-primary dark:bg-gcal-primary/20 dark:text-gcal-primary font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </React.Fragment>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex flex-1 max-w-xs items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 text-sm text-slate-600 dark:text-slate-300 focus-within:ring-2 focus-within:ring-slate-400/50 focus-within:border-slate-300 dark:focus-within:border-slate-600">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <input
                type="search"
                placeholder="Search"
                className="w-full bg-transparent outline-none placeholder:text-slate-400 min-w-0"
                aria-label="Search dashboard"
              />
            </div>

            <ThemeToggle />

            {liveRefreshContext?.refreshAll && (
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={refreshAllBusy}
                className="flex min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8 items-center justify-center rounded-dashboard text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-dashboard disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Refresh dashboard"
                title="Refresh dashboard"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshAllBusy ? "animate-spin" : ""}`}
                  aria-hidden
                />
              </button>
            )}

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  if (!notificationsOpen) refetchNotifications(true);
                }}
                className="relative flex min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8 items-center justify-center rounded-dashboard text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-dashboard"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-4 w-4" aria-hidden />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-500 text-2xs font-bold text-slate-900 shadow-sm dark:border-white dark:bg-amber-500 dark:text-slate-900"
                    aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-overlay bg-transparent"
                    aria-hidden="true"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  {/* Mobile: full-width panel below header; md+: dropdown right-aligned */}
                  <div
                    className="fixed left-0 right-0 top-16 z-popover flex max-h-[60vh] flex-col overflow-y-auto rounded-t-xl border border-slate-200 border-t bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 md:absolute md:left-auto md:right-0 md:top-full md:mt-1.5 md:max-h-96 md:w-80 md:rounded-xl md:border-t"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllRead()}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1 min-h-0">
                      {notificationsLoading ? (
                        <div className="px-3 py-4" aria-busy="true" aria-label="Loading notifications">
                          <ListRowsSkeleton count={SKELETON_COUNTS.LIST_ROWS} />
                        </div>
                      ) : notifications.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                          No notifications
                        </p>
                      ) : (
                        <div className="py-1">
                          {orderedCategoryEntries(
                            groupNotificationsByCategory(notifications)
                          ).map(([categoryLabel, items]) => {
                            const isExpanded =
                              expandedNotificationCategory === categoryLabel;
                            return (
                              <div
                                key={categoryLabel}
                                className="border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedNotificationCategory((prev) =>
                                      prev === categoryLabel ? null : categoryLabel
                                    )
                                  }
                                  className="sticky top-0 z-raised flex w-full items-center justify-between gap-2 bg-slate-50/95 dark:bg-slate-900/95 px-3 py-1.5 text-left text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100/95 dark:hover:bg-slate-800/95"
                                  aria-expanded={isExpanded}
                                >
                                  {categoryLabel}
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                  )}
                                </button>
                                {isExpanded && (
                                  <ul className="py-0.5">
                                    {items.map((n) => (
                                      <li key={n.id}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (n.link) {
                                              router.push(n.link);
                                              setNotificationsOpen(false);
                                            }
                                            if (!n.readAt) markRead(n.id);
                                          }}
                                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.readAt ? "bg-slate-50/80 dark:bg-slate-800/30" : ""}`}
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <span className="font-medium text-slate-900 dark:text-slate-100 block min-w-0">
                                              {n.title}
                                            </span>
                                            {n.createdAtLabel && (
                                              <span className="shrink-0 text-2xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
                                                {n.createdAtLabel}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-slate-600 dark:text-slate-300 line-clamp-2 block">
                                            {n.message}
                                          </span>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex min-h-[44px] md:min-h-0 items-center gap-2 rounded-dashboard pl-2 pr-2.5 py-1.5 md:py-1 text-left hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-dashboard min-w-0 overflow-hidden"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <UserCircle2 className="h-6 w-6 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                <span className="hidden md:inline-flex flex-col text-left leading-tight min-w-0 max-w-[140px] truncate">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user?.name ?? "Signed in"}
                  </span>
                  <span className="text-2xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                    {user?.role === "super_admin" ? "Admin" : (user?.role ?? "")}
                  </span>
                </span>
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-overlay bg-transparent"
                    aria-hidden="true"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full z-popover mt-1.5 w-52 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 shadow-xl"
                    role="menu"
                  >
                    <Link
                      href={ROUTES.ACCOUNT}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserCircle2 className="h-4 w-4 shrink-0" />
                      Profile
                    </Link>
                    {sectionRole === "parent" ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setParentSettingsOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        Settings
                      </button>
                    ) : sectionRole === "trainer" ? (
                      <Link
                        href={ROUTES.DASHBOARD_TRAINER_SETTINGS}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        Settings
                      </Link>
                    ) : sectionRole === "admin" ? (
                      <Link
                        href={ROUTES.DASHBOARD_ADMIN_SETTINGS}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        Settings
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* Spacer: reserves height so main content starts below the fixed header (h-16) */}
      <div className="h-16 min-h-[4rem] flex-shrink-0" aria-hidden />

      {/* Body: min-h-0 so flex child can shrink; main is the scroll container so in-page sticky (e.g. parent right sidebar) sticks to visible area. */}
      <div
        className={`relative flex min-h-0 flex-1 min-w-0 ${sectionRole === "parent" ? "" : "lg:grid"} ${
          sectionRole === "parent"
            ? ""
            : sidebarEffectivelyCollapsed
              ? "lg:grid-cols-[4rem_minmax(0,1fr)]"
              : "lg:grid-cols-[16rem_minmax(0,1fr)]"
        } ${sectionRole !== "parent" && sidebarOpen ? "z-overlay lg:z-auto" : ""}`}
      >
        {sectionRole !== "parent" && sidebarOpen && (
          <div
            className="fixed inset-0 top-0 z-[500] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {sectionRole !== "parent" && (
        <aside
          className={`fixed inset-y-0 left-0 z-[600] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pt-16 transition-[transform,width] duration-dashboard ease-out lg:static lg:z-auto lg:translate-x-0 lg:pt-11 lg:w-full ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } w-72 max-w-[85vw] shadow-panel lg:max-w-none lg:w-full lg:shadow-none`}
        >
          {/* Close button – only visible on mobile when sidebar is open */}
          <button
            type="button"
            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-0 pb-2 text-sm text-slate-700 dark:text-slate-200 min-h-0">
            {visibleSections.map((section) => (
              <div key={section.role} className={sidebarEffectivelyCollapsed ? "lg:mb-2" : "mb-3"}>
                {/* Single row: section label + collapse/expand (desktop) or chevron (mobile) */}
                <div className="flex mb-1 items-center justify-between gap-1 px-1.5 min-h-[1.25rem]">
                  {!sidebarEffectivelyCollapsed && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 truncate">{section.label}</span>
                  )}
                  {sidebarEffectivelyCollapsed ? (
                    <button
                      type="button"
                      onClick={() => setCollapsed(false)}
                      className="ml-auto rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:mx-auto"
                      aria-label="Expand sidebar"
                      title="Expand sidebar"
                    >
                      <PanelLeft className="h-4 w-4" aria-hidden />
                    </button>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500 lg:hidden" aria-hidden />
                      <button
                        type="button"
                        onClick={() => setCollapsed(true)}
                        className="hidden lg:block rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        aria-label="Collapse sidebar"
                        title="Collapse sidebar"
                      >
                        <PanelLeftClose className="h-4 w-4" aria-hidden />
                      </button>
                    </>
                  )}
                </div>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={item.description ?? (sidebarEffectivelyCollapsed ? item.label : undefined)}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                            sidebarEffectivelyCollapsed ? "lg:justify-center lg:px-1.5 lg:py-1.5" : ""
                          } ${
                            active
                              ? "bg-gcal-primary-light text-gcal-primary dark:bg-gcal-primary/20 dark:text-gcal-primary font-medium border-l-4 border-gcal-primary"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden />
                          {!sidebarEffectivelyCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        )}

        {/* Main content area – scroll container (overflow-y-auto min-h-0) so sticky sidebars stick to visible area; same horizontal alignment as header. */}
        <main
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${
            sectionRole === "parent" || sectionRole === "trainer" || sectionRole === "admin"
              ? "pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
              : ""
          }`}
        >
          <div className={contentContainerClass}>
            <div className="min-w-0 pt-2 sm:pt-3">
              <div className="min-w-0 space-y-6 pb-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Parent bottom nav – mobile only: Overview, Booked hours, Children */}
      {sectionRole === "parent" && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-sticky border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_-1px_3px_0_rgb(0_0_0/0.06)] pb-[env(safe-area-inset-bottom,0px)]"
          aria-label="Parent dashboard navigation"
        >
          <div className="grid grid-cols-3 h-14">
            <Link
              href={ROUTES.DASHBOARD_PARENT}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-0 touch-manipulation ${
                pathname === ROUTES.DASHBOARD_PARENT && !pathname.startsWith(`${ROUTES.DASHBOARD_PARENT}/`)
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden />
              <span>Overview</span>
            </Link>
            <Link
              href={ROUTES.DASHBOARD_PARENT_BOOKINGS}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-0 touch-manipulation ${
                pathname.startsWith(ROUTES.DASHBOARD_PARENT_BOOKINGS)
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Calendar className="h-5 w-5 shrink-0" aria-hidden />
              <span>Bookings</span>
            </Link>
            <Link
              href={ROUTES.DASHBOARD_PARENT_CHILDREN}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-0 touch-manipulation ${
                pathname.startsWith(ROUTES.DASHBOARD_PARENT_CHILDREN)
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Users className="h-5 w-5 shrink-0" aria-hidden />
              <span>Children</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Trainer bottom nav – mobile only: Schedule | More (same layout as parent, URL-driven) */}
      {sectionRole === "trainer" && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-sticky border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_-1px_3px_0_rgb(0_0_0/0.06)] pb-[env(safe-area-inset-bottom,0px)]"
          aria-label="Trainer dashboard navigation"
        >
          <div className="grid grid-cols-2 h-14 max-w-lg mx-auto">
            <Link
              href={ROUTES.DASHBOARD_TRAINER}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-[44px] touch-manipulation ${
                trainerMobileTab === "schedule"
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              aria-current={trainerMobileTab === "schedule" ? "page" : undefined}
            >
              <CalendarCheck className="h-5 w-5 shrink-0" aria-hidden />
              <span>Schedule</span>
            </Link>
            <Link
              href={`${ROUTES.DASHBOARD_TRAINER}?tab=more`}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-[44px] touch-manipulation ${
                trainerMobileTab === "more"
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              aria-current={trainerMobileTab === "more" ? "page" : undefined}
            >
              <UserCircle2 className="h-5 w-5 shrink-0" aria-hidden />
              <span>More</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Admin bottom nav – mobile only: Overview | Bookings | More (opens sidebar) */}
      {sectionRole === "admin" && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-sticky border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_-1px_3px_0_rgb(0_0_0/0.06)] pb-[env(safe-area-inset-bottom,0px)]"
          aria-label="Admin dashboard navigation"
        >
          <div className="grid grid-cols-3 h-14">
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-0 touch-manipulation ${
                pathname === ROUTES.DASHBOARD_ADMIN
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              aria-current={pathname === ROUTES.DASHBOARD_ADMIN ? "page" : undefined}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden />
              <span>Overview</span>
            </Link>
            <Link
              href={ROUTES.DASHBOARD_ADMIN_BOOKINGS}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-h-[44px] min-w-0 touch-manipulation ${
                pathname.startsWith(ROUTES.DASHBOARD_ADMIN_BOOKINGS)
                  ? "text-gcal-primary dark:text-gcal-primary"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              aria-current={pathname.startsWith(ROUTES.DASHBOARD_ADMIN_BOOKINGS) ? "page" : undefined}
            >
              <Calendar className="h-5 w-5 shrink-0" aria-hidden />
              <span>Bookings</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-0 touch-manipulation"
              aria-label="Open full menu"
            >
              <Menu className="h-5 w-5 shrink-0" aria-hidden />
              <span>More</span>
            </button>
          </div>
        </nav>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <BaseSonner />

      {sectionRole === "parent" && (
        <ParentSettingsModal
          isOpen={parentSettingsOpen}
          onClose={() => setParentSettingsOpen(false)}
        />
      )}
    </div>
  );
};
