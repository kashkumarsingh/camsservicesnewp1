"use client";

import type { LatLngTuple } from "leaflet";
import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type TravelRouteMapProps = {
  lineLatLng: LatLngTuple[];
  fromLabel: string;
  toLabel: string;
};

export function TravelRouteMap({
  lineLatLng,
  fromLabel,
  toLabel
}: TravelRouteMapProps): ReactElement {
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

    let alive = true;
    const mapHolder: { current: import("leaflet").Map | null } = { current: null };

    void import("leaflet").then((LM) => {
      if (!alive || containerRef.current !== el) {
        return;
      }

      const L = LM.default;
      el.innerHTML = "";
      const map = L.map(el, {
        scrollWheelZoom: true,
        zoomControl: true
      });
      mapHolder.current = map;

      if (!alive) {
        map.remove();
        mapHolder.current = null;
        return;
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.control.scale({ imperial: true, metric: true, maxWidth: 200 }).addTo(map);

      const path = lineLatLng.map(([lat, lng]) => L.latLng(lat, lng));
      L.polyline(path, { color: "#0066ff", weight: 5, opacity: 0.9 }).addTo(map);

      const start = path[0]!;
      const end = path[path.length - 1]!;
      L.circleMarker(start, {
        radius: 11,
        fillColor: "#0066ff",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      })
        .addTo(map)
        .bindPopup(`<strong>Pick-up</strong><br>${escapeHtml(fromLabel)}`);

      L.circleMarker(end, {
        radius: 11,
        fillColor: "#00a36c",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      })
        .addTo(map)
        .bindPopup(`<strong>Session</strong><br>${escapeHtml(toLabel)}`);

      map.fitBounds(L.latLngBounds(path), { padding: [32, 32], maxZoom: 12 });

      requestAnimationFrame(() => {
        if (alive && mapHolder.current === map) {
          map.invalidateSize();
        }
      });
    });

    return () => {
      alive = false;
      mapHolder.current?.remove();
      mapHolder.current = null;
    };
  }, [pathKey, fromLabel, toLabel]);

  return (
    <div
      ref={containerRef}
      className="isolate z-0 h-[min(24rem,55vh)] w-full min-h-[240px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner"
      role="region"
      aria-label="Map showing pick-up and session locations"
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
