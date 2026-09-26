// Read-only structure probe for a DealerOn new-inventory page (diagnostics only).
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const urls = [
  "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%201500",
  "https://www.beavertongmc.com/searchnew.aspx"
];
for (const url of urls) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } }).catch(e => ({ ok: false, status: String(e) }));
  console.log(`\n== ${url} -> ${r.status}`);
  if (!r.ok) continue;
  const html = await r.text();
  console.log("length", html.length);
  const count = re => (html.match(re) || []).length;
  for (const [k, re] of Object.entries({
    "data-vin": /data-vin=/gi, "data-dotagging": /data-dotagging/gi, "data-price": /data-price/gi,
    "vehicle-card": /vehicle-card/gi, "srpVehicle": /srpVehicle/gi, "application/ld+json": /application\/ld\+json/gi,
    "/new-": /href="[^"]*\/new-[^"]*"/gi, "searchnew.aspx?pt=": /searchnew\.aspx\?[^"']*pt=\d/gi,
    "totalCount": /totalCount|TotalCount|resultsCount|vehicleCount/g
  })) console.log(k, count(re));
  const vinIdx = html.search(/data-vin=/i);
  if (vinIdx > 0) console.log("--- around first data-vin ---\n" + html.slice(Math.max(0, vinIdx - 1500), vinIdx + 2500).replace(/\s+/g, " "));
  const ld = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i);
  if (ld) console.log("--- first ld+json ---\n" + ld[1].slice(0, 1500));
  const scripts = [...html.matchAll(/(?:var|window\.)\s*([A-Za-z_$][\w$]*)\s*=\s*[\[{]/g)].map(m => m[1]);
  console.log("script vars:", [...new Set(scripts)].slice(0, 60).join(","));
  const api = [...new Set([...html.matchAll(/["'](\/api\/[^"']{3,120})["']/g)].map(m => m[1]))].slice(0, 20);
  console.log("api paths:", api.join(" | "));
}
