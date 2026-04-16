export type NavLinkItem = {
  readonly kind: "link";
  readonly href: string;
  readonly label: string;
};

export type NavMegaLink = {
  readonly href: string;
  readonly label: string;
  readonly description?: string;
};

export type NavMegaColumn = {
  readonly heading: string;
  readonly links: readonly NavMegaLink[];
};

export type NavMegaItem = {
  readonly kind: "mega";
  readonly label: string;
  readonly href: string;
  readonly columns: readonly NavMegaColumn[];
};

export type NavItem = NavLinkItem | NavMegaItem;

export const NAV_ITEMS: readonly NavItem[] = [
  { kind: "link", href: "/", label: "Home" },
  { kind: "link", href: "/about", label: "About" },
  {
    kind: "mega",
    label: "Services",
    href: "/services",
    columns: [
      {
        heading: "Programmes",
        links: [
          { href: "/services", label: "Services overview", description: "How delivery fits together." },
          { href: "/packages", label: "Intervention packages", description: "Tiers, duration, and fit." },
          { href: "/book/retrieve", label: "Retrieve booking", description: "Check an existing booking." },
          { href: "/contact", label: "Book a call", description: "Speak with the team." },
        ],
      },
      {
        heading: "Plan & access",
        links: [
          { href: "/about", label: "Who we are", description: "Our mission and delivery approach." },
          { href: "/become-a-trainer", label: "Become a trainer", description: "Join the CAMS team." },
          { href: "/faq", label: "FAQs", description: "Answers to common questions." },
          { href: "/contact", label: "Contact", description: "Start the conversation." },
        ],
      },
    ],
  },
  { kind: "link", href: "/packages", label: "Packages" },
  { kind: "link", href: "/become-a-trainer", label: "Become a Trainer" },
  { kind: "link", href: "/blog", label: "Blog" },
  { kind: "link", href: "/contact", label: "Contact" },
] as const;

export function isNavMegaItem(item: NavItem): item is NavMegaItem {
  return item.kind === "mega";
}
