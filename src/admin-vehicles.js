import { getInventoryAdmin, syncVehicleInventory, getInventoryDiagnostics } from "./inventory.js";

function esc(s=""){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

export async function vehicleAdminPage(env) {
  const state = await getInventoryAdmin(env);
  const rows = (state.vehicles||[]).map(v=>`
    <tr>
      <td>${esc(v.id)}</td><td>${esc(v.year)} ${esc(v.make)} ${esc(v.model)} ${esc(v.trim||"")}</td>
      <td>${Number(v.mileageMi||0).toLocaleString("en-US")}</td><td>${esc(v.fuel||"")}</td>
      <td>${esc(v.status||"")}</td><td>${esc(v.sourceNameInternal||v.sourceId||"")}</td>
      <td>${esc(v.lastVerifiedAt||"—")}</td>
    </tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Vehicle inventory — ROVIQ</title>
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1200px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.actions{display:flex;gap:10px}.card{background:#fff;border:1px solid #dce6ee;border-radius:12px;padding:16px;margin:16px 0;overflow:auto}table{width:100%;border-collapse:collapse;min-width:900px}th,td{text-align:left;border-bottom:1px solid #e7edf2;padding:10px;font-size:13px}th{font-size:11px;text-transform:uppercase;color:#6d8397}button,a.btn{padding:9px 12px;border-radius:8px;border:1px solid #174f79;background:#174f79;color:#fff;text-decoration:none;font-weight:700}.muted{color:#6b8093;font-size:13px}.source-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-top:12px}.source{border:1px solid #e1e8ee;border-radius:10px;padding:12px}.source-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px}.pill{font-size:10px;font-weight:800;padding:4px 7px;border-radius:999px}.pill.ok{background:#e9f8ef;color:#17653a}.pill.warn{background:#fff4df;color:#8c5c00}</style>
  </head><body><div class="wrap"><div class="top"><div><h1>Live vehicle inventory</h1><div class="muted">Last sync: ${esc(state.syncedAt||"not yet")} • Under ${Number(state.maxMileage||60000).toLocaleString("en-US")} miles</div></div><div class="actions"><a class="btn" href="/admin/vehicles/diagnostics">Diagnostics</a><a class="btn" href="/admin/pricing">Pricing</a><a class="btn" href="/admin/bookings">Bookings</a><a class="btn" href="/admin">Admin home</a><form method="POST" action="/admin/vehicles/sync"><button type="submit">Sync now</button></form></div></div>
  <div class="card"><h3 style="margin-top:0;">Dealer source health</h3>
  <div class="source-grid">${(state.sources||[]).map(s=>{
    const ok=Number(s.inventoryPagesOk||0)>0 && Number(s.detailFailures||0) < Math.max(3,Number(s.detailChecks||0));
    return `<div class="source"><div class="source-head"><strong>${esc(s.name)}</strong><span class="pill ${ok?"ok":"warn"}">${ok?"SYNCING":"CHECK"}</span></div>
      <div class="muted">Inventory pages: ${Number(s.inventoryPagesOk||0)} ok / ${Number(s.inventoryPagesFailed||0)} failed</div>
      <div class="muted">Discovered: ${Number(s.discovered||0)} • Detail checks: ${Number(s.detailChecks||0)} • Failures: ${Number(s.detailFailures||0)}</div>
      <div class="muted">Available: ${Number(s.availableVehicles||0)} • Last success: ${esc(s.lastSuccessAt||"—")}</div>
    </div>`;
  }).join("")||"<div class=\"muted\">Source status initializes after the next sync.</div>"}</div></div>
  <div class="card"><table><thead><tr><th>ID</th><th>Vehicle</th><th>Miles</th><th>Fuel</th><th>Status</th><th>Source</th><th>Last verified</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No synced vehicles yet.</td></tr>'}</tbody></table></div></div></body></html>`;
}

export async function diagnosticsPage(env) {
  const d=await getInventoryDiagnostics(env);
  const rows=(d.issues||[]).map(i=>`<tr><td>${esc(i.severity)}</td><td>${esc(i.sourceId||i.vehicleId||"—")}</td><td>${esc(i.type)}</td><td>${esc(i.message)}</td></tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Inventory diagnostics — ROVIQ</title>
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1100px;margin:auto;padding:28px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.card{background:#fff;border:1px solid #dce6ee;border-radius:12px;padding:15px;margin:14px 0}.metric b{display:block;font-size:28px}.metric span{color:#718496;font-size:12px;text-transform:uppercase}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:9px;border-bottom:1px solid #e7edf2;font-size:13px}th{font-size:11px;text-transform:uppercase;color:#718496}a{color:#174f79;font-weight:700}</style></head><body><div class="wrap"><a href="/admin/vehicles">← Vehicle admin</a><h1>Inventory diagnostics</h1><div class="cards">
  <div class="card metric"><b>${d.counts.available}</b><span>Available</span></div><div class="card metric"><b>${d.counts.withImages}</b><span>With image URL</span></div><div class="card metric"><b>${d.counts.sold}</b><span>Sold retained</span></div><div class="card metric"><b>${d.counts.unavailable}</b><span>Unavailable retained</span></div><div class="card metric"><b>${d.counts.sources}</b><span>Dealer adapters</span></div></div>
  <div class="card"><strong>Last sync:</strong> ${esc(d.syncedAt||"—")}<br><strong>Diagnostics generated:</strong> ${esc(d.generatedAt)}</div>
  <div class="card"><table><thead><tr><th>Severity</th><th>Source / Vehicle</th><th>Type</th><th>Message</th></tr></thead><tbody>${rows||'<tr><td colspan="4">No integrity issues detected.</td></tr>'}</tbody></table></div></div></body></html>`;
}

export async function syncNow(env) {
  await syncVehicleInventory(env);
  return Response.redirect("/admin/vehicles",303);
}
