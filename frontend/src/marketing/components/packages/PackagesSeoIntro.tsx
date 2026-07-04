import type { ReactElement } from "react";
import Link from "next/link";
import { AllPackagesNav } from "@/marketing/components/packages/AllPackagesNav";
import { ROUTES } from "@/shared/utils/routes";

/** Server-rendered intro for /packages (crawlable word count + H1). */
export function PackagesSeoIntro(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 md:px-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-cams-primary">
        Professional and parent referrals
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-cams-dark md:text-4xl">
        CAMS intervention packages
      </h1>
      <div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-cams-slate">
        <p>
          CAMS Services offers eight graduated intervention packages — from a short Mercury assessment block
          through to our Neptune flagship programme. Each tier combines structured one-to-one mentoring,
          activity-based engagement, and clear reporting so families, schools, and local authorities can match
          hours and intensity to the young person&apos;s needs.
        </p>
        <p>
          Packages include DBS-checked mentors, transport for session travel where required, refreshments
          during activities, and written updates for parents and referrers. Following an initial consultation
          we recommend the most appropriate tier and provide a personalised quotation aligned with your
          safeguarding and placement requirements.
        </p>
        <p>
          Explore our{" "}
          <Link href={ROUTES.SERVICES} className="font-semibold text-cams-primary underline underline-offset-2">
            chaperone and mentoring services
          </Link>
          ,{" "}
          <Link href={ROUTES.REFERRAL} className="font-semibold text-cams-primary underline underline-offset-2">
            make a referral
          </Link>
          , or{" "}
          <Link href={ROUTES.FAQ} className="font-semibold text-cams-primary underline underline-offset-2">
            read frequently asked questions
          </Link>{" "}
          about commissioning CAMS support.
        </p>
      </div>
      <div className="mt-8">
        <AllPackagesNav />
      </div>
    </div>
  );
}
