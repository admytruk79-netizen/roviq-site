// Read-only diagnostics: DealerOn card API and Jazel (Northside) paging/body data.
const UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";
const get = async (url, accept = "text/html") => { const r = await fetch(url, { headers: { "user-agent": UA, accept } }).catch(e => ({ ok: false, status: e.name, text: async () => "" })); return { status: r.status, body: await r.text() }; };

for (const host of ["www.beavertongmc.com"]) {
  const page = await get(`https://${host}/searchnew.aspx?model=Sierra%201500`);
  const tag = JSON.parse((page.body.match(/id="dealeron_tagging_data"[^>]*>([^<]+)</) || [, "{}"])[1]);
  console.log("tagging", tag.dealerId, tag.pageId, tag.itemCount);
  const scripts = [...new Set([...page.body.matchAll(/["'](\/api\/[^"']+|[^"']*cosmos[^"']*)["']/g)].map(m => m[1]))].slice(0, 20);
  console.log("api refs:", scripts);
  const idx = page.body.indexOf("cosmos"); if (idx > 0) console.log("cosmos ctx:", page.body.slice(idx - 400, idx + 600).replace(/\s+/g, " "));
  for (const path of [
    `/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/${tag.dealerId}/${tag.pageId}?pt=1&model=Sierra%201500&host=${host}&displayCardsShown=`,
    `/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/${tag.dealerId}/${tag.pageId}?pt=1&model=Sierra%201500`,
    `/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/${tag.dealerId}/${tag.pageId}`
  ]) {
    const r = await get(`https://${host}${path}`, "application/json");
    console.log(`\n${r.status} ${path}\n${r.body.slice(0, 2500).replace(/\s+/g, " ")}`);
    if (r.status === 200 && r.body.includes("VIN") || r.body.includes("Vin")) break;
  }
}
{
  const html = (await get("https://www.northsideford.net/inventory/new-vehicles/")).body;
  const dets = [...html.matchAll(/data-event-details='([^']+)'/g)].map(m => { try { return JSON.parse(Buffer.from(m[1], "base64").toString()); } catch { return null; } }).filter(Boolean);
  console.log("\n== northside models:", dets.map(d => `${d.model}|${(d.bodyType || []).join("/")}|${d.vin?.slice(3, 8)}`).join(" ; "));
  console.log("page links:", [...new Set([...html.matchAll(/href="([^"]*(?:page|pg)[=\/-]?\d[^"]*)"/gi)].map(m => m[1]))].slice(0, 8));
  const f = (await get("https://www.northsideford.net/inventory/new-vehicles/?model=F-150")).body;
  const fd = [...f.matchAll(/data-event-details='([^']+)'/g)].map(m => { try { return JSON.parse(Buffer.from(m[1], "base64").toString()); } catch { return null; } }).filter(Boolean);
  console.log("?model=F-150 ->", fd.length, fd.slice(0, 4).map(d => `${d.model} ${d.trim} ${(d.bodyType || []).join("/")} ${d.vin} $${d.price}`));
  for (const u of ["https://www.northsideford.net/inventory/new-vehicles/f-150/", "https://www.northsideford.net/inventory/new-vehicles/?page=2", "https://www.northsideford.net/inventory/new-vehicles/page/2/"]) {
    const r = await get(u); const n = (r.body.match(/data-event-details=/g) || []).length;
    console.log(u, r.status, "vehicles:", n, "first:", (r.body.match(/"name":"(20\d\d [^"]+)"/) || [])[1]);
  }
}
