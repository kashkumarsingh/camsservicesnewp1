import type React from 'react';

/**
 * Type for icon components (e.g. from lucide-react) used in props.
 * Use this instead of LucideIcon when tsc cannot resolve lucide-react's namespace type.
 * Extends SVG props with lucide-react's common props (size, etc.).
 */
export type IconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { size?: number; className?: string }
>;
