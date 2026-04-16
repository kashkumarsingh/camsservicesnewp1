"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

export function SiteCursor(): ReactElement | null {
  const [enabled, setEnabled] = useState(false);
  const [dot, setDot] = useState({ x: 0, y: 0 });
  const [ring, setRing] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const fine = window.matchMedia("(pointer: fine)");
      setEnabled(!reduced.matches && fine.matches);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("cams-custom-cursor");
    return () => document.documentElement.classList.remove("cams-custom-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const target = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };

    let frame = 0;
    const tick = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      setRing({ x: ringPos.x, y: ringPos.y });
      frame = window.requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      setDot({ x: event.clientX, y: event.clientY });
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed z-[9999] hidden h-3 w-3 rounded-full bg-cams-primary shadow-[0_0_0_1px_rgba(255,255,255,0.85)] md:block"
        style={{ left: dot.x, top: dot.y, transform: "translate(-50%, -50%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed z-[9998] hidden h-11 w-11 rounded-full border border-cams-primary/55 md:block"
        style={{
          left: ring.x,
          top: ring.y,
          transform: `translate(-50%, -50%) scale(${pressed ? 0.85 : 1})`,
          transition: "transform 120ms ease-out",
        }}
      />
    </>
  );
}
