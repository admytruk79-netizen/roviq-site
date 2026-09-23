import { getPricingConfig, publicPricing } from "./pricing.js";
const INVENTORY_KEY = "vehicle_inventory:v1";
const MAX_MILES = 60000;
const INVENTORY_SCHEMA_VERSION = 5;

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
    baseUrl: "https://www.rontonkinchevrolet.com",
    detailPatterns: [
      /\/inventory\/(?:certified-)?used-.*silverado/i,
      /\/used-.*silverado/i
    ]
  },
  {
    id: "beaverton-gmc",
    name: "Buick GMC of Beaverton",
    inventoryUrls: [
      "https://www.beavertongmc.com/searchused.aspx"
    ],
    baseUrl: "https://www.beavertongmc.com",
    detailPatterns: [
      /\/used-.*(?:silverado|sierra)/i
    ]
  },
  {
    id: "damerow-ford",
    name: "Damerow Ford",
    inventoryUrls: [
      "https://www.damerowford.com/inventory/used-vehicles/models-Ford-F--150/"
    ],
    baseUrl: "https://www.damerowford.com",
    detailPatterns: [
      /\/inventory\/(?:certified-)?used-.*f-?150/i
    ]
  },
  {
    id: "northside-ford",
    name: "Northside Ford",
    inventoryUrls: [
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--150/"
    ],
    baseUrl: "https://www.northsideford.net",
    detailPatterns: [
      /\/inventory\/(?:certified-)?used-.*f-?150/i,
      /\/vehicle\/.*f-?150/i
    ]
  },
  {
    id: "courtesy-ford",
    name: "Courtesy Ford",
    inventoryUrls: [
      "https://www.courtesyford.com/used-vehicles/"
    ],
    baseUrl: "https://www.courtesyford.com",
    detailPatterns: [
      /\/inventory\/(?:certified-)?used-.*f-?150/i
    ]
  },
  {
    id: "auto-town-gmc",
    name: "Auto Town GMC",
    inventoryUrls: [
      "https://www.autotowngmc.com/searchused.aspx"
    ],
    baseUrl: "https://www.autotowngmc.com",
    detailPatterns: [
      /\/used-.*(?:silverado|sierra)/i
    ]
  },
  {
    id: "aa-motor-pdx",
    name: "A&A Motor PDX",
    inventoryUrls: [
      "https://www.motorpdx.com/ford/f-150-for-sale",
      "https://www.motorpdx.com/ford-for-sale"
    ],
    baseUrl: "https://www.motorpdx.com"
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
  },
  {
    id: "ROVIQ-US-BGMC-147229",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2024-Chevrolet-Silverado%2B1500-WT-3GCPDAEK3RG147229",
    year: 2024, make: "Chevrolet", model: "Silverado 1500", trim: "WT",
    mileageMi: 27363, engine: "2.7L TurboMax", drivetrain: "4WD", transmission: "Automatic",
    fuel: "Gasoline", exterior: "Summit White", interior: "Jet Black cloth", vin: "3GCPDAEK3RG147229"
  },
  {
    id: "ROVIQ-US-BGMC-636138",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2022-Chevrolet-Silverado%2B1500-Custom%2BTrail%2BBoss-3GCPDCEK5NG636138",
    year: 2022, make: "Chevrolet", model: "Silverado 1500", trim: "Custom Trail Boss",
    mileageMi: 47074, engine: "2.7L Turbo", drivetrain: "4WD", transmission: "Automatic",
    fuel: "Gasoline", exterior: "Summit White", interior: "Jet Black cloth", vin: "3GCPDCEK5NG636138"
  },
  {
    id: "ROVIQ-US-BGMC-407865",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2026-Chevrolet-Silverado%2BEV-Trail%2BBoss%2B%2B%2BMax%2BRange-1GC405EL2TU407865",
    year: 2026, make: "Chevrolet", model: "Silverado EV", trim: "Trail Boss Max Range",
    mileageMi: 4119, engine: "Dual-motor electric", drivetrain: "AWD", transmission: "Single-speed",
    fuel: "Electric", exterior: "Riptide Blue Metallic", interior: "Black / Artemis", vin: "1GC405EL2TU407865"
  },
  {
    id: "ROVIQ-US-BGMC-403489",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2026-Chevrolet-Silverado%2BEV-LT%2B%2B%2BMax%2BRange-1GC400EL9TU403489",
    year: 2026, make: "Chevrolet", model: "Silverado EV", trim: "LT Max Range",
    mileageMi: 4005, engine: "Dual-motor electric", drivetrain: "AWD", transmission: "Single-speed",
    fuel: "Electric", exterior: "Summit White", interior: "Black Evotex", vin: "1GC400EL9TU403489"
  },
  {
    id: "ROVIQ-US-BGMC-412397",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2026-Chevrolet-Silverado%2BEV-LT%2B%2B%2BMax%2BRange-1GC400EL5TU412397",
    year: 2026, make: "Chevrolet", model: "Silverado EV", trim: "LT Max Range",
    mileageMi: 10602, engine: "Dual-motor electric", drivetrain: "AWD", transmission: "Single-speed",
    fuel: "Electric", exterior: "Summit White", interior: "Black Evotex", vin: "1GC400EL5TU412397"
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
    if (!u) continue;
    const customMatch=(source.detailPatterns||[]).some(p=>p.test(u));
    if (customMatch || looksLikeListing(u)) out.add(u.split("#")[0]);
    if (out.size >= 40) break;
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
  const priceMatch = combined.match(/\$\s*([1-9][0-9,]{3,7})\b/);
  const askingPrice = priceMatch ? num(priceMatch[1]) : (previous.askingPrice ?? null);
  const soldSignal = /\b(sold|no longer available|vehicle unavailable|removed from inventory)\b/i.test(combined);

  return { ...previous, sourceId:source.id, sourceNameInternal:source.name, sourceUrl:url, year, make, model, mileageMi:mileage, vin, directImage:image, engine, drivetrain, transmission, exterior, interior, fuel, askingPrice, soldSignal };
}

