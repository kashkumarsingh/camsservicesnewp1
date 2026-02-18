"use client";

import React, { useEffect, useState } from "react";

export type SheetSide = "left" | "right" | "bottom";
export type SheetSize = "sm" | "md" | "lg" | "full";

const DESKTOP_BREAKPOINT_PX = 768;

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: SheetSide;
  size?: SheetSize;
  isDismissible?: boolean;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  size = "md",
  isDismissible = true,
}) => {
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDismissible) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDismissible, onClose]);

  if (!isOpen) return null;

  const effectiveSide: SheetSide = isDesktop ? side : "bottom";
  const effectiveSize: SheetSize = isDesktop ? size : "full";

  const widthClass =
    effectiveSize === "sm"
      ? "max-w-xs"
      : effectiveSize === "md"
        ? "max-w-sm"
        : effectiveSize === "lg"
          ? "max-w-md"
          : "max-w-full";

  const positionClass =
    effectiveSide === "left"
      ? "left-0 top-0 h-full"
      : effectiveSide === "bottom"
        ? "bottom-0 left-0 w-full max-h-[90dvh] rounded-t-2xl"
        : "right-0 top-0 h-full";

  const animationClass =
    effectiveSide === "bottom"
      ? "animate-slide-up"
      : effectiveSide === "left"
        ? "animate-slide-in-left"
        : "animate-slide-in-right";

  const wrapperClass =
    effectiveSide === "left"
      ? "fixed inset-y-0 left-0 z-40 flex justify-start"
      : effectiveSide === "bottom"
        ? "fixed inset-x-0 bottom-0 z-40 flex justify-center"
        : "fixed inset-y-0 right-0 z-40 flex justify-end";

  const borderClass =
    effectiveSide === "left"
      ? "border-r border-slate-200 dark:border-slate-700"
      : effectiveSide === "bottom"
        ? "border-t border-slate-200 dark:border-slate-700"
        : "border-l border-slate-200 dark:border-slate-700";

  return (
    <div className={wrapperClass} aria-label="Side panel">
      <div
        className={`relative flex w-full flex-col bg-white text-body shadow-xl dark:bg-slate-900 ${widthClass} ${positionClass} ${borderClass} ${animationClass} ${effectiveSide === "bottom" ? "h-auto" : "h-full"}`}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-title font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {isDismissible && (
            <button
              type="button"
              onClick={onClose}
              className="text-caption text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Close
            </button>
          )}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-body text-slate-700 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
};
