'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/dashboard/universal';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import {
  OPERATIONAL_DOCUMENT_AUDIENCE_LABELS,
  OPERATIONAL_DOCUMENT_AUDIENCES,
  OPERATIONAL_DOCUMENT_CATEGORIES,
  OPERATIONAL_DOCUMENT_CATEGORY_LABELS,
  type OperationalDocumentAudience,
  type OperationalDocumentCategory,
} from '@/dashboard/utils/operationalDocumentConstants';
import {
  adminOperationalDocumentRepository,
  type OperationalDocumentItem,
} from '@/infrastructure/http/admin/AdminOperationalDocumentRepository';
import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react';

function formatDate(iso?: string): string {
  if (!iso) return 'Not set';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const defaultUploadForm = {
  title: '',
  category: 'safeguarding' as OperationalDocumentCategory,
  audience: 'all' as OperationalDocumentAudience,
  version: '1.0',
  isPublished: true,
  externalUrl: '',
};

export function AdminOperationalDocumentsPageClient() {
  const [documents, setDocuments] = useState<OperationalDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState(defaultUploadForm);
  const [uploading, setUploading] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminOperationalDocumentRepository.list(
        categoryFilter || undefined
      );
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const publishedCount = useMemo(
    () => documents.filter((doc) => doc.isPublished).length,
    [documents]
  );

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFile) {
      setError('Choose a PDF or Word file to upload.');
      return;
    }
    if (!uploadForm.title.trim()) {
      setError('Enter a document title.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await adminOperationalDocumentRepository.upload({
        file: uploadFile,
        title: uploadForm.title.trim(),
        category: uploadForm.category,
        audience: uploadForm.audience,
        version: uploadForm.version.trim() || '1.0',
        isPublished: uploadForm.isPublished,
        externalUrl: uploadForm.externalUrl.trim() || undefined,
      });
      setUploadFile(null);
      setUploadForm(defaultUploadForm);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePublished = async (doc: OperationalDocumentItem) => {
    setActingId(doc.id);
    setError(null);
    try {
      await adminOperationalDocumentRepository.update(doc.id, {
        isPublished: !doc.isPublished,
      });
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (doc: OperationalDocumentItem) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    setActingId(doc.id);
    setError(null);
    try {
      await adminOperationalDocumentRepository.delete(doc.id);
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setActingId(null);
    }
  };

  const handleDownload = async (doc: OperationalDocumentItem) => {
    setActingId(doc.id);
    setError(null);
    try {
      await adminOperationalDocumentRepository.download(doc.id, doc.fileName, {
        title: doc.title,
        slug: doc.slug,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setActingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Compliance documents' },
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
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Compliance documents
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Internal policies and procedures for trainers and admin. Published trainer-facing
            documents appear under Trainer → Resources.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
          <Upload className="h-4 w-4" aria-hidden />
          Upload document
        </h2>
        <form onSubmit={handleUpload} className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label htmlFor="doc-title" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Title
              </label>
              <input
                id="doc-title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                placeholder="e.g. Lone Working Policy"
              />
            </div>
            <div>
              <label htmlFor="doc-file" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                File (PDF or Word)
              </label>
              <input
                id="doc-file"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="doc-category" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Category
                </label>
                <select
                  id="doc-category"
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      category: e.target.value as OperationalDocumentCategory,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  {OPERATIONAL_DOCUMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {OPERATIONAL_DOCUMENT_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="doc-audience" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Audience
                </label>
                <select
                  id="doc-audience"
                  value={uploadForm.audience}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      audience: e.target.value as OperationalDocumentAudience,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  {OPERATIONAL_DOCUMENT_AUDIENCES.map((audience) => (
                    <option key={audience} value={audience}>
                      {OPERATIONAL_DOCUMENT_AUDIENCE_LABELS[audience]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="doc-version" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Version
                </label>
                <input
                  id="doc-version"
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, version: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
              <label className="mt-6 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={uploadForm.isPublished}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, isPublished: e.target.checked }))
                  }
                />
                Publish immediately
              </label>
            </div>
            <div>
              <label htmlFor="doc-external-url" className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                External link (optional)
              </label>
              <input
                id="doc-external-url"
                type="url"
                value={uploadForm.externalUrl}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, externalUrl: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Optional Google Drive or public URL used when no server copy is available.
              </p>
            </div>
            <DashboardButton type="submit" variant="primary" size="sm" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload document'}
            </DashboardButton>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {documents.length} document{documents.length !== 1 ? 's' : ''} · {publishedCount} published
        </p>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {OPERATIONAL_DOCUMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {OPERATIONAL_DOCUMENT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <FileText className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">No documents yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Upload a policy or run <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">php artisan operational-documents:seed</code> on the backend.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Title</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Category</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Audience</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Version</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Updated</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{doc.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {OPERATIONAL_DOCUMENT_CATEGORY_LABELS[doc.category]}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {OPERATIONAL_DOCUMENT_AUDIENCE_LABELS[doc.audience]}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{doc.version}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(doc)}
                      disabled={actingId === doc.id}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        doc.isPublished
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {doc.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(doc.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        disabled={actingId === doc.id}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        aria-label={`Download ${doc.title}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        disabled={actingId === doc.id}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        aria-label={`Delete ${doc.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
