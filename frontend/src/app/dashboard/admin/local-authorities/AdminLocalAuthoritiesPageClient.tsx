'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Building2, Download, FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { Breadcrumbs } from '@/components/dashboard/universal';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import {
  LA_AGREEMENT_STATUSES,
  LA_AGREEMENT_STATUS_LABELS,
  LA_AGREEMENT_TEMPLATE_SLUG,
  formatLaAgreementStatus,
  laAgreementStatusBadgeClass,
  type LaAgreementStatus,
} from '@/dashboard/utils/laAgreementConstants';
import {
  adminLocalAuthorityAgreementRepository,
  type LocalAuthorityAgreementItem,
} from '@/infrastructure/http/admin/AdminLocalAuthorityAgreementRepository';
import { adminOperationalDocumentRepository } from '@/infrastructure/http/admin/AdminOperationalDocumentRepository';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const emptyForm = {
  localAuthorityName: '',
  effectiveDate: '',
  expiresAt: '',
  status: 'draft' as LaAgreementStatus,
  contactName: '',
  contactEmail: '',
  notes: '',
};

export function AdminLocalAuthoritiesPageClient() {
  const searchParams = useSearchParams();
  const attentionOnly = searchParams.get('attention') === '1';
  const [rows, setRows] = useState<LocalAuthorityAgreementItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<LocalAuthorityAgreementItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const fetchAgreements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminLocalAuthorityAgreementRepository.list({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
        limit: 100,
      });
      setRows(result.agreements);
      setTotalCount(result.totalCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load agreements');
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    setSelectedId(id);
    setShowCreate(false);
    try {
      const agreement = await adminLocalAuthorityAgreementRepository.get(id);
      setDetail(agreement);
      setForm({
        localAuthorityName: agreement.localAuthorityName,
        effectiveDate: agreement.effectiveDate ?? '',
        expiresAt: agreement.expiresAt ?? '',
        status: (agreement.status as LaAgreementStatus) || 'draft',
        contactName: agreement.contactName ?? '',
        contactEmail: agreement.contactEmail ?? '',
        notes: agreement.notes ?? '',
      });
      setSignedFile(null);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.localAuthorityName.trim()) {
      setError('Local authority name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await adminLocalAuthorityAgreementRepository.create({
        localAuthorityName: form.localAuthorityName.trim(),
        effectiveDate: form.effectiveDate || undefined,
        expiresAt: form.expiresAt || undefined,
        status: form.status,
        contactName: form.contactName.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      await fetchAgreements();
      setShowCreate(false);
      await loadDetail(created.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create agreement');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await adminLocalAuthorityAgreementRepository.update(selectedId, {
        localAuthorityName: form.localAuthorityName.trim(),
        effectiveDate: form.effectiveDate || null,
        expiresAt: form.expiresAt || null,
        status: form.status,
        contactName: form.contactName.trim() || null,
        contactEmail: form.contactEmail.trim() || null,
        notes: form.notes.trim() || null,
      });
      if (signedFile) {
        await adminLocalAuthorityAgreementRepository.uploadSignedDocument(selectedId, signedFile);
        setSignedFile(null);
      }
      await fetchAgreements();
      await loadDetail(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save agreement');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadOnly = async () => {
    if (!selectedId || !signedFile) return;
    setUploading(true);
    setError(null);
    try {
      await adminLocalAuthorityAgreementRepository.uploadSignedDocument(selectedId, signedFile);
      setSignedFile(null);
      await fetchAgreements();
      await loadDetail(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSigned = async () => {
    if (!detail?.hasSignedDocument) return;
    try {
      await adminLocalAuthorityAgreementRepository.downloadSignedDocument(
        detail.id,
        detail.signedFileName ?? `la-agreement-${detail.id}.pdf`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleDownloadTemplate = async () => {
    setTemplateDownloading(true);
    setError(null);
    try {
      const docs = await adminOperationalDocumentRepository.list('legal');
      const template = docs.find((d) => d.slug === LA_AGREEMENT_TEMPLATE_SLUG);
      if (!template) {
        setError(
          'Template not found in Compliance docs. Run operational-documents:seed or upload the Local Authority Data Sharing Agreement template.'
        );
        return;
      }
      await adminOperationalDocumentRepository.download(template.id, template.file_name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download template');
    } finally {
      setTemplateDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !detail) return;
    if (!window.confirm(`Delete agreement for ${detail.localAuthorityName}? This cannot be undone.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminLocalAuthorityAgreementRepository.delete(selectedId);
      setSelectedId(null);
      setDetail(null);
      setForm(emptyForm);
      await fetchAgreements();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete agreement');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.status === 'draft' ||
          (r.status === 'active' && !r.hasSignedDocument) ||
          (r.expiresAt && new Date(r.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      ).length,
    [rows]
  );

  const displayRows = useMemo(() => {
    if (!attentionOnly) return rows;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 30);
    return rows.filter((r) => {
      if (r.status === 'draft') return true;
      if (r.status === 'active' && !r.hasSignedDocument) return true;
      if (r.expiresAt) {
        const exp = new Date(r.expiresAt);
        return exp <= cutoff;
      }
      return false;
    });
  }, [rows, attentionOnly]);

  const openCreate = () => {
    setShowCreate(true);
    setSelectedId(null);
    setDetail(null);
    setForm(emptyForm);
    setSignedFile(null);
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Local authority agreements' },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cams-primary" aria-hidden />
              Local authority agreements
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track signed data sharing agreements per local authority. Use the template from Compliance docs, then upload the signed copy here.
            </p>
          </div>
          <DashboardButton type="button" variant="primary" size="sm" icon={<Plus size={16} />} onClick={openCreate}>
            New agreement
          </DashboardButton>
        </div>
      </header>

      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Agreement template</p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Download the blank Local Authority Data Sharing Agreement, complete it with the authority, then upload the signed PDF to the record.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={templateDownloading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              {templateDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Download template
            </button>
            <Link
              href={ROUTES.DASHBOARD_ADMIN_DOCUMENTS}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-cams-primary hover:underline"
            >
              Compliance docs
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search authority or contact…"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Search agreements"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {LA_AGREEMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LA_AGREEMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {pendingCount > 0 && !attentionOnly && (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {pendingCount} agreement{pendingCount !== 1 ? 's' : ''} need attention (draft, unsigned, or expiring).
        </p>
      )}

      {attentionOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <span>Showing agreements that are draft, unsigned, or expiring within 30 days.</span>
          <Link href={ROUTES.DASHBOARD_ADMIN_LOCAL_AUTHORITIES} className="font-medium text-cams-primary hover:underline">
            Show all agreements
          </Link>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
            </div>
          ) : displayRows.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {attentionOnly
                ? 'No agreements need attention in this view.'
                : 'No agreements yet. Create a record when you start contracting with a new local authority.'}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Authority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Effective</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Signed</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {displayRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => loadDetail(row.id)}
                        className={`cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          selectedId === row.id ? 'ring-2 ring-inset ring-cams-primary' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {row.localAuthorityName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${laAgreementStatusBadgeClass(row.status)}`}>
                            {formatLaAgreementStatus(row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(row.effectiveDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {row.hasSignedDocument ? 'On file' : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {row.contactName ?? row.contactEmail ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Showing {displayRows.length} of {totalCount} agreements
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[360px]">
            {showCreate ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">New agreement</h2>
                {renderFormFields(form, setForm)}
                <div className="flex gap-2">
                  <DashboardButton type="submit" variant="primary" size="sm" disabled={saving}>
                    {saving ? 'Creating…' : 'Create record'}
                  </DashboardButton>
                  <DashboardButton type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                    Cancel
                  </DashboardButton>
                </div>
              </form>
            ) : !selectedId ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                Select an agreement or create a new record for a local authority.
              </p>
            ) : detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-hidden />
              </div>
            ) : detail ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {detail.localAuthorityName}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Created {formatDate(detail.createdAt)}
                      {detail.createdByName ? ` by ${detail.createdByName}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${laAgreementStatusBadgeClass(detail.status)}`}>
                    {formatLaAgreementStatus(detail.status)}
                  </span>
                </div>

                {renderFormFields(form, setForm)}

                <div className="border-t border-slate-200 pt-4 dark:border-slate-700 space-y-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Signed document</p>
                  {detail.hasSignedDocument && (
                    <button
                      type="button"
                      onClick={handleDownloadSigned}
                      className="inline-flex items-center gap-2 text-sm font-medium text-cams-primary hover:underline"
                    >
                      <Download size={14} aria-hidden />
                      {detail.signedFileName ?? 'Download signed copy'}
                    </button>
                  )}
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {detail.hasSignedDocument ? 'Replace signed PDF' : 'Upload signed PDF'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      onChange={(e) => setSignedFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium dark:text-slate-300 dark:file:bg-slate-800"
                    />
                  </div>
                  {signedFile && (
                    <DashboardButton
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      onClick={handleUploadOnly}
                      disabled={uploading}
                    >
                      Upload only
                    </DashboardButton>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <DashboardButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </DashboardButton>
                  <DashboardButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </DashboardButton>
                </div>
              </div>
            ) : (
              <p className="text-sm text-rose-600 dark:text-rose-400">Could not load agreement details.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderFormFields(
  form: typeof emptyForm,
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>
) {
  return (
    <>
      <div>
        <label htmlFor="la-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Local authority name <span className="text-rose-600">*</span>
        </label>
        <input
          id="la-name"
          type="text"
          required
          value={form.localAuthorityName}
          onChange={(e) => setForm((f) => ({ ...f, localAuthorityName: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          placeholder="e.g. Birmingham City Council"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="la-effective" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Effective date
          </label>
          <input
            id="la-effective"
            type="date"
            value={form.effectiveDate}
            onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label htmlFor="la-expires" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Expires
          </label>
          <input
            id="la-expires"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div>
        <label htmlFor="la-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Status
        </label>
        <select
          id="la-status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as LaAgreementStatus }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          {LA_AGREEMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LA_AGREEMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="la-contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            LA contact name
          </label>
          <input
            id="la-contact-name"
            type="text"
            value={form.contactName}
            onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label htmlFor="la-contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            LA contact email
          </label>
          <input
            id="la-contact-email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div>
        <label htmlFor="la-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Notes
        </label>
        <textarea
          id="la-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          placeholder="Commissioning reference, renewal reminders, etc."
        />
      </div>
    </>
  );
}
