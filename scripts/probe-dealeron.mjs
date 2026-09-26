// Read-only: dump one exact vehicle record per in-area new-inventory platform (diagnostics only).
const UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";
const get = async url => { const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } }); return r.ok ? r.text() : `HTTP ${r.status}`; };

// dealer.com (Carr Chevrolet): embedded widget JSON
{
  const html = await get("https://www.carrchevrolet.com/new-inventory/index.htm?model=Silverado%201500");
  const i = html.indexOf('DDC.WidgetData["inventory-data-bus1"]');
  console.log("== carr-chevrolet widget at", i);
  const vi = html.indexOf('"vin":"');
  const start = html.lastIndexOf('{"', html.lastIndexOf('"accountId"', vi) > 0 ? html.lastIndexOf('"accountId"', vi) : vi);
  console.log(html.slice(Math.max(0, vi - 2500), vi + 3500).replace(/\s+/g, " "));
  const m = html.match(/"totalCount"\s*:\s*\d+|"pageInfo"\s*:\s*\{[^}]{0,300}\}/);
  console.log("paging:", m?.[0]);
}
// Northside (Jazel): base64 event details + nearby JSON
{
  const html = await get("https://www.northsideford.net/inventory/new-vehicles/");
  const dets = [...html.matchAll(/data-event-details='([^']+)'/g)].map(m => { try { return JSON.parse(Buffer.from(m[1], "base64").toString()); } catch { return null; } }).filter(Boolean);
  console.log("\n== northside decoded", dets.length, JSON.stringify(dets.find(d => /F-150|F-250/.test(d.model)) || dets[0]));
  const vi = html.indexOf('"accountName"');
  console.log(html.slice(vi - 200, vi + 2500).replace(/\s+/g, " "));
  console.log("pagination:", [...new Set([...html.matchAll(/new-vehicles\/[^"' ]*(?:page|pg|paged)[=\/]\d+[^"' ]*/g)].map(m => m[0]))].slice(0, 5));
  console.log("total:", (html.match(/(\d+)\s+(?:Vehicles|Results|matches)/i) || [])[0]);
}
// DealerOn (Beaverton GMC): links and VIN-looking tokens
{
  const html = await get("https://www.beavertongmc.com/searchnew.aspx?model=Sierra%201500");
  const vins = [...new Set(html.match(/\b[1-5][A-HJ-NPR-Z0-9]{16}\b/g) || [])];
  console.log("\n== beaverton VIN-like tokens", vins.length, vins.slice(0, 5));
  if (vins[0]) { const k = html.indexOf(vins[0]); console.log(html.slice(k - 2000, k + 1500).replace(/\s+/g, " ")); }
  console.log("links:", [...new Set([...html.matchAll(/href="([^"]*\/new-[^"]*)"/gi)].map(m => m[1]))].slice(0, 6));
  const p = html.indexOf("data-dotagging-product-name");
  console.log("product-name ctx:", html.slice(p - 600, p + 900).replace(/\s+/g, " "));
}
