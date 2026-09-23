import { getVehicleCosting } from "./costing-db.js";

function esc(s=""){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function money(n){return Number(n||0).toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});}

export async function costingAdminPage(env){
  const rows=await getVehicleCosting(env);
  const body=rows.length?rows.map(r=>`
    <tr>
      <td>${esc(r.vehicleId)}</td>
      <td>${money(r.acquisitionPrice)}</td>
      <td>${esc(r.marginPercent)}%</td>
      <td>${money(r.roviqVehiclePrice)}</td>
      <td>${money(r.shippingLow)}–${money(r.shippingHigh)}</td>
      <td>${money(r.deliveredLow)}–${money(r.deliveredHigh)}</td>
      <td>${esc(r.updatedAt||"")}</td>
    </tr>`).join(""):`<tr><td colspan="7">No costing records yet.</td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Vehicle Costing — ROVIQ</title>
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1200px;margin:auto;padding:28px}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #dce6ee}th,td{padding:10px;border-bottom:1px solid #e5edf3;text-align:left;font-size:13px}th{background:#eef4f8}.row{display:flex;gap:10px;margin-bottom:16px}a{padding:9px 12px;background:#174f79;color:#fff;text-decoration:none;border-radius:8px}</style></head><body><div class="wrap">
  <h1>Vehicle costing database</h1><div class="row"><a href="/admin/pricing">Pricing rules</a><a href="/admin/vehicles">Inventory</a><a href="/admin">Admin home</a></div>
  <table><thead><tr><th>Vehicle</th><th>Acquisition</th><th>Margin</th><th>ROVIQ vehicle price</th><th>Shipping</th><th>Internal delivered range</th><th>Updated</th></tr></thead><tbody>${body}</tbody></table>
  </div></body></html>`;
}
