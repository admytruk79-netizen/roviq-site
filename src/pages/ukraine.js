import { bookingForm } from "../booking.js";

function km(mi){return Math.round(mi*1.60934).toLocaleString("en-US")}
function priceLabel(pricing){return pricing?.hasPrice && Number.isFinite(pricing.vehiclePrice) ? "&#36;"+Number(pricing.vehiclePrice).toLocaleString("en-US") : "Request current price"}
function shippingLabel(pricing){return pricing?.hasPrice && Number.isFinite(pricing.shippingLow) && Number.isFinite(pricing.shippingHigh) ? "&#36;"+pricing.shippingLow.toLocaleString("en-US")+"–&#36;"+pricing.shippingHigh.toLocaleString("en-US") : "Request shipping quote"}
function esc(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function card(v,formPage=false){return `
<article class="uk-card">
<div class="uk-photo"><img src="${v.imagePath}" alt="${v.year} ${v.make} ${v.model}" loading="eager" fetchpriority="high" decoding="async"><div class="uk-badge">${v.mileageMi<10000?"ULTRA-LOW MILEAGE":"UNDER 60,000 MILES"}</div></div>
<div class="uk-info"><div class="uk-id">${v.id} • ROVIQ LIVE INVENTORY</div><h2>${v.year} ${v.make} ${v.model}</h2><div class="uk-sub">${v.trim||""}${v.trim?" • ":""}${v.drivetrain} • ${v.engine}</div>
<div class="price-box"><div><span>Vehicle price</span><strong>${priceLabel(v.pricing)}</strong></div><div><span>Estimated shipping</span><strong>${shippingLabel(v.pricing)}</strong></div></div>\n<div class="uk-specs"><div class="uk-spec"><span>Mileage</span><strong>${v.mileageMi.toLocaleString("en-US")} mi / ${km(v.mileageMi)} km</strong></div><div class="uk-spec"><span>Engine</span><strong>${v.engine}</strong></div><div class="uk-spec"><span>Drivetrain</span><strong>${v.drivetrain}</strong></div><div class="uk-spec"><span>Transmission</span><strong>${v.transmission}</strong></div><div class="uk-spec"><span>Fuel</span><strong>${v.fuel}</strong></div><div class="uk-spec"><span>Exterior</span><strong>${v.exterior}</strong></div><div class="uk-spec"><span>Interior</span><strong>${v.interior}</strong></div><div class="uk-spec"><span>Vehicle ID</span><strong>${v.vinPublic}</strong></div></div>
${formPage ? bookingForm(v) : `<a class="uk-btn primary" style="margin-top:17px" href="/ukraine/request?vehicle=${encodeURIComponent(v.id)}">Open vehicle request form →</a>`}
</div></article>`}

export function ukrainePage(content,inventory,bookingId,unavailableId,formPage=false,filters=new URLSearchParams()){
const vehicles=inventory?.vehicles||[];
const synced=inventory?.syncedAt?new Date(inventory.syncedAt).toLocaleString("en-US",{timeZone:"America/Los_Angeles",dateStyle:"medium",timeStyle:"short"}):"initializing";
const selected=(name,value)=>filters.get(name)===value?" selected":"";
return `<style>
.uk-wrap{position:relative;max-width:1220px;margin:0 auto;padding:20px 20px 56px;color:#dce4e9;overflow:hidden;isolation:isolate}
.uk-wrap::before,.uk-wrap::after{content:"";position:fixed;pointer-events:none;z-index:-1;filter:blur(26px);opacity:.28;animation:ukDrift 12s ease-in-out infinite alternate}
.uk-wrap::before{width:240px;height:240px;left:-90px;top:24%;background:radial-gradient(circle,rgba(200,146,69,.7),transparent 68%)}
.uk-wrap::after{width:280px;height:280px;right:-110px;top:52%;background:radial-gradient(circle,rgba(50,107,129,.55),transparent 70%);animation-delay:-4s}
.uk-hero{max-width:100%;margin-bottom:18px}
.uk-kicker{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#c89245;margin-bottom:10px}
.uk-hero h1{font-size:clamp(1.9rem,4vw,3rem);line-height:1;margin:0 0 8px;color:#f4f2ed}
.uk-hero p{font-size:.96rem;line-height:1.5;color:#c3cdd4;margin:0;max-width:760px}
.uk-motion{position:relative;height:118px;margin:18px 0 10px;overflow:hidden;border-radius:14px;background:linear-gradient(180deg,#081725 0%,#0b2233 58%,#07131f 59%,#07131f 100%);border:1px solid rgba(200,146,69,.28);box-shadow:inset 0 0 38px rgba(0,0,0,.36),0 10px 28px rgba(0,0,0,.18)}
.uk-motion::before{content:"";position:absolute;left:-15%;right:-15%;bottom:24px;height:3px;background:repeating-linear-gradient(90deg,rgba(225,183,112,.92) 0 44px,transparent 44px 78px);filter:drop-shadow(0 0 6px rgba(225,183,112,.45));animation:ukRoadMove 1.1s linear infinite}
.uk-motion::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 82% 18%,rgba(200,146,69,.15),transparent 25%),repeating-linear-gradient(100deg,transparent 0 105px,rgba(96,165,250,.045) 105px 107px);animation:ukGridMove 8s linear infinite}
.uk-car{position:absolute;left:-180px;bottom:33px;width:152px;height:43px;border-radius:8px 20px 7px 7px;background:linear-gradient(180deg,#e2b96e 0%,#b87826 52%,#805019 100%);box-shadow:0 0 30px rgba(220,169,80,.38),42px 10px 45px rgba(74,161,255,.14);animation:ukCarDrive 7.2s cubic-bezier(.3,.05,.2,1) infinite;z-index:3}
.uk-car::before{content:"";position:absolute;left:54px;top:-27px;width:68px;height:30px;border-radius:8px 18px 2px 2px;background:linear-gradient(115deg,#163448 0 48%,#091a27 49% 100%);border:2px solid #c89245;box-shadow:inset 0 0 14px rgba(96,165,250,.14);clip-path:polygon(8% 100%,20% 10%,78% 0,100% 100%)}
.uk-car::after{content:"";position:absolute;left:0;right:0;bottom:-13px;height:20px;background:radial-gradient(circle at 31px 10px,#030609 0 8px,#8f9ca5 8.5px 11px,#111a21 11.5px 13px,transparent 13.5px),radial-gradient(circle at calc(100% - 31px) 10px,#030609 0 8px,#8f9ca5 8.5px 11px,#111a21 11.5px 13px,transparent 13.5px)}
.uk-car-bed{position:absolute;left:-2px;top:7px;width:52px;height:10px;border-top:3px solid rgba(255,239,210,.55);border-radius:5px;z-index:4}
.uk-headlight{position:absolute;right:-2px;top:13px;width:9px;height:8px;border-radius:50%;background:#fff3c4;box-shadow:0 0 9px #fff1ad,0 0 22px rgba(255,236,154,.8);z-index:5}
.uk-light{position:absolute;left:-28%;top:21px;width:35%;height:4px;background:linear-gradient(90deg,transparent,rgba(74,161,255,.75),rgba(255,255,255,.96),transparent);filter:blur(.5px);opacity:.75;animation:ukLightSweep 4.8s linear infinite}
@keyframes ukCarDrive{0%{transform:translateX(0) translateY(1px) scale(.94);opacity:0}7%{opacity:1}48%{transform:translateX(calc(50vw + 145px)) translateY(-2px) scale(1)}86%{opacity:1}100%{transform:translateX(calc(100vw + 390px)) translateY(0) scale(.97);opacity:0}}
@keyframes ukLightSweep{0%{transform:translateX(0);opacity:0}12%{opacity:.9}100%{transform:translateX(160vw);opacity:0}}
@keyframes ukRoadMove{to{transform:translateX(-78px)}}
@keyframes ukGridMove{to{transform:translateX(135px)}}
@media(max-width:600px){.uk-motion{height:104px}.uk-car{width:132px;height:38px;bottom:31px}.uk-car::before{left:48px;top:-24px;width:58px;height:27px}.uk-car-bed{width:45px}.uk-car::after{background:radial-gradient(circle at 27px 10px,#030609 0 7px,#8f9ca5 7.5px 10px,#111a21 10.5px 12px,transparent 12.5px),radial-gradient(circle at calc(100% - 27px) 10px,#030609 0 7px,#8f9ca5 7.5px 10px,#111a21 10.5px 12px,transparent 12.5px)}}
@media(prefers-reduced-motion:reduce){.uk-car,.uk-light,.uk-motion::before,.uk-motion::after{animation:none!important}.uk-car{left:50%;transform:translateX(-50%)}}
.uk-note{margin-top:12px;padding:11px 13px;border-left:3px solid #c89245;background:#0d1b28;border-radius:8px;color:#d7e0e6;font-size:12px;box-shadow:0 10px 28px rgba(0,0,0,.16)}
.uk-live{margin-top:9px;font-size:11px;color:#9ba8b3}.uk-standards{margin:14px 0 18px;padding:13px 14px;border:1px solid rgba(200,146,69,.28);border-radius:10px;background:#0a1723;color:#d7e0e6;font-size:12px;line-height:1.55}.uk-standards strong{color:#e1b770}
.uk-search{display:flex;gap:9px;flex-wrap:wrap;margin:16px 0 22px}.uk-search input,.uk-search select{min-height:43px;padding:9px 12px;border:1px solid rgba(200,146,69,.4);border-radius:9px;background:#0b1d2b;color:#eef3f6;font:inherit}.uk-search input{flex:2 1 210px}.uk-search select{flex:1 1 140px}.uk-search button{padding:9px 17px;border:1px solid #c89245;border-radius:9px;background:#c89245;color:#07131f;font-weight:800}.uk-search a{align-self:center;color:#e1b770}
.uk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
.uk-card{position:relative;background:#0c1a27;border:1px solid rgba(200,146,69,.28);border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.24);animation:ukFade .55s ease both,ukGlow 4.5s ease-in-out infinite alternate}
.uk-photo{position:relative;background:linear-gradient(110deg,#0a1722 8%,#132637 18%,#0a1722 33%);background-size:200% 100%;aspect-ratio:16/10;overflow:hidden;animation:ukShimmer 1.6s linear infinite}
.uk-photo img{width:100%;height:100%;object-fit:cover;display:block;position:relative;z-index:1;background:#0a1722}
.uk-badge{position:absolute;z-index:2;left:14px;top:14px;background:rgba(7,19,31,.92);color:#e1b770;border:1px solid rgba(200,146,69,.55);border-radius:999px;padding:7px 10px;font-size:10px;font-weight:800;letter-spacing:.05em}
.uk-info{padding:20px}
.uk-id{font-size:11px;color:#9ba8b3;font-weight:800}
.uk-info h2{font-size:1.55rem;margin:7px 0 5px;color:#f4f2ed}
.uk-sub{font-weight:700;color:#c8d2d9;margin-bottom:17px}
.price-box{display:grid;grid-template-columns:1fr;gap:9px;margin-bottom:14px}
.price-box>div{padding:12px;border-radius:10px;background:#0f2231;border:1px solid rgba(200,146,69,.24)}
.price-box span{display:block;font-size:9px;text-transform:uppercase;font-weight:800;color:#9ba8b3;margin-bottom:5px}
.price-box strong{font-size:18px;color:#f0dfbf}.price-box small{display:block;margin-top:5px;color:#9ba8b3;font-size:10px;line-height:1.4}.price-box small a{color:#e1b770;text-decoration:none;font-weight:800}.price-box small a:hover{text-decoration:underline}
.uk-specs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.uk-spec{padding:10px;border-radius:9px;background:#091824;border:1px solid rgba(200,146,69,.18)}
.uk-spec span{display:block;font-size:9px;text-transform:uppercase;font-weight:800;color:#8193a4;margin-bottom:4px}
.uk-spec strong{font-size:12px;color:#e6edf1}
.reserve{margin-top:17px;border-top:1px solid rgba(200,146,69,.18);padding-top:14px}
.reserve summary{cursor:pointer;font-weight:800;color:#e1b770}
.book-panel{padding-top:14px}
.book-panel p{font-size:12px;color:#9ba8b3}
.book-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.book-panel input,.book-panel textarea{width:100%;padding:10px;border:1px solid rgba(200,146,69,.3);border-radius:8px;font:inherit;background:#07131f;color:#eef3f6}
.book-panel textarea{margin:8px 0;min-height:76px}
.uk-btn{display:inline-flex;padding:11px 14px;border-radius:9px;text-decoration:none;font-weight:800;border:1px solid #c89245}
.uk-btn.primary{background:linear-gradient(135deg,#e7bc70,#c58b3a);color:#07131f}
.success{background:#10281e;border:1px solid #2f6d4f;color:#d5f1df;padding:12px 14px;border-radius:9px;margin-bottom:18px}
.uk-empty{background:#0c1a27;border:1px dashed rgba(200,146,69,.35);border-radius:14px;padding:36px;text-align:center;color:#c3cdd4}
.uk-foot{margin-top:22px;font-size:12px;color:#8193a4}
@keyframes ukShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes ukFade{from{opacity:0;transform:translateY(14px) scale(.992)}to{opacity:1;transform:none}}
@keyframes ukGlow{from{box-shadow:0 18px 45px rgba(0,0,0,.24),0 0 0 rgba(200,146,69,0)}to{box-shadow:0 20px 52px rgba(0,0,0,.3),0 0 28px rgba(200,146,69,.09)}}
@keyframes ukDrift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(18px,-22px,0) scale(1.08)}}
@media(max-width:860px){.uk-grid{grid-template-columns:1fr}.price-box{grid-template-columns:1fr}.uk-specs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){.book-grid{grid-template-columns:1fr}}

</style><div class="uk-wrap"><div class="uk-hero"><div class="uk-kicker">ROVIQ • LIVE U.S. VEHICLE APP</div><h1>${formPage?"Request this vehicle":"Trucks selected for Ukraine."}</h1><p>${formPage?`<a href="/ukraine" style="color:#e1b770">← Back to all vehicles</a>`:"Chevrolet Silverado, GMC Sierra and Ford F-150 listings under 60,000 miles. Prices and availability require confirmation before purchase."}</p>${formPage?"":`<div class="uk-motion" aria-hidden="true"><span class="uk-light"></span><span class="uk-car"><span class="uk-car-bed"></span><span class="uk-headlight"></span></span></div>`}<div class="uk-live">● ${vehicles.length} currently listed • Last sync attempt: ${synced}</div></div>
${bookingId?`<div class="success"><strong>Request received.</strong> ROVIQ rechecked live availability. Booking ID: ${bookingId}. Final availability confirmation is required before the vehicle is secured.</div>`:""}\n${unavailableId?`<div class="success" style="background:#2b1717;border-color:#7a3b3b;color:#ffd9d9"><strong>Vehicle no longer available for reservation.</strong> ROVIQ rechecked ${unavailableId} before creating a booking. Please choose another vehicle.</div>`:""}
${formPage?"":`<form class="uk-search" method="GET" action="/ukraine" aria-label="Search vehicle inventory"><input type="search" name="q" placeholder="Search year, model, trim or engine" value="${esc(filters.get("q"))}"><select name="make"><option value="">Chevrolet, GMC & Ford</option><option value="Chevrolet"${selected("make","Chevrolet")}>Chevrolet</option><option value="GMC"${selected("make","GMC")}>GMC</option><option value="Ford"${selected("make","Ford")}>Ford</option></select><select name="fuel"><option value="">All fuel types</option><option value="Gasoline"${selected("fuel","Gasoline")}>Gasoline</option><option value="Diesel"${selected("fuel","Diesel")}>Diesel</option><option value="Electric"${selected("fuel","Electric")}>Electric</option></select><select name="maxMileage"><option value="">Any mileage</option><option value="10000"${selected("maxMileage","10000")}>Under 10,000 mi</option><option value="30000"${selected("maxMileage","30000")}>Under 30,000 mi</option><option value="60000"${selected("maxMileage","60000")}>Under 60,000 mi</option></select><button type="submit">Search</button><a href="/ukraine">Clear</a></form><p style="color:#9ba8b3;font-size:12px">${vehicles.length} of ${inventory?.totalVehicles??vehicles.length} listed vehicles</p>`}
${vehicles.length?`<div class="uk-grid">${vehicles.map(v=>card(v,formPage)).join("")}</div>`:`<div class="uk-empty">Inventory sync is initializing.</div>`}
<div class="uk-foot">Shipping is a preliminary Oregon-to-Rijeka estimate and may change after vehicle selection. ROVIQ re-verifies vehicle history, title status, export eligibility and logistics before commitment.</div></div>`}