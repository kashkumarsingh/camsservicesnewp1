"use client";

import React from "react";
import { Popover } from "@/components/popovers/Popover";
import { Button } from "@/components/common/button";
import { ChevronDown, Filter, HelpCircle, MoreVertical } from "lucide-react";

export default function PopoversShowcasePage() {
  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Popovers
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Dropdowns, filter popovers, action menus, and info popovers. No backdrop; they close on outside click or Escape.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-2 text-title font-semibold text-slate-900 dark:text-slate-50">Dropdown menu</h2>
          <p className="mb-3 text-caption text-slate-600 dark:text-slate-400">Trigger opens a list of options below.</p>
          <Popover
            trigger={
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-caption font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Options <ChevronDown className="h-3 w-3" />
              </span>
            }
            content={
              <ul className="space-y-0.5">
                <li><button type="button" className="w-full rounded px-2 py-1.5 text-left text-caption hover:bg-slate-100 dark:hover:bg-slate-700">Edit</button></li>
                <li><button type="button" className="w-full rounded px-2 py-1.5 text-left text-caption hover:bg-slate-100 dark:hover:bg-slate-700">Duplicate</button></li>
                <li><button type="button" className="w-full rounded px-2 py-1.5 text-left text-caption text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40">Delete</button></li>
              </ul>
            }
            placement="bottom"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-2 text-title font-semibold text-slate-900 dark:text-slate-50">Filter popover</h2>
          <p className="mb-3 text-caption text-slate-600 dark:text-slate-400">Checkboxes + Apply / Clear.</p>
          <Popover
            trigger={
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-caption font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                <Filter className="h-3 w-3" /> Status
              </span>
            }
            content={
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-caption dark:text-slate-300">
                  <input type="checkbox" className="h-3 w-3 rounded border-slate-300" /> Active
                </label>
                <label className="flex items-center gap-2 text-caption dark:text-slate-300">
                  <input type="checkbox" className="h-3 w-3 rounded border-slate-300" /> Inactive
                </label>
                <label className="flex items-center gap-2 text-caption dark:text-slate-300">
                  <input type="checkbox" className="h-3 w-3 rounded border-slate-300" /> Pending
                </label>
                <div className="flex gap-1 border-t border-slate-100 pt-2 dark:border-slate-700">
                  <Button size="sm" variant="primary" className="flex-1">Apply</Button>
                  <Button size="sm" variant="secondary">Clear</Button>
                </div>
              </div>
            }
            placement="bottom"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-2 text-title font-semibold text-slate-900 dark:text-slate-50">Action menu (⋯)</h2>
          <p className="mb-3 text-caption text-slate-600 dark:text-slate-400">Three-dots menu with context actions.</p>
          <Popover
            trigger={
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            content={
              <ul className="min-w-[120px] space-y-0.5">
                <li><button type="button" className="w-full rounded px-2 py-1.5 text-left text-caption hover:bg-slate-100 dark:hover:bg-slate-700">Edit</button></li>
                <li><button type="button" className="w-full rounded px-2 py-1.5 text-left text-caption hover:bg-slate-100 dark:hover:bg-slate-700">Share</button></li>
                <li><button type="button" className="w-full rounded px-2 py-1.5 text-left text-caption text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40">Delete</button></li>
              </ul>
            }
            placement="bottom"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-2 text-title font-semibold text-slate-900 dark:text-slate-50">Info / help popover</h2>
          <p className="mb-3 text-caption text-slate-600 dark:text-slate-400">Small hint on trigger (e.g. icon).</p>
          <Popover
            trigger={
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                aria-label="Help"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            }
            content={
              <div className="max-w-[200px] space-y-1 text-caption text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-50">Helper text</p>
                <p>Change the brand colour in <code className="rounded bg-slate-100 px-1 dark:bg-slate-700 dark:text-slate-200">app/globals.css</code> (--brand-* variables) to rebrand the app.
                </p>
              </div>
            }
            placement="bottom"
          />
        </div>
      </div>
    </section>
  );
}
