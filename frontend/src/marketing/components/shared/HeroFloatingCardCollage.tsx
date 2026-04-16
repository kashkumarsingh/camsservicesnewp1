import type { ReactElement } from "react";
import Image from "next/image";
import { PROGRAMME_COVER_IMAGE_LAYOUT } from "@/marketing/constants/programmeCoverImageLayout";
import { HOME_HERO_CARD_IMAGES } from "@/marketing/mock/home-services";
import { cn } from "@/marketing/lib/utils";

type HeroFloatingCardCollageProps = {
  /** `home` = full viewport hero; `band` = inner page hero (shorter, same 420/520/560-style band). */
  variant?: "home" | "band";
  /**
   * Three programme image URLs. If omitted, uses {@link HOME_HERO_CARD_IMAGES}.
   * If one or two URLs are supplied, they are repeated to fill three frames safely.
   */
  images?: readonly string[];
};

function resolveThreeImages(urls: readonly string[] | undefined): readonly [string, string, string] {
  const fallback = HOME_HERO_CARD_IMAGES.filter((s) => s.length > 0);
  const input = urls?.filter((s) => s.length > 0) ?? [];
  const pick = input.length > 0 ? input : fallback;
  const a = pick[0] ?? "";
  const b = pick[1];
  const c = pick[2];
  if (a.length === 0) {
    return ["", "", ""];
  }
  if (b === undefined) {
    return [a, a, a];
  }
  if (c === undefined) {
    return [a, b, a];
  }
  return [a, b, c];
}

/**
 * Three floating programme photos; matches the home hero right-hand collage.
 */
export function HeroFloatingCardCollage({
  variant = "home",
  images
}: HeroFloatingCardCollageProps): ReactElement {
  const resolved = resolveThreeImages(images);
  const [imgA, imgB, imgC] = resolved;
  const isBand = variant === "band";
  const { width: collageW, height: collageH } = PROGRAMME_COVER_IMAGE_LAYOUT.heroCollage;

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none",
        isBand
          ? "h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px]"
          : "h-[min(580px,64vh)] lg:h-[min(640px,74vh)]"
      )}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-cams-primary/25 to-transparent blur-3xl" />
      {imgA ? (
        <div
          className={cn(
            "cams-hero-float-card cams-hero-float-card--a absolute left-[2%] top-[6%] w-[58%] max-w-[360px] overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-2xl shadow-cams-dark/40 backdrop-blur-sm lg:rounded-3xl",
            isBand && "max-w-[220px]"
          )}
        >
          <Image
            src={imgA}
            alt=""
            className={cn(
              "w-full object-cover",
              isBand ? "h-28 sm:h-32 md:h-36" : "h-48 sm:h-56 md:h-60"
            )}
            width={collageW}
            height={collageH}
            sizes="(max-width: 1024px) 45vw, 360px"
          />
        </div>
      ) : null}
      {imgB ? (
        <div
          className={cn(
            "cams-hero-float-card cams-hero-float-card--b absolute right-[4%] top-[28%] w-[56%] max-w-[340px] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl shadow-cams-dark/35 backdrop-blur-sm lg:rounded-3xl",
            isBand && "max-w-[200px]"
          )}
        >
          <Image
            src={imgB}
            alt=""
            className={cn(
              "w-full object-cover",
              isBand ? "h-24 sm:h-28 md:h-32" : "h-44 sm:h-52 md:h-56"
            )}
            width={collageW}
            height={collageH}
            sizes="(max-width: 1024px) 42vw, 340px"
          />
        </div>
      ) : null}
      {imgC ? (
        <div
          className={cn(
            "cams-hero-float-card cams-hero-float-card--c absolute bottom-[6%] left-[18%] w-[54%] max-w-[320px] overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-2xl shadow-cams-dark/40 backdrop-blur-sm lg:rounded-3xl",
            isBand && "max-w-[200px]"
          )}
        >
          <Image
            src={imgC}
            alt=""
            className={cn(
              "w-full object-cover",
              isBand ? "h-24 sm:h-28 md:h-32" : "h-44 sm:h-52 md:h-56"
            )}
            width={collageW}
            height={collageH}
            sizes="(max-width: 1024px) 40vw, 320px"
          />
        </div>
      ) : null}
    </div>
  );
}
