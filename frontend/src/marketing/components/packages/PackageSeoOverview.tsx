import type { ReactElement } from "react";
import { CamsIcon } from "@/marketing/components/shared/CamsIcon";
import { MarketingSeoOverviewPanel } from "@/marketing/components/shared/MarketingSeoOverviewPanel";
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
  className?: string;
};

/** Visible, crawlable copy for package detail SEO. */
export function PackageSeoOverview({
  packageId,
  packageName,
  programmeSubtitle,
  frequencyLine,
  bestFor,
  totalWeeks,
  className,
}: PackageSeoOverviewProps): ReactElement {
  const copy = getPackageSeoCopy(packageId, packageName, programmeSubtitle, frequencyLine, bestFor);

  return (
    <MarketingSeoOverviewPanel
      className={className}
      eyebrow="Package overview"
      title={`About the ${packageName} intervention package`}
      headingId="package-overview-heading"
      paragraphs={[
        copy.overview,
        `This ${totalWeeks}-week programme is delivered by CAMS services Ltd, a UK provider of chaperone, transport, mentoring, and SEND support for families, schools, and local authorities.`,
        copy.longForm,
      ]}
      blocks={[
        { title: `Who the ${packageName} package is for`, content: <p>{copy.whoFor}</p> },
        { title: "What is included", content: <p>{copy.included}</p> },
        { title: "Typical outcomes", content: <p>{copy.outcomes}</p> },
        { title: "How commissioning works", content: <p>{copy.commissioning}</p> },
        ...(copy.features.length > 0
          ? [
              {
                title: "Programme features",
                content: (
                  <ul className="space-y-2">
                    {copy.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex shrink-0 rounded-lg border border-cams-primary/15 bg-cams-primary/[0.08] p-1">
                          <CamsIcon name="listChecks" size={14} strokeWidth={2.5} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]
          : []),
      ]}
      links={[
        { href: ROUTES.PACKAGES, label: "Compare all packages" },
        { href: ROUTES.REFERRAL, label: "Referral guidance" },
        { href: ROUTES.CONTACT, label: "Contact CAMS" },
      ]}
    />
  );
}
