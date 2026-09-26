// Read-only structure probe for in-area new-inventory pages (diagnostics only).
const UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";
const PAGES = [
  ["beaverton-gmc", "https://www.beavertongmc.com/searchnew.aspx"],
  ["carr-chevrolet", "https://www.carrchevrolet.com/new-inventory/index.htm"],
  ["northside-ford", "https://www.northsideford.net/inventory/new-vehicles/"],
  ["courtesy-ford", "https://www.courtesyford.com/new-vehicles/"]
];
for (const [id, url] of PAGES) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } }).catch(e => ({ ok: false, status: String(e) }));
  console.log(`\n== ${id} ${url} -> ${r.status}`);
  if (!r.ok) continue;
  const html = await r.text();
  const names = {};
  for (const m of html.matchAll(/\b(data-(?:dotagging|vehicle|vin|price|make|model|trim|year|stock|vehicleid)[\w-]*)=/gi)) names[m[1]] = (names[m[1]] || 0) + 1;
  console.log("attr names:", JSON.stringify(names).slice(0, 1500));
  const first = html.search(/data-dotagging-item-id=|data-vin=|data-vehicle-vin=/i);
  if (first > 0) {
    const tagStart = html.lastIndexOf("<", first);
    console.log("first tag:", html.slice(tagStart, tagStart + 2500).replace(/\s+/g, " "));
  }
  for (const k of ["SEARCH_SERVICE", "DDC.dataLayer", "\"vehicles\":[", "ws-inv-data", "getInventory", "algolia", "inventoryApiURL", "Dealer Inspire", "dealerinspire", "dealer.com", "DealerOn", "vinSolutions", "\"vin\":\""]) {
    const i = html.indexOf(k);
    console.log(`${k}: ${i < 0 ? "-" : "at " + i + " :: " + html.slice(Math.max(0, i - 80), i + 220).replace(/\s+/g, " ")}`);
  }
}
