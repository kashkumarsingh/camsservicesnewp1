import { Star } from "lucide-react";
import type { ReactElement } from "react";
import { cn } from "@/marketing/lib/utils";
import {
  CAMS_ICON_MAP,
  CAMS_PACKAGE_ICONS,
  type CamsIconName
} from "@/marketing/mock/cams-icon-registry";
import type { InterventionPackageId } from "@/marketing/mock/intervention-packages";

export type { CamsIconName };

/** Surface the icon is painted on; drives contrast-safe stroke colour (see `tailwind.config` cams.icon). */
export type CamsIconSurface = "light" | "muted" | "inverse" | "accentOnDark";

const SURFACE_CLASS: Record<CamsIconSurface, string> = {
  light: "text-cams-icon-on-light",
  muted: "text-cams-icon-on-muted",
  inverse: "text-cams-icon-on-inverse",
  accentOnDark: "text-cams-icon-accent-on-dark"
};

type CamsIconProps = {
  name: CamsIconName;
  /** Ground colour family; default matches white & soft grey cards. */
  surface?: CamsIconSurface;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function CamsIcon({
  name,
  surface = "light",
  className,
  size = 28,
  strokeWidth = 1.75
}: CamsIconProps): ReactElement {
  const Icon = CAMS_ICON_MAP[name];
  return (
    <Icon
      className={cn("shrink-0", SURFACE_CLASS[surface], className)}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden
    />
  );
}

type InterventionPackageIconProps = {
  packageId: InterventionPackageId;
  surface?: CamsIconSurface;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function InterventionPackageIcon({
  packageId,
  surface = "light",
  className,
  size = 40,
  strokeWidth = 1.5
}: InterventionPackageIconProps): ReactElement {
  const Icon = CAMS_PACKAGE_ICONS[packageId];
  return (
    <Icon
      className={cn("shrink-0", SURFACE_CLASS[surface], className)}
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden
    />
  );
}

type CamsStarRatingProps = {
  /** Light cards: warm stars. `inverse`: brighter fills on dark bands. */
  variant?: "light" | "inverse";
  className?: string;
  starClassName?: string;
};

export function CamsStarRating({
  variant = "light",
  className,
  starClassName
}: CamsStarRatingProps): ReactElement {
  const starColour =
    variant === "inverse"
      ? "fill-cams-icon-accent-on-dark text-cams-icon-accent-on-dark"
      : "fill-cams-rating-star text-cams-rating-star";

  return (
    <div className={cn("flex gap-0.5", className)} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-5",
            starColour,
            variant === "light" && "stroke-cams-rating-starStroke",
            starClassName
          )}
          strokeWidth={variant === "light" ? 1.35 : 1.15}
          aria-hidden
        />
      ))}
    </div>
  );
}
