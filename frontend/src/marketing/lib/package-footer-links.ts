import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";
import { packageDetailHref } from "@/marketing/lib/package-detail-slug";

/** Footer / nav links to each intervention package detail page (internal linking). */
export const PACKAGE_TIER_LINKS = INTERVENTION_PACKAGES.map((pkg) => ({
  href: packageDetailHref(pkg.id),
  label: `${pkg.name} package`,
}));
