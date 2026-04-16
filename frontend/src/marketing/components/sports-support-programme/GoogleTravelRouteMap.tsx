"use client";

import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

type GoogleTravelRouteMapProps = {
  lineLatLng: [number, number][];
  fromLabel: string;
  toLabel: string;
};

export function GoogleTravelRouteMap({
  lineLatLng,
  fromLabel,
  toLabel
}: GoogleTravelRouteMapProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathKey = JSON.stringify(lineLatLng);

  useEffect(() => {
    if (lineLatLng.length < 2) {
      return;
    }

    const el = containerRef.current;
    if (!el) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
    if (!apiKey.length) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
      setOptions({ key: apiKey, v: "weekly" });
      await importLibrary("maps");

      if (cancelled || !containerRef.current || containerRef.current !== el) {
        return;
      }

      el.innerHTML = "";
      const path = lineLatLng.map(([lat, lng]) => ({ lat, lng }));

      const map = new google.maps.Map(el, {
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "greedy"
      });

      new google.maps.Polyline({
        path,
        strokeColor: "#0066ff",
        strokeOpacity: 0.92,
        strokeWeight: 5,
        map
      });

      new google.maps.Marker({
        position: path[0]!,
        map,
        title: `Pick-up: ${fromLabel}`
      });
      new google.maps.Marker({
        position: path[path.length - 1]!,
        map,
        title: `Session: ${toLabel}`
      });

      const bounds = new google.maps.LatLngBounds();
      path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });

      requestAnimationFrame(() => {
        if (!cancelled && containerRef.current === el) {
          google.maps.event.trigger(map, "resize");
        }
      });
    })();

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [pathKey, fromLabel, toLabel]);

  return (
    <div
      ref={containerRef}
      className="isolate z-0 h-[min(24rem,55vh)] w-full min-h-[240px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner"
      role="region"
      aria-label="Google map showing pick-up and session locations"
    />
  );
}
