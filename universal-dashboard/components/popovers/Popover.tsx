"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";

const VIEWPORT_PADDING = 8;
const GAP = 8;
const DESKTOP_BREAKPOINT_PX = 768;

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
  closeDelay?: number;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = "auto",
  contentClassName,
  onOpenChange,
  closeDelay = 0,
  closeOnClickOutside = true,
  closeOnEscape = true,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; fullWidth?: boolean } | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!closeOnClickOutside) return;
      const target = event.target as Node | null;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClick);
    };
  }, [open, closeOnClickOutside, closeOnEscape, onOpenChange]);

  useEffect(() => {
    if (!open || closeDelay <= 0) return;
    const id = window.setTimeout(() => {
      setOpen(false);
      onOpenChange?.(false);
    }, closeDelay);
    return () => window.clearTimeout(id);
  }, [open, closeDelay, onOpenChange]);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const contentEl = contentRef.current;
    if (!triggerEl || !contentEl || typeof document === "undefined") return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const contentRect = contentEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isNarrow = vw < DESKTOP_BREAKPOINT_PX;

    const contentWidth = contentRect.width;
    const contentHeight = contentRect.height;

    let place: Exclude<PopoverPlacement, "auto"> = placement === "auto" ? "bottom" : placement;

    if (placement === "auto") {
      const spaceBelow = vh - triggerRect.bottom - GAP;
      const spaceAbove = triggerRect.top - GAP;
      const spaceRight = vw - triggerRect.left - GAP;
      const spaceLeft = triggerRect.right + GAP;
      if (spaceBelow >= contentHeight || spaceBelow >= spaceAbove) {
        place = "bottom";
      } else if (spaceAbove >= contentHeight) {
        place = "top";
      } else if (spaceRight >= contentWidth && spaceRight >= spaceLeft) {
        place = "right";
      } else if (spaceLeft >= contentWidth) {
        place = "left";
      } else {
        place = spaceBelow >= spaceAbove ? "bottom" : "top";
      }
    }

    let top = 0;
    let left = 0;

    if (isNarrow) {
      left = VIEWPORT_PADDING;
      if (place === "bottom") {
        top = Math.min(triggerRect.bottom + GAP, vh - contentHeight - VIEWPORT_PADDING);
        top = Math.max(VIEWPORT_PADDING, top);
      } else {
        top = Math.max(triggerRect.top - GAP - contentHeight, VIEWPORT_PADDING);
        top = Math.min(top, vh - contentHeight - VIEWPORT_PADDING);
      }
      setPosition({ top, left, fullWidth: true });
      return;
    }

    switch (place) {
      case "bottom":
        top = triggerRect.bottom + GAP;
        left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
        break;
      case "top":
        top = triggerRect.top - GAP - contentHeight;
        left = triggerRect.left + (triggerRect.width - contentWidth) / 2;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
        left = triggerRect.right + GAP;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - contentHeight) / 2;
        left = triggerRect.left - GAP - contentWidth;
        break;
    }

    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - contentWidth - VIEWPORT_PADDING));
    top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - contentHeight - VIEWPORT_PADDING));

    setPosition({ top, left, fullWidth: false });
  }, [open, placement]);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
    const raf = requestAnimationFrame(() => updatePosition());
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const toggle = () => {
    setOpen((previous) => {
      const next = !previous;
      onOpenChange?.(next);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const baseContentClass =
    "z-40 min-w-[200px] max-w-[min(320px,calc(100vw-16px))] rounded-lg border border-slate-200 bg-white p-2 text-caption text-slate-800 shadow-lg transition-transform duration-150 ease-out dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:max-w-[320px]";
  const contentClass = `${baseContentClass} ${contentClassName ?? ""}`;

  const contentNode = open && (
    <div
      ref={contentRef}
      className={contentClass}
      style={
        typeof document !== "undefined"
          ? {
              position: "fixed",
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              right: position?.fullWidth ? VIEWPORT_PADDING : undefined,
              maxHeight: position ? "min(70vh, 400px)" : undefined,
              overflow: "auto",
              visibility: position ? "visible" : "hidden",
            }
          : undefined
      }
    >
      {content}
    </div>
  );

  return (
    <div className="relative inline-block text-left">
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="inline-flex cursor-pointer items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {typeof document !== "undefined" && contentNode
        ? createPortal(contentNode, document.body)
        : null}
    </div>
  );
};
