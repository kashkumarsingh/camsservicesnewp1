"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/marketing/lib/utils";

type HomeEditorialParallaxImageProps = {
  src: string;
  alt: string;
  /** Peak vertical shift in px (kept subtle for desktop polish). */
  maxShiftPx?: number;
  frameClassName?: string;
  imageClassName: string;
};

/**
 * Very light scroll-linked vertical shift inside an overflow-hidden frame.
 * Disabled when `prefers-reduced-motion: reduce`.
 */
export function HomeEditorialParallaxImage({
  src,
  alt,
  maxShiftPx = 20,
  frameClassName,
  imageClassName
}: HomeEditorialParallaxImageProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shiftPx, setShiftPx] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) {
      return undefined;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return undefined;
    }

    const clamp = (value: number, min: number, max: number): number =>
      Math.min(max, Math.max(min, value));

    const update = (): void => {
      const el = rootRef.current;
      if (el === null) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.height <= 0 || vh <= 0) {
        return;
      }
      const blockMidY = rect.top + rect.height / 2;
      const viewMidY = vh / 2;
      const normalised = (viewMidY - blockMidY) / vh;
      const next = clamp(normalised * maxShiftPx * 2.2, -maxShiftPx, maxShiftPx);
      setShiftPx(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [maxShiftPx]);

  return (
    <div ref={rootRef} className={cn("overflow-hidden", frameClassName)}>
      <div className="will-change-transform" style={{ transform: `translate3d(0, ${String(shiftPx)}px, 0)` }}>
        <Image
          src={src}
          alt={alt}
          className={cn(
            "w-full scale-[1.06] object-cover motion-safe:transition motion-safe:duration-700 motion-safe:ease-out motion-safe:lg:hover:scale-[1.08]",
            imageClassName
          )}
          width={1600}
          height={1000}
        />
      </div>
    </div>
  );
}
