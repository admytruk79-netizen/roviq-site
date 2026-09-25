// build-check.js — run this before every deploy, fail the build if it fails
import { STATION_IMAGES } from "./content/station-images.js";
import fs from "fs";

let failed = false;

for (const [key, { file, section }] of Object.entries(STATION_IMAGES)) {
  const localPath = "./public" + file;
  if (!fs.existsSync(localPath)) {
    console.error(`MISSING FILE: "${key}" -> ${file} (expected in: ${section})`);
    failed = true;
  }
}

// Station placement uses the station manifest. Other pages can use their own
// existing assets, but every referenced public image must exist.
const manifestFiles = new Set(Object.values(STATION_IMAGES).map((v) => v.file));
const pageFiles = fs.readdirSync("./src/pages").filter((f) => f.endsWith(".js"));
for (const pageFile of pageFiles) {
  const src = fs.readFileSync(`./src/pages/${pageFile}`, "utf8");
  const matches = src.matchAll(/\/images\/[a-zA-Z0-9_\-./]+\.(?:png|jpg|jpeg|webp)/g);
  for (const [hit] of matches) {
    if (!fs.existsSync(`./public${hit}`) || (pageFile === "station.js" && !manifestFiles.has(hit))) {
      console.error(`INVALID IMAGE REFERENCE: "${hit}" in src/pages/${pageFile}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\nbuild-check failed — fix the issues above before deploying.");
  process.exitCode = 1;
} else {
  console.log(`build-check passed — ${Object.keys(STATION_IMAGES).length} station images and page image references verified.`);
}
