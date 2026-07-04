import type { ReactElement } from "react";
import Link from "next/link";
import {
  INTERVENTION_PACKAGES,
  type InterventionPackageId,
} from "@/marketing/mock/intervention-packages";
import { ROUTES } from "@/shared/utils/routes";

type AllPackagesNavProps = {
  currentPackageId?: InterventionPackageId;
};

/** Internal links to every package tier (Semrush: orphaned / single incoming link). */
export function AllPackagesNav({ currentPackageId }: AllPackagesNavProps): ReactElement {
  return (
    <nav
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="All intervention packages"
    >
      <h2 className="text-lg font-bold text-cams-dark">All CAMS intervention packages</h2>
      <p className="mt-2 text-sm leading-6 text-cams-slate">
        Each tier adds mentoring hours and reporting depth. Select a package to view programme details,
        included activities, and booking options.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {INTERVENTION_PACKAGES.map((pkg) => {
          const isCurrent = pkg.id === currentPackageId;
          return (
            <li key={pkg.id}>
              {isCurrent ? (
                <span className="block rounded-lg bg-cams-primary/10 px-3 py-2 text-sm font-semibold text-cams-dark">
                  {pkg.name} (current)
                </span>
              ) : (
                <Link
                  href={`${ROUTES.PACKAGES}/${pkg.id}`}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-cams-primary underline-offset-2 hover:bg-slate-50 hover:underline"
                >
                  {pkg.name} package
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm">
        <Link href={ROUTES.PACKAGES} className="font-semibold text-cams-primary underline underline-offset-2">
          Compare packages side by side
        </Link>
      </p>
    </nav>
  );
}
