const BOOKINGS_KEY = "vehicle_bookings:v1";

function esc(s=""){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
async function read(env){const raw=env.CONTENT?await env.CONTENT.get(BOOKINGS_KEY):null;if(!raw)return[];try{return JSON.parse(raw)}catch{return[]}}
async function write(env,items){if(env.CONTENT)await env.CONTENT.put(BOOKINGS_KEY,JSON.stringify(items))}
function id(){return "RB-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,6).toUpperCase()}

export async function createBooking(request,env){
  const form=await request.formData();
  const vehicleId=String(form.get("vehicleId")||"").trim();
  const name=String(form.get("name")||"").trim();
  const email=String(form.get("email")||"").trim();
  const phone=String(form.get("phone")||"").trim();
  const destination=String(form.get("destination")||"Ukraine").trim();
  const note=String(form.get("note")||"").trim();
  if(!vehicleId||!name||!email) return new Response("Vehicle, name and email are required.",{status:400});
  const items=await read(env);
  const booking={id:id(),vehicleId,name,email,phone,destination,note,status:"new",createdAt:new Date().toISOString()};
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
  const status=String(form.get("status")||"new");
  const items=await read(env);
  const item=items.find(x=>x.id===bookingId);
  if(item){item.status=status;item.updatedAt=new Date().toISOString();await write(env,items)}
  return Response.redirect("/admin/bookings",303);
}

export function bookingForm(vehicle){
  return `<section class="book-panel" id="reserve-${esc(vehicle.id)}">
  <h3>Reserve / request this vehicle</h3>
  <p>This sends a reservation request to ROVIQ. It does not expose the U.S. dealer or source price.</p>
  <form method="POST" action="/ukraine/book">
    <input type="hidden" name="vehicleId" value="${esc(vehicle.id)}">
    <div class="book-grid">
      <input required name="name" placeholder="Your name">
      <input required type="email" name="email" placeholder="Email">
      <input name="phone" placeholder="Phone / WhatsApp">
      <input name="destination" value="Ukraine" placeholder="Destination">
    </div>
    <textarea name="note" placeholder="Questions or preferred delivery city"></textarea>
    <button class="uk-btn primary" type="submit">Reserve / request vehicle</button>
  </form>
  </section>`;
}

export function bookingsAdminPage(items){
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Vehicle bookings — ROVIQ</title>
  <style>body{font-family:Arial;margin:0;background:#f4f7fa;color:#17324a}.wrap{max-width:1180px;margin:auto;padding:28px}.top{display:flex;justify-content:space-between;align-items:center}.card{background:#fff;border:1px solid #dce6ee;border-radius:12px;padding:16px;margin:12px 0}.muted{color:#6b8093;font-size:13px}select,button{padding:8px 10px}.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}</style></head><body><div class="wrap"><div class="top"><h1>Vehicle bookings</h1><a href="/admin">Admin home</a></div>
  ${items.length?items.map(b=>`<div class="card"><div class="row"><strong>${esc(b.id)}</strong><span>${esc(b.vehicleId)}</span><span>${esc(b.name)}</span><span>${esc(b.email)}</span><span>${esc(b.phone)}</span></div><p>${esc(b.note||"")}</p><div class="muted">${esc(b.createdAt)} • ${esc(b.destination)}</div><form method="POST" action="/admin/bookings/status" class="row"><input type="hidden" name="bookingId" value="${esc(b.id)}"><select name="status"><option ${b.status==="new"?"selected":""}>new</option><option ${b.status==="contacted"?"selected":""}>contacted</option><option ${b.status==="reserved"?"selected":""}>reserved</option><option ${b.status==="closed"?"selected":""}>closed</option></select><button>Update</button></form></div>`).join(""):`<div class="card">No booking requests yet.</div>`}
  </div></body></html>`;
}
