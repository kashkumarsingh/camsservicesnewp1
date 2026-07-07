import { getApiBaseUrl } from './apiBaseUrl';
import { getAuthToken } from './auth/authTokenProvider';

/**
 * Download a file from an authenticated API route (returns raw stream, not JSON envelope).
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
  });

  if (!response.ok) {
    let message = 'Failed to download file.';
    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const body = (await response.json()) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } else if (response.status === 404) {
        message =
          'Document file not found on the server. Re-run php artisan operational-documents:seed on Railway if files were lost after a redeploy.';
      }
    } catch {
      // Keep default message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