function isPublicReady(v) {
  return Boolean(
    v &&
    v.status === "available" &&
    v.mileageMi != null &&
    v.mileageMi < MAX_MILES &&
    v.directImage &&
    v.year &&
    v.make &&
    v.model &&
    v.engine &&
    v.drivetrain
  );
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

  const previousSources = Object.fromEntries((old?.sources || []).map(s => [s.id, s]));
  const sourceHealth = {};
  for (const source of SOURCE_PLUGINS) {
    const health = sourceHealth[source.id] = {
      id: source.id,
      name: source.name,
      attemptedAt: now(),
      lastSuccessAt: previousSources[source.id]?.lastSuccessAt || null,
      inventoryPagesOk: 0,
      inventoryPagesFailed: 0,
      discovered: 0,
      detailChecks: 0,
      detailFailures: 0
    };
    for (const inventoryUrl of (source.inventoryUrls || [])) {
      try {
        const r=await fetchHtml(inventoryUrl);
        if (!r.ok) { health.inventoryPagesFailed++; continue; }
        health.inventoryPagesOk++;
        health.lastSuccessAt = now();
        const found = discover(r.html,source);
        health.discovered += found.length;
        for (const url of found) {
          if(!candidates.has(url)) candidates.set(url,{sourceId:source.id,previous:byUrl[url]||{}});
        }
      } catch { health.inventoryPagesFailed++; }
    }
  }

  const candidateEntries = [...candidates.entries()]
    .sort((a,b) => Number(Boolean(b[1].previous?.id)) - Number(Boolean(a[1].previous?.id)))
    .slice(0,72);

  async function inspectCandidate(entry) {
    const [url,metaInfo] = entry;
    const source = SOURCE_PLUGINS.find(s=>s.id===metaInfo.sourceId) || SOURCE_PLUGINS.find(s=>url.startsWith(s.baseUrl));
    if (!source) return null;
    const prev=metaInfo.previous||{};
    let v={...prev,sourceId:source.id,sourceNameInternal:source.name,sourceUrl:url};

    try {
      if (sourceHealth[source.id]) sourceHealth[source.id].detailChecks++;
      const r=await fetchHtml(url);
      if (!r.ok) {
        if (sourceHealth[source.id]) sourceHealth[source.id].detailFailures++;
        v.missCount=(prev.missCount||0)+1;
        v.status=v.missCount>=2?"unavailable":(prev.status||"available");
        if(v.status==="unavailable" && !v.unavailableAt) v.unavailableAt=now();
      } else {
        v=parseDetail(r.html,source,url,prev);
        if(v.soldSignal){
          v.missCount=(prev.missCount||0)+1;
          v.status=v.missCount>=2?"sold":(prev.status||"available");
          if(v.status==="sold" && !v.soldAt) v.soldAt=now();
        } else {
          v.missCount=0;
          v.status="available";
          v.lastVerifiedAt=now();
          v.firstSeenAt=prev.firstSeenAt||now();
          v.unavailableAt=null;
          v.soldAt=null;
        }
      }
    } catch {
      if (sourceHealth[source.id]) sourceHealth[source.id].detailFailures++;
      v.missCount=(prev.missCount||0)+1;
      v.status=v.missCount>=2?"unavailable":(prev.status||"available");
      if(v.status==="unavailable" && !v.unavailableAt) v.unavailableAt=now();
    }

    if(!v.year||!v.make||!v.model||v.mileageMi==null) return null;
    if(v.mileageMi>=MAX_MILES) return null;
    if(!/^(Chevrolet|GMC|Ford)$/i.test(v.make)) return null;
    if(!/(Silverado|Sierra|F-?150)/i.test(v.model)) return null;
    v.id=stableId(v);
    return v;
  }

  const vehicles=[];
  const concurrency=6;
  for(let i=0;i<candidateEntries.length;i+=concurrency){
    const batch=candidateEntries.slice(i,i+concurrency);
    const results=await Promise.all(batch.map(inspectCandidate));
    vehicles.push(...results.filter(Boolean));
  }

  // The same VIN can appear through multiple SRP/detail URL variants.
  // Keep one canonical record, preferring available, recently verified, image-rich records.
  const deduped=new Map();
  for(const v of vehicles){
    const key=v.vin ? "vin:"+v.vin : "url:"+v.sourceUrl;
    const existing=deduped.get(key);
    if(!existing){ deduped.set(key,v); continue; }
    const score=x =>
      (x.status==="available"?100:0) +
      (x.directImage?20:0) +
      (x.engine?5:0) +
      (x.lastVerifiedAt?Math.min(10,Math.max(0,10-(Date.now()-Date.parse(x.lastVerifiedAt))/86400000)):0);
    if(score(v)>score(existing)) deduped.set(key,v);
  }
  const uniqueVehicles=[...deduped.values()];

  const cutoff = Date.now() - 30*24*60*60*1000;  const cutoff = Date.now() - 30*24*60*60*1000;
  const retainedVehicles = uniqueVehicles.filter(v => {
    const retired = v.soldAt || v.unavailableAt;
    return !retired || Date.parse(retired) >= cutoff;
  });

  const sources = SOURCE_PLUGINS.map(({id,name}) => {
    const h = sourceHealth[id] || { id, name, attemptedAt: now(), inventoryPagesOk:0, inventoryPagesFailed:0, discovered:0, detailChecks:0, detailFailures:0 };
    const matching = retainedVehicles.filter(v => v.sourceId === id);
    return { ...h, availableVehicles: matching.filter(v=>v.status==="available").length, totalVehicles: matching.length };
  });
  const state={version:INVENTORY_SCHEMA_VERSION,maxMileage:MAX_MILES,syncedAt:now(),sources,vehicles:retainedVehicles};
  await saveState(env,state);
  return state;
}

