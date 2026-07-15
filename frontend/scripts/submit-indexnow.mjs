#!/usr/bin/env node
/**
 * Ping IndexNow with all sitemap URLs after deploy.
 * Requires INDEXNOW_KEY on the server and NEXT_REVALIDATE_SECRET locally.
 *
 * Usage:
 *   NEXT_REVALIDATE_SECRET=... SITE_URL=https://www.camsservices.co.uk npm run indexnow:submit
 */

const siteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.camsservices.co.uk').replace(
  /\/$/,
  ''
);
const secret = process.env.NEXT_REVALIDATE_SECRET ?? process.env.INDEXNOW_SUBMIT_SECRET;

if (!secret) {
  console.error('Set NEXT_REVALIDATE_SECRET or INDEXNOW_SUBMIT_SECRET.');
  process.exit(1);
}

const endpoint = `${siteUrl}/api/indexnow/submit`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret, sitemap: true }),
});

const body = await response.text();
console.log(response.status, body);

if (!response.ok) {
  process.exit(1);
}
