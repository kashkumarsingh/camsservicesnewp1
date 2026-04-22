import type { ReactElement, ReactNode } from "react";
import { HeroFloatingCardCollage } from "@/marketing/components/shared/HeroFloatingCardCollage";
import { camsVideoSrc } from "@/marketing/mock/cams-videos";

type PageHeroBandProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Three programme images for the collage; defaults to home hero imagery when omitted. */
  collageImages?: readonly string[];
  layout?: "split" | "centered";
  height?: "default" | "short";
};

/**
 * Inner-page hero: same video/gradient/diagonal as home, original band heights (420/520/560),
 * copy left and compact floating images right (does not use full home collage height).
 */
export function PageHeroBand({
  title,
  description,
  collageImages,
  layout = "centered",
  height = "short"
}: PageHeroBandProps): ReactElement {
  const sectionHeightClass =
    height === "short"
      ? "min-h-[320px] md:min-h-[380px] lg:min-h-[420px]"
      : "min-h-[420px] md:min-h-[520px] lg:min-h-[560px]";

  return (
    <section
      className={`cams-hero-diagonal-clip relative left-1/2 flex w-screen max-w-none -translate-x-1/2 items-center overflow-hidden px-4 py-10 text-white sm:px-6 md:px-8 md:py-12 lg:px-10 lg:py-0 ${sectionHeightClass}`}
    >
      <video
        className="cams-hero-video absolute inset-0 h-full w-full object-cover"
        src={camsVideoSrc("heroBackground")}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-br from-cams-dark/85 via-cams-primary/45 to-cams-secondary/35" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 20%, rgba(204,255,0,0.12), transparent 40%)"
        }}
      />

      {layout === "centered" ? (
        <div className="relative z-10 mx-auto w-full max-w-[1600px] text-center">
          <div className="mx-auto max-w-3xl px-1 sm:px-0">
            <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
            {description ? (
              <div className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cams-ink-onHero/95 md:text-lg [&_a]:text-cams-accent [&_a]:underline [&_a]:underline-offset-4">
                {description}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto grid w-full max-w-[1600px] gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div className="max-w-2xl lg:max-w-none">
            <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {title}
            </h1>
            {description ? (
              <div className="mt-6 max-w-xl text-base leading-relaxed text-cams-ink-onHero/95 md:text-lg [&_a]:text-cams-accent [&_a]:underline [&_a]:underline-offset-4">
                {description}
              </div>
            ) : null}
          </div>
          <HeroFloatingCardCollage variant="band" images={collageImages} />
        </div>
      )}
    </section>
  );
}