export async function getVehicleInventory(env) {
  let state=await readState(env);
  const age=state?.syncedAt ? Date.now()-Date.parse(state.syncedAt) : Infinity;
  if(!state || state.version !== INVENTORY_SCHEMA_VERSION || !Number.isFinite(age) || age > 30*60*1000) state=await syncVehicleInventory(env);
  const pricingConfig=await getPricingConfig(env);
  const vehicles=(state.vehicles||[]).filter(isPublicReady).sort((a,b)=>a.mileageMi-b.mileageMi).map(v=>({
    id:v.id,year:v.year,make:v.make,model:v.model,trim:v.trim||"",mileageMi:v.mileageMi,
    engine:v.engine||"Specification pending",drivetrain:v.drivetrain||"4WD/AWD",
    transmission:v.transmission||"Automatic",fuel:v.fuel||"Gasoline",exterior:v.exterior||"See photo",
    interior:v.interior||"See details",vinPublic:v.vin?"••••••"+v.vin.slice(-6):"ROVIQ",
    imagePath:"/ukraine/image/"+encodeURIComponent(v.id),lastVerifiedAt:v.lastVerifiedAt,
    pricing:publicPricing(v,pricingConfig)
  }));
  return {syncedAt:state.syncedAt,maxMileage:MAX_MILES,vehicles};
}

