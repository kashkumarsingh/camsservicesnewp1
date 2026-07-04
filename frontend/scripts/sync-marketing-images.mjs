#!/usr/bin/env node
/**
 * Downloads marketing images into frontend/public/images/ so the site serves
 * static assets instead of remote stock APIs at runtime.
 *
 * Usage: node scripts/sync-marketing-images.mjs
 *        node scripts/sync-marketing-images.mjs --from-production
 */
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicImagesDir = path.resolve(__dirname, "../public/images");
const ogImagesDir = path.resolve(__dirname, "../public/og-images");
const productionBase = "https://www.camsservices.co.uk";

/** Programme covers (already on production; re-download with --from-production). */
const PROGRAMME_IMAGES = [
  "sports-support-programme",
  "fitness-and-wellbeing",
  "community-access-and-transport-services",
  "behavioural-management-and-conflict-resolution",
  "mentoring-and-coaching",
  "family-support-service",
  "sen-and-education-support",
];

/** One-off page heroes (sourced from Unsplash CDN, saved locally). */
const REMOTE_SOURCES = {
  "careers-hero": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&fit=crop&q=85",
  "become-a-trainer-promo":
    "https://images.unsplash.com/photo-1575800542980-4753fe7fd72e?w=1400&fit=crop&q=85",
};

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed ${url}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
  console.log(`  ✓ ${path.basename(dest)}`);
}

async function main() {
  const fromProduction = process.argv.includes("--from-production");
  await mkdir(publicImagesDir, { recursive: true });
  await mkdir(ogImagesDir, { recursive: true });

  console.log("Syncing programme images…");
  for (const id of PROGRAMME_IMAGES) {
    const dest = path.join(publicImagesDir, `${id}.jpg`);
    const url = fromProduction
      ? `${productionBase}/images/${id}.jpg`
      : `${productionBase}/images/${id}.jpg`;
    await download(url, dest);
  }

  console.log("Syncing page-specific heroes…");
  for (const [id, url] of Object.entries(REMOTE_SOURCES)) {
    await download(url, path.join(publicImagesDir, `${id}.jpg`));
  }

  console.log("Deriving shared fallbacks…");
  await copyFile(
    path.join(publicImagesDir, "mentoring-and-coaching.jpg"),
    path.join(publicImagesDir, "og-default.jpg")
  );
  console.log("  ✓ og-default.jpg");
  await copyFile(
    path.join(publicImagesDir, "sports-support-programme.jpg"),
    path.join(ogImagesDir, "og-image.jpg")
  );
  console.log("  ✓ og-images/og-image.jpg");

  console.log(`\nDone. Images are in:\n  ${publicImagesDir}\n  ${ogImagesDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
