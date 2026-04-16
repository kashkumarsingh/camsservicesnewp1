import Link from "next/link";
import Image from "next/image";
import type { ReactElement } from "react";
import { ROUTES } from "@/shared/utils/routes";
import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";
import type { NavItem } from "@/mock/navigation";

type SiteHeaderProps = {
  navItems?: readonly NavItem[];
};

export function SiteHeader({ navItems }: SiteHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-50 h-[70px] overflow-visible border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex h-[70px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <Link href={ROUTES.HOME} className="inline-flex items-center">
          <Image
            src="/logos/cams-services-logo.webp"
            alt="CAMS Services"
            className="h-10 w-auto"
            width={180}
            height={40}
          />
        </Link>
        <SiteHeaderNav navItems={navItems} />
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-cams-ink transition hover:bg-cams-soft hover:text-cams-primary"
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.BECOME_A_TRAINER}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-cams-primary px-4 py-2 text-sm font-semibold text-cams-primary transition hover:bg-cams-primary/10"
          >
            Become a Trainer
          </Link>
          <Link
            href={ROUTES.CONTACT}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-gradient-to-r from-cams-primary to-cams-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Book Free Call
          </Link>
        </div>
      </nav>
    </header>
  );
}
