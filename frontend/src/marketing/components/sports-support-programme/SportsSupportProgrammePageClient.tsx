"use client";

import type { ReactElement } from "react";
import dynamic from "next/dynamic";
import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { PageShell } from "@/marketing/components/shared/PageShell";
import { PageHeroBand } from "@/marketing/components/shared/PageHeroBand";
import { PageCtaSection } from "@/marketing/components/shared/PageCtaSection";
import { Button } from "@/marketing/components/ui/button";

const FUEL_RATE_PER_MILE = 1.53;
const STORAGE_KEY = "cams-sports-travel-calculator-v1";

type DistanceProvider = "osrm" | "straight_line";

type FieldProps = {
  htmlFor: string;
  label: string;
  hint?: string;
  help?: string;
  children: ReactElement;
};

function Field({ htmlFor, label, hint, help, children }: FieldProps): ReactElement {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const inputProps = {
    id: htmlFor,
    ...(hintId ? { "aria-describedby": hintId } : {})
  };
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, inputProps)
    : children;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={htmlFor} className="cursor-pointer text-sm font-semibold text-cams-ink">
          {label}
        </label>
        {help ? (
          <span className="group relative inline-flex shrink-0">
            <button
              type="button"
              className="rounded p-0.5 text-cams-primary/80 hover:text-cams-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-cams-primary focus-visible:ring-offset-2"
              aria-label={`More about ${label}`}
            >
              <CircleHelp size={16} aria-hidden />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg bg-cams-ink px-3 py-2 text-left text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {help}
            </span>
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-cams-ink-secondary">
          {hint}
        </p>
      ) : null}
      {control}
    </div>
  );
}

function formatUkPostcodeDisplay(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5 || compact.length > 8) {
    return value.trim().toUpperCase();
  }
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-cams-ink shadow-sm transition placeholder:text-slate-400 focus:border-cams-primary focus:outline-none focus:ring-2 focus:ring-cams-primary/25";

const mapLoadingFallback = (
  <div className="flex h-[min(24rem,55vh)] min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-cams-ink-secondary">
    Loading map…
  </div>
);

const TravelRouteMap = dynamic(
  () => import("./TravelRouteMap").then((m) => ({ default: m.TravelRouteMap })),
  {
    ssr: false,
    loading: () => mapLoadingFallback
  }
);

const GoogleTravelRouteMap = dynamic(
  () => import("./GoogleTravelRouteMap").then((m) => ({ default: m.GoogleTravelRouteMap })),
  {
    ssr: false,
    loading: () => mapLoadingFallback
  }
);

const USE_GOOGLE_EMBEDDED_MAP =
  typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string" &&
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim().length > 0;

type RouteMapState = {
  lineLatLng: [number, number][];
  fromLabel: string;
  toLabel: string;
};