export async function getPublicInventoryHealth(env) {
  let state=await readState(env);
  const age=state?.syncedAt ? Date.now()-Date.parse(state.syncedAt) : Infinity;
  if(!state || state.version !== INVENTORY_SCHEMA_VERSION || !Number.isFinite(age) || age > 30*60*1000) state=await syncVehicleInventory(env);
  const vehicles=state.vehicles||[];
  return {
    version: state.version,
    syncedAt: state.syncedAt,
    maxMileage: state.maxMileage,
    counts: {
      total: vehicles.length,
      available: vehicles.filter(v=>v.status==="available").length,
      publicReady: vehicles.filter(isPublicReady).length,
      sold: vehicles.filter(v=>v.status==="sold").length,
      unavailable: vehicles.filter(v=>v.status==="unavailable").length,
      withImages: vehicles.filter(v=>v.status==="available" && Boolean(v.directImage)).length
    },
    sources: (state.sources||[]).map(s=>({
      id:s.id,
      healthy:Number(s.inventoryPagesOk||0)>0,
      pagesOk:Number(s.inventoryPagesOk||0),
      pagesFailed:Number(s.inventoryPagesFailed||0),
      discovered:Number(s.discovered||0),
      detailChecks:Number(s.detailChecks||0),
      detailFailures:Number(s.detailFailures||0),
      availableVehicles:Number(s.availableVehicles||0),
      lastSuccessAt:s.lastSuccessAt||null
    }))
  };
}

export async function getInventoryAdmin(env) {
  let state=await readState(env); if(!state) state=await syncVehicleInventory(env); return state;
}

export async function getInventoryDiagnostics(env) {
  const state=await getInventoryAdmin(env);
  const vehicles=state.vehicles||[];
  const available=vehicles.filter(v=>v.status==="available");
  const nowMs=Date.now();
  const issues=[];
  const seenVin=new Set();

  for(const v of available){
    if(v.vin){
      if(seenVin.has(v.vin)) issues.push({severity:"warn",vehicleId:v.id,type:"duplicate_vin",message:"Duplicate VIN in available inventory"});
      seenVin.add(v.vin);
    }
    if(!v.directImage) issues.push({severity:"warn",vehicleId:v.id,type:"missing_image",message:"No cached source image URL"});
    if(!v.engine) issues.push({severity:"warn",vehicleId:v.id,type:"missing_engine",message:"Engine specification missing"});
    if(!v.drivetrain) issues.push({severity:"warn",vehicleId:v.id,type:"missing_drivetrain",message:"Drivetrain specification missing"});
    if(!v.lastVerifiedAt) issues.push({severity:"warn",vehicleId:v.id,type:"never_verified",message:"Vehicle has not completed a successful verification"});
    else if(nowMs-Date.parse(v.lastVerifiedAt)>3*60*60*1000) issues.push({severity:"warn",vehicleId:v.id,type:"stale",message:"Vehicle has not been verified in more than 3 hours"});
    if(v.mileageMi>=MAX_MILES) issues.push({severity:"error",vehicleId:v.id,type:"mileage_filter",message:"Vehicle exceeds public mileage limit"});
  }

  const sourceIssues=(state.sources||[]).flatMap(s=>{
    const out=[];
    if(Number(s.inventoryPagesOk||0)===0) out.push({severity:"error",sourceId:s.id,type:"source_unreachable",message:s.name+" returned no healthy inventory page"});
    else if(Number(s.discovered||0)===0 && Number(s.availableVehicles||0)===0) out.push({severity:"warn",sourceId:s.id,type:"source_empty",message:s.name+" is reachable but yielded no matching vehicles"});
    if(Number(s.detailChecks||0)>0 && Number(s.detailFailures||0)/Number(s.detailChecks||1)>0.5) out.push({severity:"warn",sourceId:s.id,type:"detail_failure_rate",message:s.name+" has a high detail-page failure rate"});
    return out;
  });

  return {
    generatedAt:now(),
    syncedAt:state.syncedAt,
    counts:{
      total:vehicles.length,
      available:available.length,
      sold:vehicles.filter(v=>v.status==="sold").length,
      unavailable:vehicles.filter(v=>v.status==="unavailable").length,
      withImages:available.filter(v=>Boolean(v.directImage)).length,
      publicReady:available.filter(isPublicReady).length,
      sources:(state.sources||[]).length
    },
    issues:[...sourceIssues,...issues]
  };
}

