export function getPublicApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configured && configured.length > 0) {
    return configured.replace(/\/+$/, "");
  }

  return "http://localhost:14000";
}

export async function fetchPublicApiJson<T>(path: string): Promise<T> {
  const baseUrl = getPublicApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Public API request failed (${response.status}) for ${url}`);
  }

  return (await response.json()) as T;
}
