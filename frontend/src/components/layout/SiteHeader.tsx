import Link from "next/link";
import Image from "next/image";
import type { ReactElement } from "react";
import { ROUTES } from "@/shared/utils/routes";
import { GetAccessDropdown } from "@/components/layout/GetAccessDropdown";
import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";
import type { NavItem } from "@/mock/navigation";

type SiteHeaderProps = {
  navItems?: readonly NavItem[];
};

export function SiteHeader({ navItems }: SiteHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-50 h-[70px] overflow-visible border-b border-slate-200/80 bg-white shadow-sm">
      <nav className="mx-auto flex h-[70px] w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <Link href={ROUTES.HOME} className="inline-flex items-center">
          <Image
            src="/logos/cams-services-logo.webp"
            alt="CAMS services"
            className="h-10 w-auto"
            width={180}
            height={40}
          />
        </Link>
        <SiteHeaderNav navItems={navItems} />
        <div className="hidden items-center gap-3 xl:flex">
          <GetAccessDropdown />
          <Link
            href={ROUTES.BECOME_A_TRAINER}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-cams-primary px-4 py-2 text-sm font-semibold text-cams-primary transition hover:bg-cams-primary/10"
          >
            Become a Trainer
          </Link>
          <Link
            href={ROUTES.REFERRAL}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-cams-primary px-4 py-2 text-sm font-semibold text-cams-primary transition hover:bg-cams-primary/10"
          >
            Make a Referral
          </Link>
        </div>
      </nav>
    </header>
  );
}
