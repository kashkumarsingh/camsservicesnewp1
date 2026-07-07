import type { OperationalDocumentItem } from '@/infrastructure/http/admin/AdminOperationalDocumentRepository';

type RawOperationalDocument = OperationalDocumentItem & {
  file_name?: string;
  mime_type?: string;
  is_published?: boolean;
  internal_only?: boolean;
  external_url?: string | null;
  has_download?: boolean;
  uploaded_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
};

/** API responses use camelCase; tolerate legacy snake_case fields from older payloads. */
export function normalizeOperationalDocument(doc: RawOperationalDocument): OperationalDocumentItem {
  const fileName =
    doc.fileName?.trim() ||
    doc.file_name?.trim() ||
    guessOperationalDocumentFileName(doc);

  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    audience: doc.audience,
    fileName,
    mimeType: doc.mimeType ?? doc.mime_type,
    version: doc.version,
    isPublished: doc.isPublished ?? doc.is_published,
    internalOnly: doc.internalOnly ?? doc.internal_only,
    externalUrl: doc.externalUrl ?? doc.external_url ?? null,
    hasDownload: doc.hasDownload ?? doc.has_download,
    uploadedByName: doc.uploadedByName ?? doc.uploaded_by_name ?? null,
    createdAt: doc.createdAt ?? doc.created_at,
    updatedAt: doc.updatedAt ?? doc.updated_at,
  };
}

export function getOperationalDocumentDownloadName(
  doc: Pick<OperationalDocumentItem, 'fileName' | 'title' | 'slug'>
): string {
  const fileName = doc.fileName?.trim();
  if (fileName && fileName !== 'undefined') {
    return fileName;
  }

  const fromTitle = doc.title?.trim();
  if (fromTitle) {
    return fromTitle.endsWith('.docx') || fromTitle.endsWith('.pdf')
      ? fromTitle
      : `${fromTitle}.docx`;
  }

  return doc.slug ? `${doc.slug}.docx` : 'document';
}

function guessOperationalDocumentFileName(
  doc: Pick<RawOperationalDocument, 'title' | 'slug'>
): string {
  return getOperationalDocumentDownloadName({
    fileName: '',
    title: doc.title,
    slug: doc.slug,
  });
}

export function fileNameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // Fall through to basic filename.
    }
  }

  const basicMatch = header.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1]?.trim() || null;
}
