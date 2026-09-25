import { getInventoryAdmin, getInventoryDiagnostics, getVehicleInventory, syncVehicleInventory } from "./inventory.js";

function esc(s=""){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function money(n){const x=Number(n||0);return x?("$"+x.toLocaleString("en-US")):"—";}
function pill(label,tone="neutral"){return `<span class="pill pill-${tone}">${esc(label)}</span>`;}

export async function vehicleAdminPage(env) {
  const [state, diagnostics, publicInventory] = await Promise.all([
    getInventoryAdmin(env),
    getInventoryDiagnostics(env),
    getVehicleInventory(env)
  ]);

  const publicById=new Map((publicInventory.vehicles||[]).map(v=>[v.id,v]));
  const vehicles=state.vehicles||[];
  const available=vehicles.filter(v=>v.status==="available");

  const rows = vehicles.slice().sort((a,b)=>{
    const pa=publicById.has(a.id)?0:1, pb=publicById.has(b.id)?0:1;
    if(pa!==pb)return pa-pb;
    return Number(a.mileageMi||999999)-Number(b.mileageMi||999999);
  }).map(v=>{
    const pub=publicById.get(v.id);
    const hasImage=Boolean(v.directImage);
    const hasSourcePrice=Number(v.askingPrice||0)>=1000;
    const publicReady=Boolean(pub);
    const reason=publicReady?"Public now":
      !hasImage?"Missing source photo":
      !hasSourcePrice?"Missing dealer price":
      v.status!=="available"?"Not available":
      "Awaiting complete live verification";
    return `
    <tr>
      <td><img class="thumb" src="/ukraine/image/${encodeURIComponent(v.id)}" alt="" loading="lazy"></td>
      <td><strong>${esc(v.id)}</strong><div class="sub">${esc(v.vin?"••••••"+String(v.vin).slice(-6):"No VIN")}</div></td>
      <td><strong>${esc(v.year)} ${esc(v.make)} ${esc(v.model)}</strong><div class="sub">${esc(v.trim||"")} ${v.trim?"• ":""}${esc(v.engine||"")}</div></td>
      <td>${v.mileageMi==null?"Unknown":Number(v.mileageMi).toLocaleString("en-US")}</td>
      <td>${hasImage?pill("Photo","ok"):pill("No photo","bad")}</td>
      <td><strong>${money(v.askingPrice)}</strong><div class="sub">dealer/source</div></td>
      <td><strong>${pub?.pricing?.hasPrice?money(pub.pricing.vehiclePrice):"—"}</strong><div class="sub">customer-facing</div></td>
      <td>${publicReady?pill("PUBLIC","ok"):pill("INTERNAL","warn")}<div class="sub">${esc(reason)}</div></td>
      <td>${pill(v.status||"unknown",v.status==="available"?"ok":v.status==="sold"?"bad":"warn")}</td>
      <td>${esc(v.sourceNameInternal||v.sourceId||"")}<div class="sub">${esc(v.lastVerifiedAt||"Not verified")}</div></td>
    </tr>`;
  }).join("");

  const sourceRows=(state.sources||[]).map(s=>`
    <tr>
      <td><strong>${esc(s.name||s.id)}</strong></td>
      <td>${Number(s.discovered||0)}</td>
      <td>${Number(s.availableVehicles||0)}</td>
      <td>${Number(s.publicReadyVehicles||0)}</td>
      <td>${Number(s.detailFailures||0)} / ${Number(s.detailChecks||0)}</td>
      <td>${Number(s.inventoryPagesOk||0)>0?pill("HEALTHY","ok"):pill("ISSUE","bad")}</td>
      <td class="sub">${esc(s.lastSuccessAt||"—")}</td>
    </tr>`).join("");

  const issues=(diagnostics.issues||[]).slice(0,50).map(i=>`
    <div class="issue issue-${esc(i.severity||"warn")}"><strong>${esc(i.type||"issue")}</strong> — ${esc(i.message||"")}
      ${i.vehicleId?`<span class="sub"> • ${esc(i.vehicleId)}</span>`:""}
      ${i.sourceId?`<span class="sub"> • ${esc(i.sourceId)}</span>`:""}
    </div>`).join("");

  const counts=diagnostics.counts||{};
  const customerReady=Number(counts.customerReady||counts.publicReady||publicInventory.vehicles?.length||0);
  const hiddenCount=Math.max(0,Number(counts.available||available.length)-customerReady);
  const discoveredTotal=(state.sources||[]).reduce((n,s)=>n+Number(s.discovered||0),0);

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Vehicle inventory — ROVIQ</title>
  <style>
  *{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1500px;margin:auto;padding:24px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.actions{display:flex;gap:8px;flex-wrap:wrap}.card{background:#fff;border:1px solid #dce6ee;border-radius:14px;padding:16px;margin:16px 0;overflow:auto;box-shadow:0 8px 24px rgba(23,50,74,.05)}.kpis{display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));gap:10px;margin:16px 0}.kpi{background:#fff;border:1px solid #dce6ee;border-radius:12px;padding:14px}.kpi span{display:block;color:#6b8093;font-size:11px;text-transform:uppercase;font-weight:800}.kpi strong{display:block;font-size:26px;margin-top:6px}.kpi.good strong{color:#19724d}.kpi.warn strong{color:#a66b16}.section-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.section-title h2{margin:0;font-size:18px}table{width:100%;border-collapse:collapse;min-width:1250px}th,td{text-align:left;border-bottom:1px solid #e7edf2;padding:10px;vertical-align:middle;font-size:13px}th{font-size:10px;text-transform:uppercase;color:#6d8397;letter-spacing:.04em}.thumb{width:96px;height:62px;object-fit:cover;border-radius:8px;background:#dce6ee;border:1px solid #d3dee7}.sub{color:#718699;font-size:11px;margin-top:4px}.pill{display:inline-block;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800;letter-spacing:.04em}.pill-ok{background:#e6f6ef;color:#19724d}.pill-warn{background:#fff4db;color:#8b5e13}.pill-bad{background:#fdeaea;color:#a33}.pill-neutral{background:#edf2f6;color:#52697c}.issue{padding:9px 11px;border-radius:8px;margin:7px 0;font-size:12px}.issue-warn{background:#fff7e6;border:1px solid #f0d49c}.issue-error{background:#fdeaea;border:1px solid #e8b3b3}.issue-info{background:#eaf4fb;border:1px solid #b9d8ea}button,a.btn{padding:9px 12px;border-radius:8px;border:1px solid #174f79;background:#174f79;color:#fff;text-decoration:none;font-weight:700}.muted{color:#6b8093;font-size:13px}.note{padding:12px 14px;background:#eef6fb;border-left:4px solid #174f79;border-radius:8px;font-size:12px;line-height:1.5}
  @media(max-width:1100px){.kpis{grid-template-columns:repeat(4,1fr)}}@media(max-width:650px){.wrap{padding:14px}.kpis{grid-template-columns:repeat(2,1fr)}}
  </style></head><body><div class="wrap">
  <div class="top"><div><h1 style="margin-bottom:6px">Vehicle inventory control</h1><div class="muted">Last sync: ${esc(state.syncedAt||"not yet")} • Public standard: complete price + real photo + live vehicle data • Under ${Number(state.maxMileage||60000).toLocaleString("en-US")} miles</div></div><div class="actions"><a class="btn" href="/ukraine" target="_blank">View public inventory</a><a class="btn" href="/admin/pricing">Pricing</a><a class="btn" href="/admin/costing">Costing</a><a class="btn" href="/admin/bookings">Bookings</a><a class="btn" href="/admin">Admin home</a><form method="POST" action="/admin/vehicles/sync"><button type="submit">Sync now</button></form></div></div>

  <div class="kpis">
    <div class="kpi"><span>Discovered links</span><strong>${discoveredTotal}</strong></div>
    <div class="kpi"><span>Total tracked</span><strong>${Number(counts.total||vehicles.length)}</strong></div>
    <div class="kpi good"><span>Available</span><strong>${Number(counts.available||available.length)}</strong></div>
    <div class="kpi good"><span>Customer ready</span><strong>${customerReady}</strong></div>
    <div class="kpi warn"><span>Held internal</span><strong>${hiddenCount}</strong></div>
    <div class="kpi"><span>With photos</span><strong>${Number(counts.withImages||0)}</strong></div>
    <div class="kpi"><span>With dealer price</span><strong>${Number(counts.withPrices||0)}</strong></div>
  </div>

  <div class="note"><strong>Important:</strong> “Discovered links” is not the same as public inventory. The sync may inspect up to 180 candidates, but only records with a qualifying truck, mileage/specs, live availability, a source photo and a dealer/source price become “Customer ready.” Every tracked record stays visible here so you can see exactly why it is or is not public.</div>

  <div class="card"><div class="section-title"><h2>Source health</h2><span class="muted">${(state.sources||[]).length} configured sources</span></div><table><thead><tr><th>Source</th><th>Discovered</th><th>Available</th><th>Public ready</th><th>Detail failures/checks</th><th>Health</th><th>Last success</th></tr></thead><tbody>${sourceRows||'<tr><td colspan="7">No source status yet.</td></tr>'}</tbody></table></div>

  <div class="card"><div class="section-title"><h2>All tracked vehicles</h2><span class="muted">PUBLIC = appears to customers • INTERNAL = tracked but withheld</span></div><table><thead><tr><th>Photo</th><th>ID</th><th>Vehicle</th><th>Miles</th><th>Image</th><th>Dealer price</th><th>ROVIQ price</th><th>Public state</th><th>Inventory state</th><th>Source / verified</th></tr></thead><tbody>${rows||'<tr><td colspan="10">No synced vehicles yet.</td></tr>'}</tbody></table></div>

  <div class="card"><div class="section-title"><h2>Inventory diagnostics</h2><span class="muted">${(diagnostics.issues||[]).length} current issue(s)</span></div>${issues||'<div class="muted">No current inventory diagnostics.</div>'}</div>
  </div></body></html>`;
}

export async function syncNow(env) {
  await syncVehicleInventory(env);
  return Response.redirect("/admin/vehicles",303);
}
