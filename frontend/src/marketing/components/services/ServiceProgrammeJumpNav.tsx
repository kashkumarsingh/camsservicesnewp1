import type { ReactElement } from "react";
import type { ServiceProgrammeListItem } from "@/marketing/mock/services-programmes";

type ServiceProgrammeJumpNavProps = {
  programmes: ReadonlyArray<ServiceProgrammeListItem>;
};

export function ServiceProgrammeJumpNav({
  programmes
}: ServiceProgrammeJumpNavProps): ReactElement {
  return (
    <nav
      aria-label="Jump to programmes"
      className="sticky top-[70px] z-40 -mx-4 border-b-2 border-cams-primary/15 bg-white/95 px-4 py-4 shadow-[0_8px_30px_rgba(0,102,255,0.08)] backdrop-blur-md md:mx-0 md:rounded-2xl md:border-2 md:border-slate-200/90 md:shadow-md"
    >
      <div className="flex flex-col gap-2">
        <p className="shrink-0 font-heading text-xs font-bold uppercase tracking-[0.2em] text-cams-primary">
          Jump to programme
        </p>
        <div className="-mx-4 cams-thin-x-scroll min-w-0 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] md:mx-0 md:px-0">
          <ul className="flex w-max flex-nowrap gap-2.5 md:gap-3">
            {programmes.map((p) => (
              <li key={p.anchorId} className="shrink-0">
                <a
                  href={`#${p.anchorId}`}
                  className="inline-flex min-h-[2.75rem] items-center whitespace-nowrap rounded-full border-2 border-cams-primary/35 bg-gradient-to-b from-cams-primary/[0.12] to-cams-primary/[0.06] px-4 py-2 text-sm font-bold text-cams-primary shadow-sm transition hover:border-cams-primary hover:bg-cams-primary hover:text-white hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-cams-primary focus-visible:ring-offset-2"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
