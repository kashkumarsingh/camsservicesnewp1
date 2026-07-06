'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { ROUTES } from '@/shared/utils/routes';
import {
  OPERATIONAL_DOCUMENT_CATEGORY_LABELS,
  OPERATIONAL_DOCUMENT_CATEGORIES,
  type OperationalDocumentCategory,
} from '@/dashboard/utils/operationalDocumentConstants';
import {
  trainerOperationalDocumentRepository,
  type TrainerOperationalDocumentItem,
} from '@/infrastructure/http/trainer/TrainerOperationalDocumentRepository';
import { Download, FileText, Loader2, AlertTriangle } from 'lucide-react';

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

export function TrainerResourcesPageClient() {
  const [documents, setDocuments] = useState<TrainerOperationalDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainerOperationalDocumentRepository.list();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = useMemo(() => {
    if (!categoryFilter) return documents;
    return documents.filter((doc) => doc.category === categoryFilter);
  }, [documents, categoryFilter]);

  const groupedDocuments = useMemo(() => {
    const groups = new Map<OperationalDocumentCategory, TrainerOperationalDocumentItem[]>();
    for (const doc of filteredDocuments) {
      const list = groups.get(doc.category) ?? [];
      list.push(doc);
      groups.set(doc.category, list);
    }
    return groups;
  }, [filteredDocuments]);

  const incidentProcedureDoc = useMemo(
    () => documents.find((doc) => doc.slug === 'incident-reporting-procedure'),
    [documents]
  );

  const handleDownload = async (doc: TrainerOperationalDocumentItem) => {
    setDownloadingId(doc.id);
    setError(null);
    try {
      await trainerOperationalDocumentRepository.download(doc.id, doc.file_name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Trainer', href: ROUTES.DASHBOARD_TRAINER },
            { label: 'Resources' },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_TRAINER}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Back to overview
            </Link>
          }
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Resources
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Internal policies and procedures for transport, safeguarding, lone working, and incident
            reporting. Download and keep these available for your sessions.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Need to report an incident?</p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Use the incident report form on your dashboard. Follow the incident reporting procedure below for guidance.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={ROUTES.DASHBOARD_TRAINER}
              className="inline-flex items-center justify-center rounded-lg bg-cams-primary px-3 py-2 text-sm font-semibold text-white hover:bg-cams-secondary"
            >
              Report from dashboard
            </Link>
            {incidentProcedureDoc && (
              <button
                type="button"
                onClick={() => handleDownload(incidentProcedureDoc)}
                disabled={downloadingId === incidentProcedureDoc.id}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                {downloadingId === incidentProcedureDoc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="h-4 w-4" aria-hidden />
                )}
                Incident procedure
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="flex justify-end">
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
      ) : filteredDocuments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <FileText className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            No resources published yet
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your CAMS admin team will publish documents here when they are ready.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {OPERATIONAL_DOCUMENT_CATEGORIES.map((category) => {
            const items = groupedDocuments.get(category);
            if (!items?.length) return null;
            return (
              <div
                key={category}
                className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
              >
                <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-300">
                  {OPERATIONAL_DOCUMENT_CATEGORY_LABELS[category]}
                </h2>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Version {doc.version} · Updated {formatDate(doc.updated_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        {downloadingId === doc.id ? 'Downloading…' : 'Download'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
