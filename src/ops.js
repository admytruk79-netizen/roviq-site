import { listCoreCases } from "./core.js";
import { getPublicInventoryHealth } from "./inventory.js";

function esc(s=""){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function label(v=""){return String(v).replaceAll("_"," ");}
function money(n){const v=Number(n||0);return v?"$"+Math.round(v).toLocaleString("en-US"):"—";}
function fmt(v){if(!v)return"—";try{return new Date(v).toLocaleString("en-US",{timeZone:"America/Los_Angeles"})}catch{return String(v)}}
const ACTIVE=new Set(["reservation_requested","dealer_confirmation_pending","dealer_hold_confirmed","deposit_required","secured","purchased","export_processing","in_transit"]);
const ATTENTION=new Set(["reservation_requested","dealer_confirmation_pending","unavailable"]);

function shell(title,body){
return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title>
<style>
:root{--bg:#06111b;--panel:#0c1a27;--panel2:#0f2231;--gold:#c89245;--gold2:#e1b770;--text:#e8eef2;--muted:#91a2af;--line:rgba(200,146,69,.25)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Arial,sans-serif}.wrap{max-width:1400px;margin:auto;padding:26px}.top,.head{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}.nav{display:flex;gap:8px;flex-wrap:wrap}.btn{padding:9px 12px;border:1px solid var(--line);border-radius:9px;color:var(--gold2);text-decoration:none;background:#091824;font-weight:700;font-size:13px}.hero{margin:20px 0}.hero h1{margin:5px 0;font-size:clamp(2rem,4vw,3rem)}.kicker{color:var(--gold);font-size:11px;font-weight:800;letter-spacing:.14em}.muted{color:var(--muted);font-size:12px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}.stat span,.mini span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;font-weight:800}.stat strong{display:block;font-size:28px;margin-top:5px}.list{display:grid;gap:10px}.case{margin-top:10px}.status{font-size:11px;text-transform:uppercase;background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:6px 8px}.cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.mini{background:#091824;border-radius:9px;padding:10px}.mini strong{display:block;margin-top:4px;font-size:13px}.link{color:var(--gold2)}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.kv{display:grid;grid-template-columns:160px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)}.kv span:first-child{color:var(--muted)}.event{border-left:3px solid var(--gold);padding:10px 12px;background:#091824;border-radius:8px;margin:8px 0}@media(max-width:800px){.grid,.cols,.detail-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.grid,.cols,.detail-grid{grid-template-columns:1fr}.kv{grid-template-columns:1fr}.wrap{padding:18px}}
</style></head><body><div class="wrap">${body}</div></body></html>`;
}

export async function operationsDashboard(env){
  const [cases,health]=await Promise.all([listCoreCases(env),getPublicInventoryHealth(env)]);
  const active=cases.filter(c=>ACTIVE.has(c.status));
  const attention=cases.filter(c=>ATTENTION.has(c.status));
  const moving=cases.filter(c=>["secured","purchased","export_processing","in_transit"].includes(c.status));
  const rows=active.length?active.map(c=>`<div class="card case">
    <div class="head"><div><strong style="color:var(--gold2)">${esc(c.id)}</strong><div class="muted">Booking ${esc(c.bookingId||"—")} • ${esc(fmt(c.updatedAt||c.createdAt))}</div></div><span class="status">${esc(label(c.status))}</span></div>
    <div class="cols"><div class="mini"><span>Vehicle</span><strong>${esc(c.vehicle?.vehicleId||"—")}</strong></div><div class="mini"><span>Customer</span><strong>${esc(c.actors?.customer?.name||"—")}</strong></div><div class="mini"><span>Dealer</span><strong>${esc(c.actors?.dealer?.sourceId||"—")}</strong></div><div class="mini"><span>Logistics</span><strong>${esc(label(c.logistics?.status||"—"))}</strong></div></div>
    <p><a class="link" href="/ops/case?id=${encodeURIComponent(c.id)}">Open full case →</a></p>
  </div>`).join(""):`<div class="card">No active Core cases yet.</div>`;
  return shell("ROVIQ Operations",`
    <div class="top"><div><div class="kicker">ROVIQ CORE</div><strong>Operations / Dispatcher</strong></div><div class="nav"><a class="btn" href="/admin">Admin</a><a class="btn" href="/admin/bookings">Bookings</a><a class="btn" href="/admin/vehicles">Inventory</a><a class="btn" href="/admin/pricing">Pricing</a><a class="btn" href="/admin/core-cases">Core cases</a></div></div>
    <div class="hero"><h1>Operations dashboard</h1><div class="muted">Reservation → dealer confirmation → purchase → export → delivery.</div></div>
    <div class="grid"><div class="card stat"><span>Active cases</span><strong>${active.length}</strong></div><div class="card stat"><span>Needs attention</span><strong>${attention.length}</strong></div><div class="card stat"><span>Secured / moving</span><strong>${moving.length}</strong></div><div class="card stat"><span>Live public vehicles</span><strong>${Number(health?.counts?.publicReady||0)}</strong></div></div>
    <div class="hero"><h2>Active workflow</h2></div><div class="list">${rows}</div>
  `);
}

export async function operationCasePage(env,id){
  const cases=await listCoreCases(env);
  const c=cases.find(x=>x.id===id);
  if(!c) return shell("ROVIQ Case",`<a class="btn" href="/ops">← Operations</a><div class="card" style="margin-top:16px">Case not found.</div>`);
  const events=[...(c.events||[])].reverse().map(e=>`<div class="event"><strong>${esc(label(e.status||e.type))}</strong><div class="muted">${esc(fmt(e.at))} • ${esc(e.source||"system")}</div></div>`).join("");
  return shell("ROVIQ Case",`
    <div class="top"><div><div class="kicker">ROVIQ CORE CASE</div><strong>${esc(c.id)}</strong></div><div class="nav"><a class="btn" href="/ops">← Operations</a><a class="btn" href="/admin/bookings">Bookings</a></div></div>
    <div class="hero"><h1>${esc(label(c.status))}</h1><div class="muted">Booking ${esc(c.bookingId||"—")} • updated ${esc(fmt(c.updatedAt))}</div></div>
    <div class="detail-grid">
      <div class="card"><h2>Customer</h2><div class="kv"><span>Name</span><strong>${esc(c.actors?.customer?.name||"—")}</strong></div><div class="kv"><span>Email</span><strong>${esc(c.actors?.customer?.email||"—")}</strong></div><div class="kv"><span>Phone</span><strong>${esc(c.actors?.customer?.phone||"—")}</strong></div><div class="kv"><span>Destination</span><strong>${esc(c.actors?.customer?.destination||"—")}</strong></div></div>
      <div class="card"><h2>Vehicle / Dealer</h2><div class="kv"><span>Vehicle ID</span><strong>${esc(c.vehicle?.vehicleId||"—")}</strong></div><div class="kv"><span>VIN</span><strong>${esc(c.vehicle?.vin||"—")}</strong></div><div class="kv"><span>Dealer source</span><strong>${esc(c.actors?.dealer?.sourceId||"—")}</strong></div><div class="kv"><span>Dealer price snapshot</span><strong>${esc(money(c.vehicle?.dealerAskingPriceAtRequest))}</strong></div></div>
      <div class="card"><h2>Reservation</h2><div class="kv"><span>Status</span><strong>${esc(label(c.reservation?.status||c.status))}</strong></div><div class="kv"><span>Mode</span><strong>${esc(c.actors?.dealer?.reservationMode||"manual")}</strong></div><div class="kv"><span>Dealer confirmation</span><strong>${c.reservation?.dealerConfirmationRequired===false?"Not required":"Required"}</strong></div></div>
      <div class="card"><h2>Logistics</h2><div class="kv"><span>Estimate</span><strong>${esc(money(c.pricing?.shippingEstimate?.low))}–${esc(money(c.pricing?.shippingEstimate?.high))}</strong></div><div class="kv"><span>Route</span><strong>${esc(c.pricing?.shippingEstimate?.route||"—")}</strong></div><div class="kv"><span>Status</span><strong>${esc(label(c.logistics?.status||"—"))}</strong></div></div>
      <div class="card"><h2>Compliance</h2><div class="kv"><span>Title</span><strong>Clean, non-branded required</strong></div><div class="kv"><span>Excluded</span><strong>${esc((c.compliance?.exclude||[]).join(", "))}</strong></div><div class="kv"><span>Verification</span><strong>${esc(label(c.compliance?.verificationStatus||"—"))}</strong></div></div>
      <div class="card"><h2>Timeline</h2>${events||'<div class="muted">No events yet.</div>'}</div>
    </div>`);
}
