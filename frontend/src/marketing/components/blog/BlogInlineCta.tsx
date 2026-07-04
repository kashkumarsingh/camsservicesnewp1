import type { ReactElement } from 'react';
import { Button } from '@/marketing/components/ui/button';

export type BlogInlineCtaAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type BlogInlineCtaProps = {
  heading: string;
  body: string;
  actions: readonly BlogInlineCtaAction[];
};

/** Mid-article CTA with site button styles (not plain text links). */
export function BlogInlineCta({ heading, body, actions }: BlogInlineCtaProps): ReactElement {
  return (
    <aside
      className="my-10 rounded-2xl border border-cams-primary/25 bg-gradient-to-br from-cams-primary/[0.07] to-cams-secondary/[0.05] p-6 shadow-sm md:p-8"
      aria-label="Call to action"
    >
      <h3 className="text-xl font-bold leading-snug text-cams-dark md:text-2xl">{heading}</h3>
      <p className="mt-3 text-base leading-8 text-cams-slate md:text-lg">{body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {actions.map((action) => (
          <Button
            key={`${action.href}-${action.label}`}
            href={action.href}
            variant={action.variant === 'primary' ? 'primary' : 'secondary'}
            className="min-h-[48px] w-full justify-center px-6 sm:w-auto"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </aside>
  );
}
