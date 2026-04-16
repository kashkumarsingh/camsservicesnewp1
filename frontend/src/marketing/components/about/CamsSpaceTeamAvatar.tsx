import type { ReactElement } from "react";
import Image from "next/image";
import { cn } from "@/marketing/lib/utils";

type CamsSpaceTeamAvatarProps = {
  name: string;
  role: string;
  /** Unique slug for SVG defs (no spaces). */
  avatarKey: string;
  className?: string;
};

const BRAND = {
  primaryDeep: "#0047B3",
  primaryDark: "#003591",
  primary: "#0066FF"
} as const;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

function nebulaCentre(avatarKey: string): { cx: string; cy: string } {
  let h = 2161;
  for (let i = 0; i < avatarKey.length; i++) {
    h = (h * 33 + avatarKey.charCodeAt(i)!) >>> 0;
  }
  const dx = (h % 17) - 8;
  const dy = ((h >> 5) % 13) - 6;
  return { cx: `${50 + dx}%`, cy: `${38 + dy}%` };
}

const STAR_SEED: readonly { x: number; y: number; s: number; o: number }[] = [
  { x: 8, y: 12, s: 0.9, o: 0.85 },
  { x: 22, y: 8, s: 0.45, o: 0.5 },
  { x: 38, y: 18, s: 0.7, o: 0.7 },
  { x: 55, y: 6, s: 0.5, o: 0.55 },
  { x: 72, y: 14, s: 1.1, o: 0.9 },
  { x: 88, y: 22, s: 0.4, o: 0.45 },
  { x: 14, y: 35, s: 0.55, o: 0.6 },
  { x: 30, y: 42, s: 0.35, o: 0.4 },
  { x: 48, y: 38, s: 0.8, o: 0.75 },
  { x: 65, y: 48, s: 0.5, o: 0.5 },
  { x: 82, y: 40, s: 0.65, o: 0.65 },
  { x: 92, y: 55, s: 0.4, o: 0.45 },
  { x: 12, y: 58, s: 0.75, o: 0.72 },
  { x: 28, y: 68, s: 0.45, o: 0.48 },
  { x: 44, y: 62, s: 0.95, o: 0.88 },
  { x: 60, y: 72, s: 0.5, o: 0.52 },
  { x: 76, y: 65, s: 0.6, o: 0.62 },
  { x: 90, y: 78, s: 0.38, o: 0.42 },
  { x: 18, y: 82, s: 0.55, o: 0.58 },
  { x: 40, y: 88, s: 0.42, o: 0.46 },
  { x: 58, y: 85, s: 0.88, o: 0.82 },
  { x: 75, y: 92, s: 0.48, o: 0.5 },
  { x: 5, y: 48, s: 0.35, o: 0.38 },
  { x: 95, y: 12, s: 0.52, o: 0.55 },
  { x: 50, y: 28, s: 0.4, o: 0.44 }
];

export function CamsSpaceTeamAvatar({
  name,
  role,
  avatarKey,
  className
}: CamsSpaceTeamAvatarProps): ReactElement {
  const bgId = `cams-brand-space-bg-${avatarKey}`;
  const glowId = `cams-brand-space-glow-${avatarKey}`;
  const { cx, cy } = nebulaCentre(avatarKey);
  const initials = initialsFromName(name);
  const isDirector = /\bdirector\b/i.test(role);

  return (
    <div
      className={cn(
        "relative flex aspect-[5/6] w-full items-center justify-center overflow-hidden bg-cams-primary",
        "transition duration-500 group-hover:scale-[1.02]",
        className
      )}
      aria-label={`${name}, ${role}. CAMS brand avatar with initials.`}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BRAND.primaryDark} />
            <stop offset="38%" stopColor={BRAND.primary} />
            <stop offset="68%" stopColor={BRAND.primaryDeep} />
            <stop offset="100%" stopColor={BRAND.primaryDark} />
          </linearGradient>
          <radialGradient id={glowId} cx={cx} cy={cy} r="78%">
            <stop offset="0%" stopColor="rgba(0, 212, 255, 0.45)" />
            <stop offset="38%" stopColor="rgba(0, 102, 255, 0.22)" />
            <stop offset="62%" stopColor="rgba(51, 133, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(0, 53, 145, 0)" />
          </radialGradient>
        </defs>
        <rect width="100" height="120" fill={`url(#${bgId})`} />
        <rect width="100" height="120" fill={`url(#${glowId})`} />
        {STAR_SEED.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.s * 0.92}
            fill="#E0F2FE"
            opacity={star.o * 0.38}
          />
        ))}
      </svg>

      <div className="relative z-10 flex min-h-[11.5rem] w-full items-center justify-center px-5 py-7 md:min-h-[12.5rem] md:px-7 md:py-8">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <Image
            src="/logos/cams-services-logo.webp"
            alt=""
            width={400}
            height={90}
            className="h-auto w-[90%] max-w-[17.5rem] object-contain brightness-0 invert opacity-[0.22] drop-shadow-[0_2px_12px_rgba(0,0,0,0.12)] md:max-w-[19rem] md:opacity-[0.18]"
          />
        </div>
        <div
          className={cn(
            "relative z-10 flex aspect-square w-[56%] max-w-[9.5rem] shrink-0 items-center justify-center rounded-full md:max-w-[10rem]",
            "bg-gradient-to-b from-[#0d1f3d]/10 to-[#061229]/10 ring-[3px] backdrop-blur-md",
            "ring-white/55 shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
            isDirector &&
              "ring-cams-accent/90 shadow-[0_0_28px_rgba(204,255,0,0.28)] ring-offset-[3px] ring-offset-transparent"
          )}
        >
          <span className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:text-3xl">
            {initials}
          </span>
        </div>
      </div>
    </div>
  );
}
