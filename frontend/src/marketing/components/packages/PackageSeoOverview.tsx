import type { ReactElement } from "react";
import Link from "next/link";
import { getPackageSeoCopy } from "@/marketing/content/package-seo-copy";
import type { InterventionPackageId } from "@/marketing/mock/intervention-packages";
import { ROUTES } from "@/shared/utils/routes";

type PackageSeoOverviewProps = {
  packageId: InterventionPackageId;
  packageName: string;
  programmeSubtitle: string;
  frequencyLine: string;
  bestFor: string;
  totalWeeks: number;
};

/** Visible, crawlable copy for package detail SEO (word count + text-HTML ratio). */
export function PackageSeoOverview({
  packageId,
  packageName,
  programmeSubtitle,
  frequencyLine,
  bestFor,
  totalWeeks,
}: PackageSeoOverviewProps): ReactElement {
  const copy = getPackageSeoCopy(packageId, packageName, programmeSubtitle, frequencyLine, bestFor);

  return (
    <section
      className="border-b border-primary-blue/10 bg-white py-12"
      aria-labelledby="package-overview-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="package-overview-heading" className="font-heading text-2xl font-bold text-navy-blue md:text-3xl">
          About the {packageName} intervention package
        </h2>
        <p className="mt-4 text-base leading-7 text-navy-blue/85">{copy.overview}</p>
        <p className="mt-4 text-base leading-7 text-navy-blue/85">
          This {totalWeeks}-week programme is delivered by CAMS services Ltd, a UK provider of chaperone,
          transport, mentoring, and SEND support for families, schools, and local authorities.
        </p>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">Who the {packageName} package is for</h3>
        <p className="mt-3 text-base leading-7 text-navy-blue/85">{copy.whoFor}</p>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">What is included</h3>
        <p className="mt-3 text-base leading-7 text-navy-blue/85">{copy.included}</p>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">Typical outcomes</h3>
        <p className="mt-3 text-base leading-7 text-navy-blue/85">{copy.outcomes}</p>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">How commissioning works</h3>
        <p className="mt-3 text-base leading-7 text-navy-blue/85">{copy.commissioning}</p>
        <h3 className="mt-8 text-lg font-bold text-navy-blue">Programme features</h3>
        {copy.features.length > 0 ? (
          <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-7 text-navy-blue/85">
            {copy.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-6 text-base leading-7 text-navy-blue/85">{copy.longForm}</p>
        <p className="mt-6 text-sm leading-6 text-navy-blue/75">
          Compare all tiers on our{" "}
          <Link href={ROUTES.PACKAGES} className="font-semibold text-primary-blue underline underline-offset-2">
            intervention packages page
          </Link>
          , read our{" "}
          <Link href={ROUTES.REFERRAL} className="font-semibold text-primary-blue underline underline-offset-2">
            referral guidance
          </Link>
          , or{" "}
          <Link href={ROUTES.CONTACT} className="font-semibold text-primary-blue underline underline-offset-2">
            contact the CAMS team
          </Link>{" "}
          to discuss the {packageName} package.
        </p>
      </div>
    </section>
  );
}
