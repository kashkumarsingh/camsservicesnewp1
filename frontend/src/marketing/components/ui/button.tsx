import type { ReactElement, ReactNode } from "react";
import MarketingButton from "@/design-system/components/Button/MarketingButton";
import type { ButtonProps as MarketingButtonProps } from "@/components/ui/Button";

type LocalVariant = "primary" | "secondary" | "ghost" | "ctaPrimary" | "ctaSecondary";

type ButtonSize = "default" | "lg";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: LocalVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
};

const variantMap: Record<LocalVariant, NonNullable<MarketingButtonProps["variant"]>> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "ghost",
  ctaPrimary: "ctaPrimary",
  ctaSecondary: "ctaSecondary",
};

/**
 * Marketing-site button: delegates to the shared design-system MarketingButton
 * (sizes match via `resolveMarketingAlignedButtonSize` in the design system).
 */
export function Button({
  children,
  href,
  variant = "primary",
  size = "default",
  className,
  type = "submit",
  onClick,
  disabled = false,
}: ButtonProps): ReactElement {
  const mbSize = size === "lg" ? "lg" : "sm";

  return (
    <MarketingButton
      href={href}
      variant={variantMap[variant]}
      size={mbSize}
      type={href ? undefined : type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </MarketingButton>
  );
}
