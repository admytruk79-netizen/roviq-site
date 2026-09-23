import { getPricingConfig, publicPricing } from "./pricing.js";
const INVENTORY_KEY = "vehicle_inventory:v1";
const MAX_MILES = 60000;

const SOURCE_PLUGINS = [
  {
    id: "carr",
    name: "CARR Chevrolet",
    inventoryUrls: [
      "https://www.carrchevrolet.com/used-inventory/index.htm",
      "https://www.carrchevrolet.com/used-inventory/index.htm?make=Chevrolet&model=Silverado+1500",
      "https://www.carrchevrolet.com/used-inventory/index.htm?make=Chevrolet&model=Silverado+2500+HD",
      "https://www.carrchevrolet.com/certified-inventory/index.htm",
      "https://www.carrchevrolet.com/certified-inventory/index.htm?make=Chevrolet&model=Silverado+1500",
      "https://www.carrchevrolet.com/certified-inventory/index.htm?make=Chevrolet&model=Silverado+2500+HD"
    ],
    baseUrl: "https://www.carrchevrolet.com"
  },
  {
    id: "ron-tonkin-chevrolet",
    name: "Ron Tonkin Chevrolet",
    inventoryUrls: [
      "https://www.rontonkinchevrolet.com/used-vehicles/"
    ],
    baseUrl: "https://www.rontonkinchevrolet.com"
  },
  {
    id: "damerow-ford",
    name: "Damerow Ford",
    inventoryUrls: [
      "https://www.damerowford.com/inventory/used-vehicles/models-Ford-F--150/srp-page-1/srp-sort-models--asc/",
      "https://www.damerowford.com/inventory/used-vehicles/used/",
      "https://www.damerowford.com/inventory/pre-owned-super-store/"
    ],
    baseUrl: "https://www.damerowford.com"
  }
];

const SEEDS = [
  {
    id: "ROVIQ-US-0001",
    sourceId: "carr",
    sourceUrl: "https://www.carrchevrolet.com/used/Chevrolet/2026-Chevrolet-Silverado-1500-8fbee0baac1839ba6a4280d5c7d82991.htm",
    year: 2026,
    make: "Chevrolet",
    model: "Silverado 1500",
    trim: "WT",
    mileageMi: 5229,
    engine: "2.7L TurboMax",
    drivetrain: "4×4",
    transmission: "8-speed automatic",
    fuel: "Gasoline",
    exterior: "Sterling Gray Metallic",
    interior: "Jet Black vinyl",
    vin: "1GCPKAEKXTZ108327",
    directImage: "https://pictures.dealer.com/c/carrautogroupinc/0504/8ea960d39094638f006afbe60e3d52abx.jpg?imdensity=1&impolicy=downsize_bkpt&w=1400"
  }
];

