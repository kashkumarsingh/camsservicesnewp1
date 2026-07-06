import { getApiBaseUrl } from './apiBaseUrl';
import { getAuthTokenFromProvider } from './auth/authTokenProvider';

/**
 * Download a file from an authenticated API route (returns raw stream, not JSON envelope).
 */
export async function downloadAuthenticatedFile(path: string, fileName: string): Promise<void> {
  const url = `${getApiBaseUrl()}${path}`;
  const token = getAuthTokenFromProvider();
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
    throw new Error('Failed to download file.');
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
