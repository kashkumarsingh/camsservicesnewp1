/** Matches `ButtonProps['size']` without importing the button module (avoids cycles). */
export type ButtonSizeToken = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Min-heights used across the app (marketing rhythm).
 * Paired with token size `sm` (default) and `lg` (large).
 */
export const buttonSurfaceMinHeight = {
  default: 'min-h-10',
  large: 'min-h-[52px] md:min-h-14',
} as const;

/**
 * Maps public `size` props to padding/typography tokens + min-height.
 * `md` (default on `Button`) and `sm` align with marketing "default".
 * `xs` stays compact for dense UI (no extra min-height).
 */
export function resolveMarketingAlignedButtonSize(
  size: ButtonSizeToken | undefined,
): { tokenSize: ButtonSizeToken; extraClassName: string } {
  switch (size) {
    case 'lg':
      return { tokenSize: 'lg', extraClassName: buttonSurfaceMinHeight.large };
    case 'xs':
      return { tokenSize: 'xs', extraClassName: '' };
    case 'sm':
    case 'md':
    case undefined:
      return { tokenSize: 'sm', extraClassName: buttonSurfaceMinHeight.default };
  }
}
