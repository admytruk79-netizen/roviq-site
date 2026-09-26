// Read-only probe: lists what each search-service dealer source would publish right now.
import { SOURCE_PLUGINS, discoverSearchService } from "../src/inventory.js";

for (const source of SOURCE_PLUGINS.filter(s => s.searchService)) {
  const r = await discoverSearchService(source).catch(e => ({ ok: false, error: String(e) }));
  console.log(`${source.id}: ok=${r.ok} matches=${r.found?.length ?? 0}${r.error ? " " + r.error : ""}`);
  for (const { hints } of r.found || []) {
    console.log(`  ${hints.year} ${hints.make} ${hints.model} ${hints.trim} | ${hints.mileageMi} mi | $${hints.askingPrice ?? "?"} | ${hints.vin}`);
  }
}
