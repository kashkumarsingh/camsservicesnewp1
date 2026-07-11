import type { ReactElement } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { CAMS_SOCIAL_LINKS, type CamsSocialPlatform } from '@/marketing/constants/socialLinks';
import { cn } from '@/marketing/lib/utils';

const ICONS: Record<CamsSocialPlatform, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
};

type SocialMediaLinksProps = {
  /** Footer: light icons on dark background. Contact: brand-coloured on white panel. */
  variant?: 'footer' | 'contact';
  className?: string;
};

export function SocialMediaLinks({
  variant = 'footer',
  className,
}: SocialMediaLinksProps): ReactElement {
  const linkClass =
    variant === 'footer'
      ? 'flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-cams-secondary/40 hover:bg-white/10 hover:text-cams-secondary'
      : 'flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-cams-primary shadow-sm transition hover:border-cams-primary/30 hover:bg-cams-primary/5';

  return (
    <nav aria-label="Social media" className={cn(className)}>
      <ul className="flex flex-wrap gap-3">
        {CAMS_SOCIAL_LINKS.map((link) => {
          const Icon = ICONS[link.platform];
          return (
            <li key={link.platform}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
                aria-label={link.label}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