export function SportsSupportProgrammePageClient(): ReactElement {
  const [fromPostcode, setFromPostcode] = useState("");
  const [toPostcode, setToPostcode] = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [programmeWeeks, setProgrammeWeeks] = useState(39);
  const [roundTrip, setRoundTrip] = useState(false);
  const [manualMiles, setManualMiles] = useState("");

  const [calculatedMiles, setCalculatedMiles] = useState<number | null>(null);
  const [distanceProvider, setDistanceProvider] = useState<DistanceProvider | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [routeMap, setRouteMap] = useState<RouteMapState | null>(null);

  const [storageReady, setStorageReady] = useState(false);
  const optionalDistanceDetailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStorageReady(true);
        return;
      }
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p.fromPostcode === "string") setFromPostcode(p.fromPostcode);
      if (typeof p.toPostcode === "string") setToPostcode(p.toPostcode);
      if (typeof p.sessionsPerWeek === "number") setSessionsPerWeek(p.sessionsPerWeek);
      if (typeof p.programmeWeeks === "number") setProgrammeWeeks(p.programmeWeeks);
      if (typeof p.roundTrip === "boolean") setRoundTrip(p.roundTrip);
      if (typeof p.manualMiles === "string") {
        setManualMiles(p.manualMiles);
        if (p.manualMiles.trim() !== "") {
          queueMicrotask(() => {
            const el = optionalDistanceDetailsRef.current;
            if (el) {
              el.open = true;
            }
          });
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fromPostcode,
          toPostcode,
          sessionsPerWeek,
          programmeWeeks,
          roundTrip,
          manualMiles
        })
      );
    } catch {
      // ignore quota / private mode
    }
  }, [
    storageReady,
    fromPostcode,
    toPostcode,
    sessionsPerWeek,
    programmeWeeks,
    roundTrip,
    manualMiles
  ]);

  const usingManualMiles = useMemo(() => {
    const n = Number.parseFloat(manualMiles.trim());
    return manualMiles.trim() !== "" && Number.isFinite(n) && n > 0;
  }, [manualMiles]);

  useEffect(() => {
    if (usingManualMiles) {
      setRouteMap(null);
    }
  }, [usingManualMiles]);

  const effectiveOneWayMiles = useMemo(() => {
    if (usingManualMiles) {
      return Number.parseFloat(manualMiles.trim());
    }
    if (calculatedMiles === null) {
      return null;
    }
    return calculatedMiles;
  }, [usingManualMiles, manualMiles, calculatedMiles]);

  const effectiveMilesForFuel = useMemo(() => {
    if (effectiveOneWayMiles === null) {
      return null;
    }
    return roundTrip ? effectiveOneWayMiles * 2 : effectiveOneWayMiles;
  }, [effectiveOneWayMiles, roundTrip]);

  const estimate = useMemo(() => {
    if (effectiveMilesForFuel === null) {
      return null;
    }
    return effectiveMilesForFuel * FUEL_RATE_PER_MILE * sessionsPerWeek * programmeWeeks;
  }, [effectiveMilesForFuel, sessionsPerWeek, programmeWeeks]);

  async function calculateDistance(): Promise<void> {
    if (fromPostcode.trim().length === 0 || toPostcode.trim().length === 0) {
      setDistanceError("Enter both postcodes first.");
      return;
    }

    setDistanceLoading(true);
    setDistanceError(null);
    setRouteMap(null);

    try {
      const response = await fetch("/api/travel-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPostcode: fromPostcode.trim(),
          toPostcode: toPostcode.trim()
        })
      });
      const data = (await response.json()) as
        | {
            miles: number;
            provider: DistanceProvider;
            from?: { label?: string };
            to?: { label?: string };
            lineLatLng?: [number, number][];
          }
        | { error?: string };

      if (!response.ok || !("miles" in data)) {
        setCalculatedMiles(null);
        setDistanceProvider(null);
        setRouteMap(null);
        setDistanceError(
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : "Could not calculate distance."
        );
        return;
      }

      setCalculatedMiles(data.miles);
      setDistanceProvider(data.provider);

      if (
        Array.isArray(data.lineLatLng) &&
        data.lineLatLng.length >= 2 &&
        data.from &&
        data.to
      ) {
        setRouteMap({
          lineLatLng: data.lineLatLng,
          fromLabel: typeof data.from.label === "string" ? data.from.label : fromPostcode.trim(),
          toLabel: typeof data.to.label === "string" ? data.to.label : toPostcode.trim()
        });
      } else {
        setRouteMap(null);
      }
    } catch {
      setCalculatedMiles(null);
      setDistanceProvider(null);
      setRouteMap(null);
      setDistanceError("Could not calculate distance.");
    } finally {
      setDistanceLoading(false);
    }
  }

  const routeNote =
    distanceProvider === "osrm"
      ? "Based on a typical driving route between these postcodes."
      : distanceProvider === "straight_line"
        ? "Straight-line estimate — actual roads are often a little longer."
        : null;

  return (
    <PageShell maxWidthClassName="max-w-[1600px]">
      <PageHeroBand
        title={
          <>
            Sports Support <span className="text-cams-primary">Programme</span>
          </>
        }
        description="One-to-one support across training, development and participation in sport."
      />

      <section
        className="mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,102,255,0.06)]"
        aria-labelledby="travel-estimate-heading"
      >
        <div className="border-b border-slate-100 bg-gradient-to-br from-cams-soft/80 to-white px-5 py-6 md:px-8 md:py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cams-primary">
            Planning
          </p>
          <h2
            id="travel-estimate-heading"
            className="mt-2 font-mono text-2xl font-bold tracking-tight text-cams-ink md:text-3xl"
          >
            Session travel estimate
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cams-ink-secondary md:text-base">
            A quick, indicative figure for fuel between pick-up and session — useful when you are
            budgeting ahead. It is not a quote; roads and costs vary day to day.
          </p>
        </div>

        <div className="space-y-8 px-5 py-6 md:px-8 md:py-8">
          <fieldset className="space-y-4">
            <legend className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cams-ink-secondary">
              Route
            </legend>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                htmlFor="travel-from-pc"
                label="Pick-up postcode"
                hint="Where the young person is usually collected from. UK postcode — type with or without a space; we tidy it when you leave the box."
                help="Full UK postcode (e.g. SW1A 1AA). This tool only works for UK addresses."
              >
                <input
                  value={fromPostcode}
                  onChange={(event) => setFromPostcode(event.target.value.toUpperCase())}
                  onBlur={() => setFromPostcode((v) => formatUkPostcodeDisplay(v))}
                  className={inputClassName}
                  placeholder="e.g. SW1A 1AA"
                  autoComplete="postal-code"
                />
              </Field>
              <Field
                htmlFor="travel-to-pc"
                label="Session postcode"
                hint="Venue or usual meeting point. UK postcode — same spacing note as pick-up."
                help="Use the postcode for the place sessions normally happen, not your office unless that is the session venue."
              >
                <input
                  value={toPostcode}
                  onChange={(event) => setToPostcode(event.target.value.toUpperCase())}
                  onBlur={() => setToPostcode((v) => formatUkPostcodeDisplay(v))}
                  className={inputClassName}
                  placeholder="e.g. M1 1AE"
                  autoComplete="postal-code"
                />
              </Field>
            </div>

            {usingManualMiles ? (
              <div className="flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p className="text-sm leading-relaxed text-cams-ink">
                  <span className="font-semibold">Manual miles are on.</span> The optional distance
                  box further down is filled in, so we are using that number — not your postcodes or
                  the map — until you switch back.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={() => {
                    setManualMiles("");
                    setCalculatedMiles(null);
                    setDistanceProvider(null);
                    setDistanceError(null);
                  }}
                >
                  Use postcodes and map
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  onClick={() => void calculateDistance()}
                  disabled={distanceLoading}
                  variant="primary"
                  size="lg"
                >
                  {distanceLoading ? "Working out distance…" : "Work out distance"}
                </Button>
                {calculatedMiles !== null ? (
                  <div className="rounded-xl border border-cams-primary/15 bg-cams-primary/[0.06] px-4 py-3 text-sm">
                    <p className="font-semibold text-cams-ink">
                      One-way · {calculatedMiles.toFixed(1)} miles
                    </p>
                    {routeNote ? (
                      <p className="mt-1 text-xs leading-relaxed text-cams-ink-secondary">
                        {routeNote}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </fieldset>

          {!usingManualMiles ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-cams-ink-secondary">
                  Your route on the map
                </h3>
                <p className="mt-1 text-sm text-cams-ink-secondary">
                  {routeMap
                    ? USE_GOOGLE_EMBEDDED_MAP
                      ? "Google map: pick-up and session markers and the blue route line. Use layers, Street View (pegman) and zoom like the main Google Maps site."
                      : "Blue dot: pick-up · green dot: session. Drag to move, scroll or pinch to zoom, tap a dot for the postcode. For Google’s app with traffic and more, use the link under the map."
                    : "The map appears after you enter both postcodes and tap Work out distance."}
                </p>
              </div>
              {routeMap ? (
                <>
                  {USE_GOOGLE_EMBEDDED_MAP ? (
                    <GoogleTravelRouteMap
                      lineLatLng={routeMap.lineLatLng}
                      fromLabel={routeMap.fromLabel}
                      toLabel={routeMap.toLabel}
                    />
                  ) : (
                    <TravelRouteMap
                      lineLatLng={routeMap.lineLatLng}
                      fromLabel={routeMap.fromLabel}
                      toLabel={routeMap.toLabel}
                    />
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="text-xs leading-relaxed text-cams-ink-secondary">
                      {USE_GOOGLE_EMBEDDED_MAP
                        ? "Map data © Google. The blue line follows our distance estimate (OpenStreetMap routing where available) — not Google’s own directions engine."
                        : "© OpenStreetMap — simple preview on this page. The blue line guides distance; it is not live sat-nav."}
                    </p>
                    {!USE_GOOGLE_EMBEDDED_MAP &&
                    fromPostcode.trim() !== "" &&
                    toPostcode.trim() !== "" ? (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromPostcode.trim())}&destination=${encodeURIComponent(toPostcode.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-cams-primary bg-white px-4 py-2.5 text-sm font-semibold text-cams-primary shadow-sm transition hover:bg-cams-primary/5 focus-visible:outline focus-visible:ring-2 focus-visible:ring-cams-primary focus-visible:ring-offset-2"
                      >
                        Open in Google Maps
                      </a>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
                  <p className="font-mono text-sm font-bold text-cams-ink">Map preview</p>
                  <p className="mt-2 max-w-md text-sm text-cams-ink-secondary">
                    Add your pick-up and session postcodes above, then tap{" "}
                    <span className="font-semibold text-cams-ink">Work out distance</span> — we will
                    show the journey here so you can see it, not just read numbers.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <fieldset className="space-y-4">
            <legend className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cams-ink-secondary">
              Programme schedule
            </legend>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                htmlFor="travel-sessions"
                label="Sessions per week"
                hint="How many visits you expect in a typical week."
              >
                <input
                  type="number"
                  min={0}
                  value={sessionsPerWeek}
                  onChange={(event) =>
                    setSessionsPerWeek(Math.max(0, Number(event.target.value) || 0))
                  }
                  className={inputClassName}
                />
              </Field>
              <Field
                htmlFor="travel-weeks"
                label="Programme length"
                hint="Total weeks you are planning for."
                help="School year is often around 39 weeks — change this to match your plan."
              >
                <input
                  type="number"
                  min={0}
                  value={programmeWeeks}
                  onChange={(event) =>
                    setProgrammeWeeks(Math.max(0, Number(event.target.value) || 0))
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 transition hover:border-cams-primary/25">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(event) => setRoundTrip(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-cams-primary focus:ring-cams-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-cams-ink">
                  Include return travel each session
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-cams-ink-secondary">
                  Turn this on when each visit includes the journey back — we double one-way miles
                  before estimating fuel.
                </span>
              </span>
            </label>
          </fieldset>

          <details
            ref={optionalDistanceDetailsRef}
            className="group rounded-xl border border-dashed border-slate-200 bg-slate-50/30 px-4 py-3"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-cams-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                Already know the one-way distance?
                <ChevronDown
                  className="size-4 shrink-0 text-cams-primary transition group-open:-rotate-180"
                  aria-hidden
                />
              </span>
            </summary>
            <div className="mt-4 border-t border-slate-200/80 pt-4">
              <Field
                htmlFor="travel-manual-miles"
                label="One-way miles (optional)"
                hint="Only if you already know the miles (e.g. from a sat-nav). When this has a number, we pause postcodes and the map for distance."
                help="Single direction only. “Include return travel each session” still doubles this if switched on."
              >
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualMiles}
                  onChange={(event) => setManualMiles(event.target.value)}
                  className={inputClassName}
                  placeholder="e.g. 12.5"
                />
              </Field>
            </div>
          </details>

          {distanceError ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
              {distanceError === "Enter both postcodes first."
                ? "Add both postcodes above, or use the optional distance field."
                : distanceError}
            </p>
          ) : null}

          {usingManualMiles ? (
            <p className="text-sm font-medium text-cams-ink">
              Using your one-way distance: {Number.parseFloat(manualMiles.trim()).toFixed(1)} miles
            </p>
          ) : null}

          {effectiveMilesForFuel !== null ? (
            <p className="text-sm text-cams-ink-secondary">
              Miles included in the estimate{roundTrip ? " (with return each session)" : ""}:{" "}
              <strong className="text-cams-ink">{effectiveMilesForFuel.toFixed(1)}</strong>
            </p>
          ) : null}

          {estimate !== null ? (
            <div className="rounded-2xl border-2 border-cams-primary/20 bg-gradient-to-br from-white to-cams-soft/50 p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cams-primary">
                Indicative fuel total
              </p>
              <p className="mt-1 font-mono text-3xl font-bold text-cams-ink md:text-4xl">
                £{estimate.toFixed(2)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-cams-ink-secondary">
                £{FUEL_RATE_PER_MILE.toFixed(2)} per mile × {effectiveMilesForFuel?.toFixed(1)} miles ×{" "}
                {sessionsPerWeek} session{sessionsPerWeek === 1 ? "" : "s"} / week × {programmeWeeks}{" "}
                week{programmeWeeks === 1 ? "" : "s"}. Change the rate in discussion with your team if
                your costs differ.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-cams-ink-secondary/90">
                Illustrative only — not a bill or quote. Traffic, routes, and vehicle efficiency will
                change the real number.
              </p>
            </div>
          ) : null}

          <details className="rounded-lg text-xs leading-relaxed text-cams-ink-secondary">
            <summary className="cursor-pointer font-medium text-cams-ink hover:text-cams-primary">
              How this estimate is calculated
            </summary>
            <div className="mt-2 space-y-2 border-l-2 border-cams-primary/20 pl-3">
              <p>
                We look up UK postcodes, then use a public road-distance service where available, with
                a straight-line fallback if routing is unavailable.
              </p>
              <p className="text-cams-ink-secondary/85">
                No personal data is stored on our servers for this tool — your browser may remember
                what you typed so you can come back to it.
              </p>
            </div>
          </details>
        </div>
      </section>

      <PageCtaSection
        heading="Need sport support for a young person?"
        description="Share your schedule and context, and our team will recommend the right next step."
        actions={[
          { href: "/referral", label: "Make a referral", variant: "primary" },
          { href: "/contact", label: "Book a consultation", variant: "secondary" },
          { href: "/services", label: "View all programmes", variant: "secondary" }
        ]}
      />
    </PageShell>
  );
}
