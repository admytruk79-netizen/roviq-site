// Read-only diagnostics: one full DealerOn VehicleCard and one Jazel F-150 context.
const UA = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";
const get = async (url, accept = "text/html") => { const r = await fetch(url, { headers: { "user-agent": UA, accept } }); return { status: r.status, body: await r.text() }; };
const strip = o => JSON.stringify(o, (k, v) => /Photo|Image|Breakpoint|Html$|Carousel/i.test(k) && k !== "VehicleNameHtmlEncoded" ? undefined : v);
{
  const r = await get("https://www.beavertongmc.com/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/27824/2918791?pt=1&pn=96&model=Sierra%201500&host=www.beavertongmc.com", "application/json");
  const j = JSON.parse(r.body);
  console.log("cards:", j.DisplayCards?.length, "paging:", JSON.stringify(j.Paging?.PaginationDataModel));
  const card = j.DisplayCards.find(c => c.VehicleCard)?.VehicleCard;
  console.log("VehicleCard keys:", Object.keys(card).join(","));
  console.log("VehicleCard:", strip(card).slice(0, 6000));
  const other = await get("https://www.carrbuickgmc.com/searchnew.aspx?model=Sierra%201500");
  const tag = (other.body.match(/id="dealeron_tagging_data"[^>]*>([^<]+)</) || [])[1];
  console.log("carr-buick-gmc tagging:", tag?.slice(0, 120));
}
{
  const html = (await get("https://www.northsideford.net/inventory/new-vehicles/f-150/")).body;
  const ctx = [...html.matchAll(/jzlSetVehicleInfoContext\('([A-Z0-9]{17})',\s*(\{.*?\})\);\s*\}\);/gs)];
  console.log("\n== northside f-150 contexts:", ctx.length);
  const models = {}; for (const m of ctx) { try { const o = JSON.parse(m[2]); models[o.model] = (models[o.model] || 0) + 1; } catch { models.parseError = (models.parseError || 0) + 1; } }
  console.log(models);
  const f = ctx.find(m => /F-150|F-250/.test(m[2]));
  if (f) { const o = JSON.parse(f[2]); o.pricing = (o.pricing || []).map(p => ({ Label: p.Label?.slice(0, 40), Name: p.Name, Value: p.Value })); console.log(JSON.stringify(o).slice(0, 3000)); }
  console.log("paging:", [...new Set([...html.matchAll(/href="([^"]*srp-page-\d+[^"]*)"/g)].map(m => m[1]))].slice(-3));
}
