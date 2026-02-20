/**
 * Joins class names, filtering out falsy values.
 * Use for conditional Tailwind classes.
 */
export function cn(...args: (string | undefined | null | false)[]): string {
  return args.filter(Boolean).join(' ');
}
