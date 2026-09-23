import { getInventoryAdmin, syncVehicleInventory } from "./inventory.js";

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
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1200px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.actions{display:flex;gap:10px}.card{background:#fff;border:1px solid #dce6ee;border-radius:12px;padding:16px;margin:16px 0;overflow:auto}table{width:100%;border-collapse:collapse;min-width:900px}th,td{text-align:left;border-bottom:1px solid #e7edf2;padding:10px;font-size:13px}th{font-size:11px;text-transform:uppercase;color:#6d8397}button,a.btn{padding:9px 12px;border-radius:8px;border:1px solid #174f79;background:#174f79;color:#fff;text-decoration:none;font-weight:700}.muted{color:#6b8093;font-size:13px}</style>
  </head><body><div class="wrap"><div class="top"><div><h1>Live vehicle inventory</h1><div class="muted">Last sync: ${esc(state.syncedAt||"not yet")} • Under ${Number(state.maxMileage||60000).toLocaleString("en-US")} miles</div></div><div class="actions"><a class="btn" href="/admin/pricing">Pricing</a><a class="btn" href="/admin/bookings">Bookings</a><a class="btn" href="/admin">Admin home</a><form method="POST" action="/admin/vehicles/sync"><button type="submit">Sync now</button></form></div></div>
  <div class="card"><strong>Source plugins:</strong> ${(state.sources||[]).map(s=>esc(s.name)).join(" • ")||"initializing"}</div>
  <div class="card"><table><thead><tr><th>ID</th><th>Vehicle</th><th>Miles</th><th>Fuel</th><th>Status</th><th>Source</th><th>Last verified</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No synced vehicles yet.</td></tr>'}</tbody></table></div></div></body></html>`;
}

export async function syncNow(env) {
  await syncVehicleInventory(env);
  return Response.redirect("/admin/vehicles",303);
}