function now() { return new Date().toISOString(); }
function abs(href, base) { try { return new URL(href, base).href; } catch { return null; } }
function clean(s="") { return s.replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim(); }
function num(s) { if (!s) return null; const n = Number(String(s).replace(/[^0-9.]/g,"")); return Number.isFinite(n) ? n : null; }
function meta(html, key) {
  const a = new RegExp('<meta[^>]+(?:property|name)=["\\']'+key+'["\\'][^>]+content=["\\']([^"\\']+)["\\']',"i");
  const b = new RegExp('<meta[^>]+content=["\\']([^"\\']+)["\\'][^>]+(?:property|name)=["\\']'+key+'["\\']',"i");
  return clean((html.match(a)||html.match(b)||[])[1]||"") || null;
}
function first(html, re) { const m = html.match(re); return m ? clean(m[1]||m[0]) : null; }

function extractImage(html) {
  const og = meta(html,"og:image");
  if (og) return og;

  const jsonImage = first(html,/"image"\s*:\s*"([^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/i);
  if (jsonImage) return jsonImage.replace(/\\u0026/g,"&").replace(/\\\//g,"/");

  const jsonArrayImage = first(html,/"image"\s*:\s*\[\s*"([^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/i);
  if (jsonArrayImage) return jsonArrayImage.replace(/\\u0026/g,"&").replace(/\\\//g,"/");

  const lazy = first(html,/(?:data-src|data-lazy-src|data-original|src)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/i);
  if (lazy) return lazy.replace(/&amp;/g,"&");

  const dealerCdn = first(html,/(https?:\/\/(?:pictures\.dealer\.com|vehicle-images\.dealerinspire\.com|images\.autotrader\.com|images\.cars\.com)[^"'<>\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\s]*)?)/i);
  return dealerCdn ? dealerCdn.replace(/&amp;/g,"&") : null;
}

async function fetchHtml(url) {
  const r = await fetch(url, {
    redirect:"follow",
    headers:{
      "user-agent":"Mozilla/5.0 (compatible; ROVIQInventorySync/1.0)",
      "accept":"text/html,application/xhtml+xml"
    }
  });
  return { ok:r.ok, status:r.status, html:r.ok ? await r.text() : "" };
}

function looksLikeListing(url) {
  return /(silverado|sierra|f-?150)/i.test(url) && /(used|preowned|pre-owned|vehicle|inventory)/i.test(url);
}

function discover(html, source) {
  const out = new Set();
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const u = abs(m[1], source.baseUrl);
    if (u && looksLikeListing(u)) out.add(u.split("#")[0]);
    if (out.size >= 30) break;
  }
  return [...out];
}

function parseDetail(html, source, url, previous={}) {
  const text = clean(html.slice(0, 600000));
  const title = meta(html,"og:title") || first(html,/<title[^>]*>([\s\S]*?)<\/title>/i) || "";
  const combined = title+" "+text;

  const year = Number((combined.match(/\b(20\d{2})\b/)||[])[1] || previous.year || 0) || null;
  const make = ((combined.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1] || previous.make || "").replace(/^./,c=>c.toUpperCase());
  const model = ((combined.match(/\b(Silverado(?:\s+1500(?:\s+LTD)?|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|Sierra(?:\s+1500|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|F-?150(?:\s+Lightning)?)\b/i)||[])[1] || previous.model || "").replace(/\s+/g," ").replace(/^F150$/i,"F-150");
  const mileage = num(first(html,/(?:Odometer|Mileage)[^0-9]{0,80}([0-9][0-9,.]{0,10}\s*(?:mi|miles?))/i) || (combined.match(/\b([0-9][0-9,]{2,6})\s*(?:mi|miles?)\b/i)||[])[1]) ?? previous.mileageMi;
  const vin = ((combined.match(/\b([A-HJ-NPR-Z0-9]{17})\b/)||[])[1] || previous.vin || null);
  const image = extractImage(html) || previous.directImage || null;
  const engine = first(html,/(?:Engine|Engine Type)[^A-Za-z0-9]{0,50}([^<\n]{2,90})/i) || previous.engine || null;
  const drivetrain = first(html,/(?:Drivetrain|Drive Type)[^A-Za-z0-9]{0,50}([^<\n]{2,50})/i) || previous.drivetrain || null;
  const transmission = first(html,/Transmission[^A-Za-z0-9]{0,50}([^<\n]{2,70})/i) || previous.transmission || "Automatic";
  const exterior = first(html,/Exterior(?: Color)?[^A-Za-z0-9]{0,50}([^<\n]{2,70})/i) || previous.exterior || "See photo";
  const interior = first(html,/Interior(?: Color)?[^A-Za-z0-9]{0,50}([^<\n]{2,70})/i) || previous.interior || "See details";
  const fuel = /\b(EV|electric|dual[- ]motor)\b/i.test(combined) ? "Electric" : (/duramax|diesel/i.test(combined+" "+(engine||"")) ? "Diesel" : previous.fuel || "Gasoline");
  const soldSignal = /\b(sold|no longer available|vehicle unavailable|removed from inventory)\b/i.test(combined);

  return { ...previous, sourceId:source.id, sourceNameInternal:source.name, sourceUrl:url, year, make, model, mileageMi:mileage, vin, directImage:image, engine, drivetrain, transmission, exterior, interior, fuel, soldSignal };
}

function stableId(v) {
  if (v.id) return v.id;
  if (v.vin) return "ROVIQ-US-"+v.vin.slice(-8);
  let h=0; for(const c of v.sourceUrl||""){h=((h<<5)-h)+c.charCodeAt(0);h|=0;}
  return "ROVIQ-US-"+Math.abs(h);
}

async function readState(env) {
  const raw = env.CONTENT ? await env.CONTENT.get(INVENTORY_KEY) : null;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function saveState(env,state) { if (env.CONTENT) await env.CONTENT.put(INVENTORY_KEY,JSON.stringify(state)); }

export async function syncVehicleInventory(env) {
  const old = await readState(env);
  const oldVehicles = old?.vehicles || SEEDS.map(v=>({...v,status:"available",missCount:0,firstSeenAt:now()}));
  const byUrl = Object.fromEntries(oldVehicles.map(v=>[v.sourceUrl,v]));
  const candidates = new Map(oldVehicles.map(v=>[v.sourceUrl,{sourceId:v.sourceId,previous:v}]));
  for (const seed of SEEDS) candidates.set(seed.sourceUrl,{sourceId:seed.sourceId,previous:byUrl[seed.sourceUrl]||seed});

  for (const source of SOURCE_PLUGINS) {
    for (const inventoryUrl of (source.inventoryUrls || [])) {
      try {
        const r=await fetchHtml(inventoryUrl);
        if (!r.ok) continue;
        for (const url of discover(r.html,source)) {
          if(!candidates.has(url)) candidates.set(url,{sourceId:source.id,previous:byUrl[url]||{}});
        }
      } catch {}
    }
  }

  const vehicles=[];
  let checks=0;
  for (const [url,metaInfo] of candidates) {
    if (checks >= 90 && !metaInfo.previous?.id) continue;
    const source = SOURCE_PLUGINS.find(s=>s.id===metaInfo.sourceId) || SOURCE_PLUGINS.find(s=>url.startsWith(s.baseUrl));
    if (!source) continue;
    const prev=metaInfo.previous||{};
    let v={...prev,sourceId:source.id,sourceNameInternal:source.name,sourceUrl:url};
    try {
      checks++;
      const r=await fetchHtml(url);
      if (!r.ok) {
        v.missCount=(prev.missCount||0)+1;
        v.status=v.missCount>=2?"unavailable":(prev.status||"available");
      } else {
        v=parseDetail(r.html,source,url,prev);
        if(v.soldSignal){
          v.missCount=(prev.missCount||0)+1;
          v.status=v.missCount>=2?"sold":(prev.status||"available");
        } else {
          v.missCount=0; v.status="available"; v.lastVerifiedAt=now(); v.firstSeenAt=prev.firstSeenAt||now();
        }
      }
    } catch {
      v.missCount=(prev.missCount||0)+1;
      v.status=v.missCount>=2?"unavailable":(prev.status||"available");
    }
    if(!v.year||!v.make||!v.model||v.mileageMi==null) continue;
    if(v.mileageMi>=MAX_MILES) continue;
    if(!/^(Chevrolet|GMC|Ford)$/i.test(v.make)) continue;
    if(!/(Silverado|Sierra|F-?150)/i.test(v.model)) continue;
    v.id=stableId(v);
    vehicles.push(v);
  }

  const state={version:2,maxMileage:MAX_MILES,syncedAt:now(),sources:SOURCE_PLUGINS.map(({id,name})=>({id,name})),vehicles};
  await saveState(env,state);
  return state;
}

export async function getVehicleInventory(env) {
  let state=await readState(env);
  const age=state?.syncedAt ? Date.now()-Date.parse(state.syncedAt) : Infinity;
  if(!state || !Number.isFinite(age) || age > 30*60*1000) state=await syncVehicleInventory(env);
  const vehicles=(state.vehicles||[]).filter(v=>v.status==="available"&&v.mileageMi<MAX_MILES).sort((a,b)=>a.mileageMi-b.mileageMi).map(v=>({
    id:v.id,year:v.year,make:v.make,model:v.model,trim:v.trim||"",mileageMi:v.mileageMi,
    engine:v.engine||"Specification pending",drivetrain:v.drivetrain||"4WD/AWD",
    transmission:v.transmission||"Automatic",fuel:v.fuel||"Gasoline",exterior:v.exterior||"See photo",
    interior:v.interior||"See details",vinPublic:v.vin?"••••••"+v.vin.slice(-6):"ROVIQ",
    imagePath:"/ukraine/image/"+encodeURIComponent(v.id),lastVerifiedAt:v.lastVerifiedAt
  }));
  return {syncedAt:state.syncedAt,maxMileage:MAX_MILES,vehicles};
}

export async function getInventoryAdmin(env) {
  let state=await readState(env); if(!state) state=await syncVehicleInventory(env); return state;
}

export async function getVehicleImageResponse(request,env) {
  const id=decodeURIComponent(new URL(request.url).pathname.split("/").pop()||"");
  const state=await readState(env);
  const v=(state?.vehicles||[]).find(x=>x.id===id)||SEEDS.find(x=>x.id===id);
  if(!v) return new Response("Not found",{status:404});

  let image=v.directImage||null;
  if(!image&&v.sourceUrl){
    try{
      const r=await fetchHtml(v.sourceUrl);
      if(r.ok) image=extractImage(r.html);
    }catch{}
  }

  if(image){
    try{
      const img=await fetch(image,{
        redirect:"follow",
        headers:{
          "user-agent":"Mozilla/5.0 (compatible; ROVIQVehicleCatalog/1.0)",
          "accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "referer":v.sourceUrl||"https://roviq-site.admytruk79.workers.dev/"
        }
      });
      const type=(img.headers.get("content-type")||"").toLowerCase();
      if(img.ok && type.startsWith("image/")){
        const headers=new Headers();
        headers.set("content-type",type);
        headers.set("cache-control","public, max-age=1800, s-maxage=1800");
        headers.set("access-control-allow-origin","*");
        return new Response(img.body,{status:200,headers});
      }
    }catch{}
  }

  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="100%" height="100%" fill="#dce6ee"/><text x="50%" y="48%" text-anchor="middle" font-family="Arial" font-size="72" font-weight="700" fill="#173c5d">ROVIQ</text><text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="28" fill="#527087">Vehicle photo updating</text></svg>';
  return new Response(svg,{headers:{"content-type":"image/svg+xml","cache-control":"no-store"}});
}
