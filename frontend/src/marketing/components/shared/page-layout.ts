export const PAGE_LAYOUT = {
  sectionPadding: "py-16 md:py-24",
  container: "mx-auto max-w-[1600px] px-4 md:px-6",
  contentContainer: "mx-auto max-w-[1500px]",
  panel: "rounded-3xl border border-slate-200/80 bg-white shadow-sm",
  panelFrame: "rounded-3xl border border-slate-200/80 shadow-sm",
  panelCompact: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  threeColGrid: "grid gap-4 md:grid-cols-3",
  twoColGrid: "grid gap-4 md:grid-cols-2",
  splitGrid: "grid gap-8 lg:grid-cols-[1.28fr_1fr]",
  ctaRow: "mt-6 flex flex-wrap gap-3",
  sectionHeader: "mb-12 text-center md:mb-16"
} as const;

export const PAGE_TYPOGRAPHY = {
  sectionHeading: "font-heading text-3xl font-bold md:text-5xl",
  cardHeading: "text-2xl font-bold md:text-3xl",
  body: "text-base leading-8 text-cams-slate",
  bodyResponsive: "text-sm leading-7 text-cams-slate md:text-base",
  label: "text-sm font-semibold text-cams-slate md:text-base"
} as const;

export const PAGE_SURFACES = {
  cardBase: "rounded-2xl border border-slate-200 bg-white",
  cardMuted: "rounded-2xl border border-slate-200 bg-slate-50/70",
  cardHoverLift:
    "rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
  cardHoverLiftPrimary:
    "rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cams-primary/30 hover:shadow-md",
  cardSoft:
    "rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
} as const;

