import { requestDealerReservation } from "./inventory.js";
import { createCoreVehicleCase, updateCoreCaseStatus } from "./core.js";

const BOOKINGS_KEY = "vehicle_bookings:v1";
const BOOKING_STATUSES = [
  "reservation_requested",
  "dealer_confirmation_pending",
  "dealer_hold_confirmed",
  "deposit_required",
  "secured",
  "purchased",
  "export_processing",
  "in_transit",
  "delivered",
  "unavailable",
  "cancelled",
  "closed"
];

function esc(s=""){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
async function read(env){const raw=env.CONTENT?await env.CONTENT.get(BOOKINGS_KEY):null;if(!raw)return[];try{return JSON.parse(raw)}catch{return[]}}
async function write(env,items){if(env.CONTENT)await env.CONTENT.put(BOOKINGS_KEY,JSON.stringify(items))}
function id(){return "RB-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,6).toUpperCase()}
function emailOk(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=160}
function clip(v,n){return String(v||"").trim().slice(0,n)}
function clientIp(request){return request.headers.get("cf-connecting-ip")||request.headers.get("x-forwarded-for")||"unknown"}
async function rateLimit(request,env){if(!env.CONTENT)return true;const bucket=Math.floor(Date.now()/(10*60*1000));const key="booking_rate:"+clientIp(request)+":"+bucket;const raw=await env.CONTENT.get(key);const count=Number(raw||0);if(count>=5)return false;await env.CONTENT.put(key,String(count+1),{expirationTtl:900});return true;}

export async function createBooking(request,env){
  const form=await request.formData();
  const vehicleId=String(form.get("vehicleId")||"").trim();
  const name=String(form.get("name")||"").trim();
  const email=String(form.get("email")||"").trim();
  const phone=String(form.get("phone")||"").trim();
  const destination=String(form.get("destination")||"Ukraine").trim();
  const note=clip(form.get("note"),1200);

  if(!(await rateLimit(request,env))) return new Response("Too many requests. Please try again later.",{status:429});
  if(!vehicleId||!name||!email) return new Response("Vehicle, name and email are required.",{status:400});
  if(!emailOk(email)) return new Response("Please enter a valid email address.",{status:400});

  const safeName=clip(name,120);
  const safePhone=clip(phone,80);
  const safeDestination=clip(destination,120);
  const safeVehicleId=clip(vehicleId,120);

  const dealerResult=await requestDealerReservation(env,safeVehicleId,{
    name:safeName,email:clip(email,160),phone:safePhone,destination:safeDestination
  });

  if(!dealerResult.available){
    return Response.redirect("/ukraine?unavailable="+encodeURIComponent(safeVehicleId),303);
  }

  const bookingId=id();
  const coreCase=await createCoreVehicleCase(env,{
    bookingId,
    status:dealerResult.reservationStatus||"dealer_confirmation_pending",
    customer:{name:safeName,email:clip(email,160),phone:safePhone,destination:safeDestination},
    dealer:{sourceId:dealerResult.sourceId||null,reservationMode:dealerResult.reservationMode||"manual",confirmationRequired:dealerResult.requiresDealerConfirmation!==false},
    vehicle:{vehicleId:safeVehicleId,vin:dealerResult.vin||null,dealerAskingPriceAtRequest:dealerResult.askingPrice||null,dealerVerifiedAt:dealerResult.lastVerifiedAt||new Date().toISOString()}
  });

  const booking={
    id:bookingId,
    coreCaseId:coreCase.id,
    vehicleId:safeVehicleId,
    name:safeName,
    email:clip(email,160),
    phone:safePhone,
    destination:safeDestination,
    note,
    status:dealerResult.reservationStatus||"dealer_confirmation_pending",
    reservationMode:dealerResult.reservationMode||"manual",
    dealerConfirmationRequired:dealerResult.requiresDealerConfirmation!==false,
    sourceId:dealerResult.sourceId||null,
    dealerAvailabilityCheckedAt:dealerResult.lastVerifiedAt||new Date().toISOString(),
    dealerAskingPriceAtRequest:dealerResult.askingPrice||null,
    createdAt:new Date().toISOString()
  };

  const items=await read(env);
  items.unshift(booking);
  await write(env,items.slice(0,500));

  if(env.BOOKING_WEBHOOK_URL){
    try{await fetch(env.BOOKING_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(booking)});}catch{}
  }

  return Response.redirect("/ukraine?booking="+encodeURIComponent(booking.id),303);
}

export async function listBookings(env){return read(env)}

export async function updateBooking(request,env){
  const form=await request.formData();
  const bookingId=String(form.get("bookingId")||"");
  const requested=String(form.get("status")||"dealer_confirmation_pending");
  const status=BOOKING_STATUSES.includes(requested)?requested:"dealer_confirmation_pending";
  const items=await read(env);
  const item=items.find(x=>x.id===bookingId);
  if(item){
    item.status=status;
    item.updatedAt=new Date().toISOString();
    if(status==="dealer_hold_confirmed") item.dealerConfirmedAt=item.updatedAt;
    if(status==="secured") item.securedAt=item.updatedAt;
    await write(env,items);
    if(item.coreCaseId) await updateCoreCaseStatus(env,item.coreCaseId,status,{source:"admin_bookings"});
  }
  return Response.redirect("/admin/bookings",303);
}

export function bookingForm(vehicle){
  return `<section class="book-panel" id="reserve-${esc(vehicle.id)}">
  <h3>Reserve / request this vehicle</h3>
  <p>ROVIQ immediately re-checks the dealer listing before creating your request. A request is not a dealer hold until the dealer confirms it.</p>
  <form method="POST" action="/ukraine/book">
    <input type="hidden" name="vehicleId" value="${esc(vehicle.id)}">
    <div class="book-grid">
      <input required name="name" placeholder="Your name">
      <input required type="email" name="email" placeholder="Email">
      <input name="phone" placeholder="Phone / WhatsApp">
      <input name="destination" value="Ukraine" placeholder="Destination">
    </div>
    <textarea maxlength="1200" name="note" placeholder="Questions or preferred delivery city"></textarea>
    <button class="uk-btn primary" type="submit">Request reservation</button>
  </form>
  </section>`;
}

export function bookingsAdminPage(items){
  const options=BOOKING_STATUSES.map(s=>`<option value="${s}">${s.replaceAll("_"," ")}</option>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Vehicle bookings — ROVIQ</title>
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1180px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;align-items:center}.card{background:#fff;border:1px solid #dce6ee;border-radius:12px;padding:16px;margin:12px 0}.muted{color:#6b8093;font-size:13px}.status{font-weight:700}select,button{padding:8px 10px}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}</style></head><body><div class="wrap"><div class="top"><h1>Vehicle bookings</h1><a href="/admin">Admin home</a></div>
  ${items.length?items.map(b=>`<div class="card"><div class="row"><strong>${esc(b.id)}</strong><span>${esc(b.vehicleId)}</span><span>${esc(b.name)}</span><span>${esc(b.email)}</span><span>${esc(b.phone)}</span></div><p>${esc(b.note||"")}</p><div class="muted">${esc(b.createdAt)} • ${esc(b.destination)} • mode: ${esc(b.reservationMode||"legacy")} • Core: ${esc(b.coreCaseId||"legacy")}</div><p class="status">Status: ${esc((b.status||"").replaceAll("_"," "))}</p><form method="POST" action="/admin/bookings/status" class="row"><input type="hidden" name="bookingId" value="${esc(b.id)}"><select name="status">${options.replace(`value="${b.status}"`,`value="${b.status}" selected`)}</select><button>Update</button></form></div>`).join(""):`<div class="card">No booking requests yet.</div>`}
  </div></body></html>`;
}
