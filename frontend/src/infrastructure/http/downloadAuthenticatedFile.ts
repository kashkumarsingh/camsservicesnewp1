import { getApiBaseUrl } from './apiBaseUrl';
import { getAuthToken } from './auth/authTokenProvider';
import { fileNameFromContentDisposition } from '@/dashboard/utils/operationalDocumentUtils';

/**
 * Download a file from an authenticated API route (returns raw stream, not JSON envelope).
 * If the API redirects to an external URL (e.g. Google Drive), opens it in a new tab.
 */
export async function downloadAuthenticatedFile(path: string, fileName: string): Promise<void> {
  const url = `${getApiBaseUrl({ serverSide: false })}${path}`;
  const token = getAuthToken();
  const headers: HeadersInit = { Accept: '*/*' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers,
    redirect: 'follow',
  });

  if (response.redirected && response.url && !response.url.startsWith(getApiBaseUrl({ serverSide: false }))) {
    window.open(response.url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (!response.ok) {
    let message = 'Failed to download file.';
    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const body = (await response.json()) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } else if (response.status === 404) {
        message = 'Document file not found on the server.';
      }
    } catch {
      // Keep default message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const serverFileName = fileNameFromContentDisposition(response.headers.get('Content-Disposition'));
  const downloadName =
    serverFileName ||
    (fileName?.trim() && fileName.trim() !== 'undefined' ? fileName.trim() : 'document');
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