export async function getVehicleImageResponse(request,env) {
  const urlObj = new URL(request.url);
  const id=decodeURIComponent(urlObj.pathname.split("/").pop()||"");
  const cache = caches.default;
  const cacheKey = new Request(urlObj.origin + "/_vehicle-photo-cache/" + encodeURIComponent(id), request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const state=await readState(env);
  const v=(state?.vehicles||[]).find(x=>x.id===id)||SEEDS.find(x=>x.id===id);
  if(!v) return new Response("Not found",{status:404});

  const candidates = [];
  if (v.directImage) candidates.push(v.directImage);

  if(v.sourceUrl){
    try{
      const r=await fetchHtml(v.sourceUrl);
      if(r.ok){
        const extracted=extractImage(r.html);
        if(extracted) candidates.push(extracted);
        const all=[...r.html.matchAll(/https?:\\/\\/[^"'<>\\s]+\\.(?:jpg|jpeg|png|webp)(?:\\?[^"'<>\\s]*)?/gi)]
          .map(m=>m[0].replace(/&amp;/g,"&"))
          .filter(u=>/(dealer|vehicle|inventory|media|cdn|image|photo)/i.test(u));
        candidates.push(...all.slice(0,8));
      }
    }catch{}
  }

  const unique=[...new Set(candidates)].slice(0,10);
  const attempts = [];
  for (const image of unique){
    attempts.push(
      {url:image,headers:{
        "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
        "accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "referer":v.sourceUrl||urlObj.origin+"/"
      }},
      {url:image,headers:{
        "user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
        "accept":"image/*,*/*;q=0.8"
      }}
    );
  }

  for (const attempt of attempts){
    try{
      const img=await fetch(attempt.url,{redirect:"follow",headers:attempt.headers});
      const type=(img.headers.get("content-type")||"").toLowerCase();
      const len=Number(img.headers.get("content-length")||0);
      if(img.ok && type.startsWith("image/") && (len===0 || len>5000)){
        const bytes=await img.arrayBuffer();
        if(bytes.byteLength<5000) continue;
        const headers=new Headers();
        headers.set("content-type",type);
        headers.set("cache-control","public, max-age=21600, s-maxage=21600");
        headers.set("access-control-allow-origin","*");
        headers.set("x-roviq-image-source","proxied");
        const response=new Response(bytes,{status:200,headers});
        try{await cache.put(cacheKey,response.clone());}catch{}
        return response;
      }
    }catch{}
  }

  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="100%" height="100%" fill="#dce6ee"/><text x="50%" y="48%" text-anchor="middle" font-family="Arial" font-size="72" font-weight="700" fill="#173c5d">ROVIQ</text><text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="28" fill="#527087">Vehicle photo updating</text></svg>';
  return new Response(svg,{headers:{"content-type":"image/svg+xml","cache-control":"no-store"}});
}

