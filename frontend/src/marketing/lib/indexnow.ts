import { getPublicSiteUrl } from "@/marketing/lib/public-site-url";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

export function getIndexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && key.length >= 8 ? key : null;
}

export function getIndexNowKeyPath(): string | null {
  const key = getIndexNowKey();
  return key ? `/${key}.txt` : null;
}

export function getIndexNowKeyLocation(): string | null {
  const key = getIndexNowKey();
  if (!key) return null;

  const base = getPublicSiteUrl().replace(/\/$/, "");
  return `${base}/${key}.txt`;
}

export function isIndexNowKeyRequest(pathname: string): boolean {
  const key = getIndexNowKey();
  return Boolean(key && pathname === `/${key}.txt`);
}

type IndexNowSubmitResult = {
  ok: boolean;
  status: number;
  submitted: number;
};

function chunkUrls(urls: string[]): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_REQUEST));
  }
  return chunks;
}

/**
 * Notify Bing, Yandex, and other IndexNow participants that URLs were added or updated.
 */
export async function submitIndexNowUrls(urls: readonly string[]): Promise<IndexNowSubmitResult> {
  const key = getIndexNowKey();
  const keyLocation = getIndexNowKeyLocation();

  if (!key || !keyLocation) {
    return { ok: false, status: 0, submitted: 0 };
  }

  const siteUrl = new URL(getPublicSiteUrl());
  const host = siteUrl.host;
  const uniqueUrls = [...new Set(urls.map((url) => url.trim()).filter((url) => url.length > 0))];

  if (uniqueUrls.length === 0) {
    return { ok: true, status: 200, submitted: 0 };
  }

  let lastStatus = 200;

  for (const urlList of chunkUrls(uniqueUrls)) {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList,
      }),
    });

    lastStatus = response.status;

    // 200 = accepted, 202 = accepted and will be processed later
    if (response.status !== 200 && response.status !== 202) {
      return { ok: false, status: response.status, submitted: 0 };
    }
  }

  return { ok: true, status: lastStatus, submitted: uniqueUrls.length };
}
