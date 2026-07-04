import type { ReactElement } from "react";
import Image from "next/image";
import { cn } from "@/marketing/lib/utils";

type HomeEditorialParallaxImageProps = {
  src: string;
  alt: string;
  /** @deprecated Parallax removed for scroll performance; kept for call-site compatibility. */
  maxShiftPx?: number;
  frameClassName?: string;
  imageClassName: string;
};

/** Static editorial image — no scroll-linked transforms (better scroll performance). */
export function HomeEditorialParallaxImage({
  src,
  alt,
  frameClassName,
  imageClassName,
}: HomeEditorialParallaxImageProps): ReactElement {
  return (
    <div className={cn("overflow-hidden", frameClassName)}>
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
  );
}
