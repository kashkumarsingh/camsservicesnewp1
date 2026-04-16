import type { InterventionPackageId } from "@/marketing/mock/intervention-packages";
import { ROUTES } from "@/shared/utils/routes";

/**
 * Parent auth entry when a tier is selected on /packages.
 * Uses `/login` + `redirect` (read by LoginPageClient), not `/sign-in` (no such route).
 */
export function getPackageSignInHref(
  packageId: InterventionPackageId,
  redirectPath = ROUTES.PACKAGES
): string {
  const params = new URLSearchParams({
    role: "parent",
    intent: "buy-package",
    package: packageId,
    redirect: redirectPath
  });
  return `${ROUTES.LOGIN}?${params.toString()}`;
}

export function getPackageSignUpHref(
  packageId: InterventionPackageId,
  redirectPath = ROUTES.PACKAGES
): string {
  const params = new URLSearchParams({
    role: "parent",
    intent: "buy-package",
    package: packageId,
    redirect: redirectPath
  });
  return `${ROUTES.REGISTER}?${params.toString()}`;
}
