import { getPricingConfig, savePricingConfig } from "./pricing.js";

function esc(s=""){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

export async function pricingAdminPage(env){
  const p=await getPricingConfig(env);
  const field=(name,label,value,suffix="")=>`
    <label>${esc(label)}<input type="number" min="0" step="0.01" name="${esc(name)}" value="${esc(value)}"><span>${esc(suffix)}</span></label>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Pricing — ROVIQ</title>
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:850px;margin:auto;padding:28px}.card{background:#fff;border:1px solid #dce6ee;border-radius:14px;padding:22px;margin:16px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:13px}input{padding:10px;border:1px solid #cad7e1;border-radius:8px;font:inherit}span{font-size:11px;color:#6c8091}.row{display:flex;gap:10px;flex-wrap:wrap}button,a{padding:10px 14px;border-radius:8px;border:1px solid #174f79;background:#174f79;color:#fff;text-decoration:none;font-weight:700}.note{font-size:13px;line-height:1.5;color:#5d7285}@media(max-width:650px){.grid{grid-template-columns:1fr}}</style></head>
  <body><div class="wrap"><h1>ROVIQ pricing</h1><div class="card"><p class="note">Customer pricing is separated into the current vehicle asking price, the ROVIQ processing / sourcing / coordination fee, and shipping. No percentage vehicle markup or hidden risk reserve is added.</p>
  <form method="POST" action="/admin/pricing/save"><div class="grid">
  ${field("minimumMargin","ROVIQ processing / coordination fee",p.minimumMargin,"USD")}
  ${field("shippingLow","Shipping estimate — low",p.shippingLow,"USD")}
  ${field("shippingHigh","Shipping estimate — high",p.shippingHigh,"USD")}
  </div><div class="row" style="margin-top:18px"><button type="submit">Save pricing</button><a href="/admin/costing">Vehicle costing database</a><a href="/admin/vehicles">Vehicle inventory</a><a href="/admin">Admin home</a></div></form></div></div></body></html>`;
}

export async function savePricing(request,env){
  const form=await request.formData();
  const input={};
  for(const key of ["marginPercent","minimumMargin","shippingLow","shippingHigh"]) input[key]=form.get(key);
  await savePricingConfig(env,input);
  return Response.redirect("/admin/pricing",303);
}
