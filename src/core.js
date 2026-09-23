const CORE_CASES_KEY = "roviq_core_cases:v1";
const CORE_CASE_LIMIT = 1000;

function now(){return new Date().toISOString();}
function caseId(){return "RC-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,6).toUpperCase();}
function esc(s=""){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

async function readCases(env){
  const raw=env.CONTENT?await env.CONTENT.get(CORE_CASES_KEY):null;
  if(!raw) return [];
  try{return JSON.parse(raw)}catch{return []}
}
async function writeCases(env,cases){
  if(env.CONTENT) await env.CONTENT.put(CORE_CASES_KEY,JSON.stringify(cases.slice(0,CORE_CASE_LIMIT)));
}

export async function createCoreVehicleCase(env,input){
  const createdAt=now();
  const item={
    id:caseId(),
    type:"vehicle_export",
    domain:"ukraine",
    status:input.status||"dealer_confirmation_pending",
    bookingId:input.bookingId,
    createdAt,
    updatedAt:createdAt,
    actors:{
      customer:{
        name:input.customer?.name||"",
        email:input.customer?.email||"",
        phone:input.customer?.phone||"",
        destination:input.customer?.destination||"Ukraine"
      },
      dealer:{
        sourceId:input.dealer?.sourceId||null,
        reservationMode:input.dealer?.reservationMode||"manual",
        confirmationRequired:input.dealer?.confirmationRequired!==false
      },
      logistics:{
        providerId:"nd-northwest",
        providerStatus:"details_pending"
      }
    },
    vehicle:{
      vehicleId:input.vehicle?.vehicleId||null,
      vin:input.vehicle?.vin||null,
      dealerAskingPriceAtRequest:Number(input.vehicle?.dealerAskingPriceAtRequest||0)||null,
      dealerVerifiedAt:input.vehicle?.dealerVerifiedAt||null
    },
    pricing:{
      policy:"vehicle_pricing_config:v1",
      shippingEstimate:{
        currency:"USD",
        low:5000,
        high:7000,
        route:"Oregon to Rijeka, Croatia",
        status:"preliminary"
      }
    },
    reservation:{
      status:input.status||"dealer_confirmation_pending",
      requestedAt:createdAt,
      dealerConfirmationRequired:input.dealer?.confirmationRequired!==false
    },
    logistics:{
      status:"estimate",
      origin:"Portland, Oregon",
      destinationPort:"Rijeka, Croatia",
      onwardUkraineStatus:"pending_provider_confirmation"
    },
    compliance:{
      titleStandard:"clean_non_branded_required",
      exclude:["salvage","rebuilt","reconstructed","flood","major_total_loss"],
      verificationStatus:"required_before_purchase_export"
    },
    events:[
      {at:createdAt,type:"case_created",status:input.status||"dealer_confirmation_pending",source:"ukraine_booking"}
    ]
  };
  const cases=await readCases(env);
  cases.unshift(item);
  await writeCases(env,cases);
  return item;
}

export async function updateCoreCaseStatus(env,coreCaseId,status,meta={}){
  if(!coreCaseId) return null;
  const cases=await readCases(env);
  const item=cases.find(x=>x.id===coreCaseId);
  if(!item) return null;
  const at=now();
  item.status=status;
  item.updatedAt=at;
  item.reservation=item.reservation||{};
  item.reservation.status=status;
  item.events=Array.isArray(item.events)?item.events:[];
  item.events.push({at,type:"status_changed",status,source:meta.source||"admin",note:meta.note||null});
  if(status==="dealer_hold_confirmed") item.reservation.dealerConfirmedAt=at;
  if(status==="secured") item.reservation.securedAt=at;
  if(status==="purchased") item.vehicle.purchasedAt=at;
  if(status==="export_processing") item.logistics.status="export_processing";
  if(status==="in_transit") item.logistics.status="in_transit";
  if(status==="delivered") item.logistics.status="delivered";
  await writeCases(env,cases);
  return item;
}

export async function listCoreCases(env){return readCases(env);}

export function coreCasesAdminPage(items){
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ROVIQ Core cases</title>
  <style>body{font-family:Arial;margin:0;background:#07131f;color:#dce4e9}.wrap{max-width:1200px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;gap:20px;align-items:center}.top a{color:#e1b770}.card{background:#0c1a27;border:1px solid rgba(200,146,69,.28);border-radius:12px;padding:16px;margin:12px 0}.muted{color:#9ba8b3;font-size:13px}.row{display:flex;gap:12px;flex-wrap:wrap}.gold{color:#e1b770}</style></head><body><div class="wrap"><div class="top"><h1>ROVIQ Core cases</h1><a href="/admin">Admin home</a></div>
  ${items.length?items.map(c=>`<div class="card"><div class="row"><strong class="gold">${esc(c.id)}</strong><span>${esc(c.type)}</span><span>${esc(c.domain)}</span><span>${esc(c.status)}</span></div><p><strong>Booking:</strong> ${esc(c.bookingId||"")} • <strong>Vehicle:</strong> ${esc(c.vehicle?.vehicleId||"")}</p><div class="muted">Dealer: ${esc(c.actors?.dealer?.sourceId||"")} • Logistics: ${esc(c.logistics?.origin||"")} → ${esc(c.logistics?.destinationPort||"")} • Updated: ${esc(c.updatedAt||c.createdAt||"")}</div></div>`).join(""):`<div class="card">No Core cases yet.</div>`}
  </div></body></html>`;
}
