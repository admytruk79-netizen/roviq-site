// scripts/optimize-images.mjs
// Regenerates the compressed WebP variants under public/images/ from a
// source file. Run after replacing/adding a source image:
//
//   npm install --no-save sharp
//   node scripts/optimize-images.mjs
//
// Each entry produces two files quality-compressed to WebP:
//   <outBase>.webp     — large variant, capped at LARGE_MAX_W, used as the
//                         img src and the widest srcset candidate.
//   <outBase>-sm.webp  — small variant, capped at SMALL_MAX_W, used as the
//                         narrow srcset candidate (mobile / half-width grids).
// Skip the "-sm" variant for images already narrower than SMALL_MAX_W —
// there's nothing smaller to generate.
//
// After running, update the RESPONSIVE_IMAGES map in src/layout.js with any
// new width/height values so mediaFull() emits the right srcset.

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..", "public", "images");

const LARGE_MAX_W = 1800;
const SMALL_MAX_W = 700;

// [source filename in public/images, output basename (no extension)]
const IMAGES = [
  ["roviq-hero-forecourt.png", "roviq-hero-forecourt"],
  ["roviq-forecourt-secondary.png", "roviq-forecourt-secondary"],
  ["roviq-ev-charging.png", "roviq-ev-charging"],
  ["cafe.png", "roviq-portable-cafe"],
  ["Oregon.png", "roviq-oregon"],
  ["roviq-interior-cafe.png", "roviq-interior-cafe"],
  ["roviq-motorcourt.png", "roviq-motorcourt"],
  ["roviq-swap-station.png", "roviq-swap-station"],
  ["roviq-relay-station.png", "roviq-relay-station"],
  ["file_00000000192c81fdab996945f5dc900d.png", "roviq-car-wash"],
  ["Roviq AI Auto Service Dashboard.png", "roviq-auto-service-dashboard"],
  ["Roviq Smart Mobility Network Mockup.png", "roviq-smart-mobility-network"],
  ["roviq-parts-locker.png", "roviq-parts-locker"],
  ["roviq-vehicle-local-app.png", "roviq-vehicle-local-app"],
  ["roviq-tow-dropoff.png", "roviq-tow-dropoff"]
];

async function run() {
  const report = [];
  for (const [srcName, outBase] of IMAGES) {
    const srcPath = path.join(SRC_DIR, srcName);
    if (!fs.existsSync(srcPath)) {
      report.push({ srcName, error: "MISSING SOURCE (already converted / removed?)" });
      continue;
    }
    const meta = await sharp(srcPath).metadata();

    const largePath = path.join(SRC_DIR, `${outBase}.webp`);
    const largeW = Math.min(meta.width, LARGE_MAX_W);
    const largeInfo = await sharp(srcPath)
      .resize({ width: largeW, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(largePath);

    let smallInfo = null;
    if (meta.width > SMALL_MAX_W) {
      const smallPath = path.join(SRC_DIR, `${outBase}-sm.webp`);
      smallInfo = await sharp(srcPath)
        .resize({ width: SMALL_MAX_W, withoutEnlargement: true })
        .webp({ quality: 74 })
        .toFile(smallPath);
    }

    report.push({
      srcName,
      outBase,
      large: `${largeInfo.width}x${largeInfo.height}, ${largeInfo.size}B`,
      small: smallInfo ? `${smallInfo.width}x${smallInfo.height}, ${smallInfo.size}B` : "skipped (source already <= SMALL_MAX_W)"
    });
  }
  console.log(JSON.stringify(report, null, 2));
}

run().catch((e) => { console.error(e); process.exitCode = 1; });
