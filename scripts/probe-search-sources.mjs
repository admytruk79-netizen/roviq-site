// Read-only probe: lists what each search-service dealer source would publish right now.
import { SOURCE_PLUGINS, discoverSearchService, querySearchService } from "../src/inventory.js";

for (const source of SOURCE_PLUGINS.filter(s => s.searchService)) {
  const raw = await querySearchService(source, { type_slug: source.searchService.typeSlugs }, fetch, 10).catch(e => String(e));
  if (!Array.isArray(raw)) { console.log(`${source.id}: search failed ${raw ?? ""}`); continue; }
  const tally = {};
  for (const l of raw) {
    const key = `${l.type} | ${l.make} ${l.model} | ${l.styles?.style_name ?? l.trim ?? "?"}`;
    tally[key] = (tally[key] || 0) + 1;
  }
  console.log(`${source.id}: ${raw.length} raw listings`);
  for (const [k, n] of Object.entries(tally).filter(([k]) => /F-?150|F-?250|Silverado|Sierra/i.test(k))) console.log(`  raw ${n}x ${k}`);
  if (raw[0]) console.log("  sample keys:", Object.keys(raw[0]).join(","), "| type:", raw[0].type, "| mileage:", raw[0].mileage, "| vdp:", raw[0].vdp_url);
  const r = await discoverSearchService(source);
  console.log(`${source.id}: ok=${r.ok} matches=${r.found?.length ?? 0}`);
  for (const { hints } of r.found || []) {
    console.log(`  ${hints.year} ${hints.make} ${hints.model} ${hints.trim} | ${hints.mileageMi} mi | $${hints.askingPrice ?? "?"} | ${hints.vin}`);
  }
}
