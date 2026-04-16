import Link from "next/link";
import Image from "next/image";
import type { ReactElement } from "react";
import { ROUTES } from "@/shared/utils/routes";

export type SiteFooterSection = {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
};

export const DEFAULT_FOOTER_SECTIONS: ReadonlyArray<SiteFooterSection> = [
  {
    title: "Explore",
    links: [
      { href: ROUTES.HOME, label: "Home" },
      { href: ROUTES.SERVICES, label: "Services" },
      { href: ROUTES.PACKAGES, label: "Packages" },
      { href: ROUTES.BLOG, label: "Blog" },
    ],
  },
  {
    title: "Families",
    links: [
      { href: ROUTES.LOGIN, label: "Parent sign in" },
      { href: ROUTES.REGISTER, label: "Parent sign up" },
      { href: ROUTES.CONTACT, label: "Make a referral" },
      { href: ROUTES.CONTACT, label: "Contact" },
    ],
  },
  {
    title: "Partners",
    links: [
      { href: ROUTES.LOGIN, label: "Trainer sign in" },
      { href: ROUTES.CONTACT, label: "School partnerships" },
      { href: ROUTES.PACKAGES, label: "Intervention packages" },
      { href: ROUTES.ABOUT, label: "About CAMS" },
    ],
  },
  {
    title: "Organisation",
    links: [
      { href: ROUTES.BECOME_A_TRAINER, label: "Become a trainer" },
      { href: ROUTES.POLICIES, label: "Policies" },
      { href: ROUTES.FAQ, label: "FAQs" },
      { href: ROUTES.CONTACT, label: "Contact" },
    ],
  },
];

type SiteFooterProps = {
  sections?: ReadonlyArray<SiteFooterSection>;
  description?: string;
  copyrightText?: string;
};

export function SiteFooter({
  sections = DEFAULT_FOOTER_SECTIONS,
  description = "Structured mentoring and intervention for young people across the UK, safeguarding-led, relationship-first, and built for real-world progress.",
  copyrightText = "© 2026 CAMS Services Ltd. All rights reserved.",
}: SiteFooterProps): ReactElement {
  return (
    <footer className="relative bg-cams-dark text-slate-300">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-16 sm:px-6 md:px-10">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-14 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Link href={ROUTES.HOME} className="inline-flex items-center">
              <Image
                src="/logos/cams-services-logo.webp"
                alt="CAMS Services"
                className="h-11 w-auto brightness-0 invert"
                width={198}
                height={44}
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">{description}</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:max-w-3xl lg:gap-x-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="font-heading text-[0.7rem] font-bold uppercase tracking-[0.22em] text-white">
                  {section.title}
                </h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-slate-400 transition hover:translate-x-0.5 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>{copyrightText}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
            <Link href={ROUTES.POLICIES} className="text-slate-400 transition hover:text-cams-secondary">
              Policies
            </Link>
            <Link href={ROUTES.FAQ} className="text-slate-400 transition hover:text-cams-secondary">
              FAQ
            </Link>
            <Link href={ROUTES.CONTACT} className="text-slate-400 transition hover:text-cams-secondary">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
