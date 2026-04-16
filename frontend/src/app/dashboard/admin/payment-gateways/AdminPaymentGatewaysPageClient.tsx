'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/dashboard/universal';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { BaseModal } from '@/components/ui/Modal';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import { useAdminPaymentGateways } from '@/interfaces/web/hooks/admin/useAdminPaymentGateways';
import type { AdminPaymentGatewayDTO, UpdatePaymentGatewayDTO } from '@/core/application/admin/dto/AdminPaymentGatewayDTO';
import { toastManager } from '@/dashboard/utils/toast';
import { PAYMENT_GATEWAY_PAGE } from './paymentGatewayConstants';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const BREADCRUMBS = [
  { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
  { label: PAYMENT_GATEWAY_PAGE.TITLE, href: ROUTES.DASHBOARD_ADMIN_PAYMENT_GATEWAYS },
];

export default function AdminPaymentGatewaysPageClient() {
  const { gateways, loading, error, fetchGatewayBySlug, updateGateway } = useAdminPaymentGateways();
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [form, setForm] = useState<UpdatePaymentGatewayDTO & { displayName?: string }>({
    secretKey: null,
    publicKey: null,
    webhookSecret: null,
    isDefault: true,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const openEdit = useCallback(
    async (gateway: string) => {
      setEditingGateway(gateway);
      const detail = await fetchGatewayBySlug(gateway);
      if (detail) {
        setForm({
          secretKey: null,
          publicKey: detail.publicKey ?? null,
          webhookSecret: null,
          isDefault: detail.isDefault,
          isActive: detail.isActive,
          displayName: detail.displayName,
        });
      } else {
        setForm({
          secretKey: null,
          publicKey: null,
          webhookSecret: null,
          isDefault: gateway === 'stripe',
          isActive: true,
          displayName: gateway === 'stripe' ? 'Stripe' : gateway === 'paypal' ? 'PayPal' : gateway,
        });
      }
    },
    [fetchGatewayBySlug]
  );

  const closeEdit = useCallback(() => {
    setEditingGateway(null);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<Element>) => {
      e?.preventDefault();
      if (!editingGateway) return;
      setSubmitting(true);
      try {
        const payload: UpdatePaymentGatewayDTO = {
          isDefault: form.isDefault,
          isActive: form.isActive,
        };
        if (form.publicKey != null) payload.publicKey = form.publicKey.trim() || null;
        if (form.secretKey != null && form.secretKey.trim() !== '') payload.secretKey = form.secretKey.trim();
        if (form.webhookSecret != null && form.webhookSecret.trim() !== '') payload.webhookSecret = form.webhookSecret.trim();
        await updateGateway(editingGateway, payload);
        toastManager.success(PAYMENT_GATEWAY_PAGE.SUCCESS_UPDATE);
        closeEdit();
      } catch (err: unknown) {
        toastManager.error(err instanceof Error ? err.message : PAYMENT_GATEWAY_PAGE.ERROR_UPDATE);
      } finally {
        setSubmitting(false);
      }
    },
    [editingGateway, form, updateGateway, closeEdit]
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={BREADCRUMBS} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            {PAYMENT_GATEWAY_PAGE.TITLE}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {PAYMENT_GATEWAY_PAGE.DESCRIPTION}
          </p>
        </div>
        <Link href={ROUTES.DASHBOARD_ADMIN}>
          <DashboardButton variant="bordered" size="sm">
            {BACK_TO_ADMIN_DASHBOARD_LABEL}
          </DashboardButton>
        </Link>
      </div>

      <section className="rounded-card border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          {PAYMENT_GATEWAY_PAGE.SECTION_GATEWAYS}
        </h2>
        {loading ? (
          <div className="h-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {gateways.map((g) => (
              <GatewayCard key={g.gateway} gateway={g} onEdit={() => openEdit(g.gateway)} />
            ))}
          </ul>
        )}
      </section>

      <BaseModal
        isOpen={editingGateway !== null}
        onClose={closeEdit}
        title={editingGateway ? `${PAYMENT_GATEWAY_PAGE.MODAL_TITLE}: ${form.displayName ?? editingGateway}` : PAYMENT_GATEWAY_PAGE.MODAL_TITLE}
        footer={
          <div className="flex justify-end gap-2">
            <DashboardButton variant="bordered" size="sm" onClick={closeEdit} disabled={submitting}>
              {PAYMENT_GATEWAY_PAGE.CANCEL}
            </DashboardButton>
            <DashboardButton variant="primary" size="sm" onClick={() => void handleSubmit(undefined)} disabled={submitting}>
              {submitting ? PAYMENT_GATEWAY_PAGE.SAVING : PAYMENT_GATEWAY_PAGE.SAVE}
            </DashboardButton>
          </div>
        }
      >
        {editingGateway && (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {editingGateway === 'stripe' && (
              <>
                <div>
                  <label htmlFor="pg-secret" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
                    {PAYMENT_GATEWAY_PAGE.MODAL_STRIPE_SECRET} (leave blank to keep existing)
                  </label>
                  <input
                    id="pg-secret"
                    type="password"
                    autoComplete="off"
                    value={form.secretKey ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, secretKey: e.target.value || null }))}
                    className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="sk_..."
                  />
                </div>
                <div>
                  <label htmlFor="pg-public" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
                    {PAYMENT_GATEWAY_PAGE.MODAL_STRIPE_PUBLIC}
                  </label>
                  <input
                    id="pg-public"
                    type="text"
                    autoComplete="off"
                    value={form.publicKey ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, publicKey: e.target.value || null }))}
                    className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="pk_..."
                  />
                </div>
                <div>
                  <label htmlFor="pg-webhook" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
                    {PAYMENT_GATEWAY_PAGE.MODAL_WEBHOOK_SECRET} (leave blank to keep existing)
                  </label>
                  <input
                    id="pg-webhook"
                    type="password"
                    autoComplete="off"
                    value={form.webhookSecret ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, webhookSecret: e.target.value || null }))}
                    className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="whsec_..."
                  />
                </div>
              </>
            )}
            {editingGateway === 'paypal' && (
              <>
                <div>
                  <label htmlFor="pg-public" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
                    {PAYMENT_GATEWAY_PAGE.MODAL_PAYPAL_PUBLIC}
                  </label>
                  <input
                    id="pg-public"
                    type="text"
                    autoComplete="off"
                    value={form.publicKey ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, publicKey: e.target.value || null }))}
                    className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Client ID"
                  />
                </div>
                <div>
                  <label htmlFor="pg-secret" className="mb-1 block text-2xs font-medium text-slate-600 dark:text-slate-400">
                    {PAYMENT_GATEWAY_PAGE.MODAL_PAYPAL_SECRET} (leave blank to keep existing)
                  </label>
                  <input
                    id="pg-secret"
                    type="password"
                    autoComplete="off"
                    value={form.secretKey ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, secretKey: e.target.value || null }))}
                    className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Client secret"
                  />
                </div>
              </>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{PAYMENT_GATEWAY_PAGE.MODAL_IS_DEFAULT}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{PAYMENT_GATEWAY_PAGE.MODAL_IS_ACTIVE}</span>
            </label>
          </form>
        )}
      </BaseModal>
    </div>
  );
}

function GatewayCard({
  gateway,
  onEdit,
}: {
  gateway: AdminPaymentGatewayDTO;
  onEdit: () => void;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-700/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
          <span className="font-medium text-slate-800 dark:text-slate-200">{gateway.displayName}</span>
          {gateway.isDefault && (
            <span className="rounded bg-primary-blue/10 px-1.5 py-0.5 text-2xs font-medium text-primary-blue dark:bg-navy-blue">
              {PAYMENT_GATEWAY_PAGE.CARD_DEFAULT_BADGE}
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400">
          {gateway.hasCredentials ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              {PAYMENT_GATEWAY_PAGE.CARD_CONFIGURED}
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden />
              {PAYMENT_GATEWAY_PAGE.CARD_NOT_CONFIGURED}
            </>
          )}
        </p>
      </div>
      <DashboardButton variant="bordered" size="sm" onClick={onEdit} aria-label={`${PAYMENT_GATEWAY_PAGE.BUTTON_EDIT} ${gateway.displayName}`}>
        {gateway.hasCredentials ? PAYMENT_GATEWAY_PAGE.BUTTON_EDIT : PAYMENT_GATEWAY_PAGE.BUTTON_CONFIGURE}
      </DashboardButton>
    </li>
  );
}
