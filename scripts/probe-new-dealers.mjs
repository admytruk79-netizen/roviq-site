// Read-only: which in-area dealers expose new crew-cab truck inventory we can read.
import { readSearchServiceConfig } from "../src/inventory.js";
const CLAUDE_UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const PAGES = [
  ["kendall-ford-vancouver", "https://www.kendallfordvancouver.com/new-vehicles/"],
  ["damerow-ford", "https://www.damerowford.com/new-vehicles/"],
  ["northside-ford", "https://www.northsideford.net/new-vehicles/"],
  ["courtesy-ford", "https://www.courtesyford.com/new-vehicles/"],
  ["carr-chevrolet", "https://www.carrchevrolet.com/new-inventory/index.htm"],
  ["ron-tonkin-chevrolet", "https://www.tonkinchevrolet.com/new-inventory/index.htm"],
  ["beaverton-gmc", "https://www.beavertongmc.com/searchnew.aspx"],
  ["carr-buick-gmc", "https://www.carrbuickgmc.com/searchnew.aspx"]
];
for (const [id, url] of PAGES) {
  for (const ua of [CLAUDE_UA, BROWSER_UA]) {
    const r = await fetch(url, { headers: { "user-agent": ua, accept: "text/html" }, signal: AbortSignal.timeout(20000) }).catch(e => ({ ok: false, status: e.name }));
    const html = r.ok ? await r.text() : "";
    const cfg = readSearchServiceConfig(html);
    let extra = "";
    if (cfg) {
      const s = await fetch(cfg.search + "/search", { method: "POST", headers: { "content-type": "application/json", "x-api-key": cfg.apiKey },
        body: JSON.stringify({ page: 1, perPage: 100, filters: { status: cfg.statuses, type_slug: ["New"] }, requestedFields: cfg.requestedFields }) }).catch(() => null);
      const body = s?.ok ? await s.json() : null;
      const list = body?.data?.listings || [];
      const trucks = list.filter(l => /F-?150|F-?250|Silverado|Sierra/i.test(l.model) && /crew/i.test(l.styles?.style_name || ""));
      extra = ` searchService new=${list.length} crewTrucks(page1)=${trucks.length} total=${body?.data?.total ?? body?.data?.pagination?.total ?? "?"}`;
    }
    console.log(`${id.padEnd(22)} ${ua === CLAUDE_UA ? "claudeUA " : "browserUA"} ${r.status} len=${html.length} srpVehicle=${(html.match(/srpVehicle/g) || []).length}${extra}`);
    if (r.ok) break;
  }
}
