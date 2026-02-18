"use client";

import React from "react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/common/button";
import { useToast } from "@/components/common/toast";

export default function ModalsShowcasePage() {
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Modals & toasts
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Open modals (confirm, info, form-style) and trigger toasts. All mock.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" onClick={() => setConfirmOpen(true)}>
          Confirmation modal
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setInfoOpen(true)}>
          Info modal
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFormOpen(true)}>
          Form-style modal
        </Button>
        <Button variant="primary" size="sm" onClick={() => show({ title: "Success", variant: "success" })}>
          Toast: Success
        </Button>
        <Button variant="secondary" size="sm" onClick={() => show({ title: "Error", description: "Something went wrong", variant: "error" })}>
          Toast: Error
        </Button>
        <Button variant="ghost" size="sm" onClick={() => show({ title: "Info", variant: "info" })}>
          Toast: Info
        </Button>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm action"
        footer={
          <>
            <Button size="sm" variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button size="sm" variant="danger" onClick={() => { show({ title: "Deleted", variant: "success" }); setConfirmOpen(false); }}>Delete</Button>
          </>
        }
      >
        <p className="text-body text-slate-700 dark:text-slate-200">
          This action cannot be undone. Proceed?
        </p>
      </Modal>

      <Modal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Details"
        footer={<Button size="sm" variant="secondary" onClick={() => setInfoOpen(false)}>Close</Button>}
      >
        <div className="space-y-2 text-body text-slate-700 dark:text-slate-200">
          <p><strong>Name:</strong> Demo Item</p>
          <p><strong>Status:</strong> Active</p>
          <p><strong>Created:</strong> 2026-02-09</p>
        </div>
      </Modal>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Edit item"
        footer={
          <>
            <Button size="sm" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={() => { show({ title: "Saved", variant: "success" }); setFormOpen(false); }}>Save</Button>
          </>
        }
      >
        <div className="space-y-3 text-body">
          <div>
            <label className="mb-1 block text-caption font-medium text-slate-700 dark:text-slate-200">
              Label
            </label>
            <input
              type="text"
              className="h-input-h w-full rounded-md border border-slate-300 px-3 text-ui text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Enter label"
            />
          </div>
          <div>
            <label className="mb-1 block text-caption font-medium text-slate-700 dark:text-slate-200">
              Notes
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-slate-300 px-3 py-2 text-ui text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Optional notes"
            />
          </div>
        </div>
      </Modal>
    </section>
  );
}
