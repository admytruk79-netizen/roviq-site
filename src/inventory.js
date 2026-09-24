import { getPricingConfig } from "./pricing.js";
import { syncVehicleCosting, publicCosting } from "./costing-db.js";
const INVENTORY_KEY = "vehicle_inventory:v1";
const LIVE_DATABASE_KEY = "vehicle_live_database:v1";
const MAX_MILES = 60000;
const LIVE_VERIFICATION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const INVENTORY_SCHEMA_VERSION = 24; // Refresh model-filtered dealer inventory

const SOURCE_PLUGINS = [
  {
    id: "carr",
    name: "CARR Chevrolet",
    inventoryUrls: [
      "https://www.carrchevrolet.com/showroom/2026/Chevrolet/Silverado%201500/Truck.htm",
      "https://www.carrchevrolet.com/showroom/2026/Chevrolet/Silverado%202500%20HD/Truck.htm",
      "https://www.carrchevrolet.com/showroom/2026/Chevrolet/Silverado%203500%20HD/Truck.htm",
      "https://www.carrchevrolet.com/used-inventory/index.htm",
      "https://www.carrchevrolet.com/certified-inventory/index.htm",
      "https://www.carrchevrolet.com/sitemap.htm"
    ],
    baseUrl: "https://www.carrchevrolet.com",
    detailPatterns: [
      /\/used\/Chevrolet\/.*Silverado/i,
      /\/new\/Chevrolet\/.*Silverado/i,
      /\/used\/GMC\/.*Sierra/i,
      /\/used\/Ford\/.*F-?150/i
    ]
  },
  {
    id: "ron-tonkin-chevrolet",
    name: "Ron Tonkin Chevrolet",
    inventoryUrls: [
      "https://www.tonkinchevrolet.com/llm/inventory/?limit=100",
      "https://www.tonkinchevrolet.com/llm/inventory/?limit=100&page=2"
    ],
    baseUrl: "https://www.tonkinchevrolet.com",
    detailPatterns: [
      /\/inventory\/(?:certified-)?used-.*silverado/i,
      /\/used-.*silverado/i
    ]
  },
  {
    id: "beaverton-gmc",
    name: "Buick GMC of Beaverton",
    inventoryUrls: [
      "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%201500",
      "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%201500&pt=2",
      "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%201500&pt=3",
      "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%202500%20HD",
      "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%202500%20HD&pt=2",
      "https://www.beavertongmc.com/searchnew.aspx?make=GMC&model=Sierra%203500%20HD",
      "https://www.beavertongmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.beavertongmc.com/searchused.aspx?make=GMC&model=Sierra%201500&pt=2",
      "https://www.beavertongmc.com/searchused.aspx?make=Chevrolet&model=Silverado%201500"
    ],
    baseUrl: "https://www.beavertongmc.com",
    detailPatterns: [
      /\/new-.*sierra/i,
      /\/used-.*(?:silverado|sierra)/i
    ]
  },
  {
    id: "damerow-ford",
    name: "Damerow Ford",
    inventoryUrls: [
      "https://www.damerowford.com/inventory/truck-month/models-Ford/",
      "https://www.damerowford.com/inventory/used-vehicles/used/models-Ford-F--150/srp-sort-price--desc/",
      "https://www.damerowford.com/inventory/used-vehicles/used/models-Ford-F--150/srp-sort-price--desc/?page=2",
      "https://www.damerowford.com/inventory/used-vehicles/used/models-Ford-F--150/srp-sort-price--desc/?page=3"
    ],
    baseUrl: "https://www.damerowford.com",
    detailPatterns: [
      /\/inventory\/(?:new|certified-used|used)-.*f-?150/i,
      /\/inventory\/.*f-?150/i
    ]
  },
  {
    id: "northside-ford",
    name: "Northside Ford",
    inventoryUrls: [
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--150/",
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--150/?page=2",
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--150/?page=3"
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
      "https://www.courtesyford.com/used-vehicles/",
      "https://www.courtesyford.com/used-vehicles/page/2/",
      "https://www.courtesyford.com/used-vehicles/page/3/"
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
      "https://www.autotowngmc.com/searchnew.aspx?make=GMC&model=Sierra%201500",
      "https://www.autotowngmc.com/searchnew.aspx?make=GMC&model=Sierra%201500&pt=2",
      "https://www.autotowngmc.com/searchnew.aspx?make=GMC&model=Sierra%202500%20HD",
      "https://www.autotowngmc.com/searchnew.aspx?make=GMC&model=Sierra%203500%20HD",
      "https://www.autotowngmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.autotowngmc.com/searchused.aspx?make=GMC&model=Sierra%201500&pt=2"
    ],
    baseUrl: "https://www.autotowngmc.com",
    detailPatterns: [
      /\/new-.*sierra/i,
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
  },
  {
    id: "doherty-ford",
    name: "Doherty Ford",
    inventoryUrls: ["https://www.doherty-ford.com/used-inventory/index.htm"],
    baseUrl: "https://www.doherty-ford.com"
  },
  {
    id: "bmw-of-salem",
    name: "BMW of Salem",
    inventoryUrls: ["https://www.bmwofsalem.com/used-inventory/used-ford-salem-or.htm"],
    baseUrl: "https://www.bmwofsalem.com"
  },
  {
    id: "dicks-canby-ford",
    name: "Dick's Canby Ford",
    inventoryUrls: [
      "https://www.dickscanbyford.com/searchnew.aspx?make=Ford&model=F-150",
      "https://www.dickscanbyford.com/searchnew.aspx?make=Ford&model=F-150&pt=2",
      "https://www.dickscanbyford.com/searchnew.aspx?make=Ford&model=F-150&pt=3",
      "https://www.dickscanbyford.com/searchnew.aspx?make=Ford&model=F-150&pt=4",
      "https://www.dickscanbyford.com/searchused.aspx?make=Ford&model=F-150",
      "https://www.dickscanbyford.com/searchused.aspx?make=Ford&model=F-150&pt=2"
    ],
    baseUrl: "https://www.dickscanbyford.com",
    detailPatterns: [
      /\/new-.*f-?150/i,
      /\/used-.*f-?150/i
    ]
  },
  {
    id: "northwest-chevrolet",
    name: "Northwest Chevrolet",
    inventoryUrls: [
      "https://www.northwestchevrolet.com/searchnew.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.northwestchevrolet.com/searchnew.aspx?make=Chevrolet&model=Silverado%201500&pt=2",
      "https://www.northwestchevrolet.com/searchnew.aspx?make=Chevrolet&model=Silverado%202500%20HD",
      "https://www.northwestchevrolet.com/searchnew.aspx?make=Chevrolet&model=Silverado%203500%20HD",
      "https://www.northwestchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.northwestchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=2"
    ],
    baseUrl: "https://www.northwestchevrolet.com",
    detailPatterns: [
      /\/new-.*silverado/i,
      /\/used-.*silverado/i
    ]
  },
  {
    id: "landmark-ford",
    name: "Landmark Ford",
    inventoryUrls: [
      "https://www.landmarkford.com/used-vehicles/?_dFR%5Bmodel%5D%5B0%5D=F-150",
      "https://www.landmarkford.com/used-vehicles/page/2/?_dFR%5Bmodel%5D%5B0%5D=F-150"
    ],
    baseUrl: "https://www.landmarkford.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*f-?150/i]
  },
  {
    id: "tonkin-hillsboro-ford",
    name: "Tonkin Hillsboro Ford",
    inventoryUrls: [
      "https://www.tonkinhillsboroford.com/used-vehicles/?_dFR%5Bmodel%5D%5B0%5D=F-150",
      "https://www.tonkinhillsboroford.com/used-vehicles/page/2/?_dFR%5Bmodel%5D%5B0%5D=F-150"
    ],
    baseUrl: "https://www.tonkinhillsboroford.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*f-?150/i]
  },
  {
    id: "weston-gmc",
    name: "Weston Buick GMC",
    inventoryUrls: [
      "https://www.westonbuickgmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.westonbuickgmc.com/searchused.aspx?make=GMC&model=Sierra%201500&pt=2"
    ],
    baseUrl: "https://www.westonbuickgmc.com",
    detailPatterns: [/\/used-.*sierra/i]
  },
  {
    id: "royal-moore-gmc",
    name: "Royal Moore Buick GMC",
    inventoryUrls: [
      "https://www.royalmooregmc.com/used-vehicles/?_dFR%5Bmodel%5D%5B0%5D=Sierra%201500",
      "https://www.royalmooregmc.com/used-vehicles/page/2/?_dFR%5Bmodel%5D%5B0%5D=Sierra%201500"
    ],
    baseUrl: "https://www.royalmooregmc.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*sierra/i]
  },
  {
    id: "mcloughlin-chevrolet",
    name: "McLoughlin Chevrolet",
    inventoryUrls: ["https://www.mcloughlinchevy.com/used-trucks-for-sale-near-portland-or.html"],
    baseUrl: "https://www.mcloughlinchevy.com"
  },
  {
    id: "westlie-ford",
    name: "Westlie Ford",
    inventoryUrls: [
      "https://www.westlieford.com/llm/inventory/?limit=100",
      "https://www.westlieford.com/llm/inventory/?limit=100&page=2"
    ],
    baseUrl: "https://www.westlieford.com"
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
    fuel: "Gasoline", exterior: "Summit White", interior: "Jet Black cloth", vin: "3GCPDCEK5NG636138", askingPrice: 33240
  },
  {
    id: "ROVIQ-US-BGMC-407865",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2026-Chevrolet-Silverado%2BEV-Trail%2BBoss%2B%2B%2BMax%2BRange-1GC405EL2TU407865",
    year: 2026, make: "Chevrolet", model: "Silverado EV", trim: "Trail Boss Max Range",
    mileageMi: 4119, engine: "Dual-motor electric", drivetrain: "AWD", transmission: "Single-speed",
    fuel: "Electric", exterior: "Riptide Blue Metallic", interior: "Black / Artemis", vin: "1GC405EL2TU407865", askingPrice: 72240
  },
  {
    id: "ROVIQ-US-BGMC-403489",
    sourceId: "beaverton-gmc",
    sourceUrl: "https://www.beavertongmc.com/used-%2BPortland-2026-Chevrolet-Silverado%2BEV-LT%2B%2B%2BMax%2BRange-1GC400EL9TU403489",
    year: 2026, make: "Chevrolet", model: "Silverado EV", trim: "LT Max Range",
    mileageMi: 4005, engine: "Dual-motor electric", drivetrain: "AWD", transmission: "Single-speed",
    fuel: "Electric", exterior: "Summit White", interior: "Black Evotex", vin: "1GC400EL9TU403489", askingPrice: 71740
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
  const safe = String(key).replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${safe}["'][^>]+content=["']([^"']+)["']`, "i");
  const b = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${safe}["']`, "i");
  return clean((html.match(a)||html.match(b)||[])[1]||"") || null;
}
function first(html, re) { const m = html.match(re); return m ? clean(m[1]||m[0]) : null; }
function safeField(value, fallback=null) {
  const v=clean(String(value||""));
  if(!v) return fallback;
  if(v.length>90) return fallback;
  if(/[<>{}=#]/.test(v)) return fallback;
  if(/\b(?:class|data-|style|href|src|icon-img|thumbnail|container|images--mod|javascript)\b/i.test(v)) return fallback;
  if(/^(?:none|null|undefined|color|engine|transmission|drivetrain|interior|exterior)[\"']?$/i.test(v)) return fallback;
  return v;
}
function attrValue(html, names) {
  for (const name of names) {
    const escaped = String(name).replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped + '\\s*=\\s*["\\\']([^"\\\']+)["\\\']', "i");
    const m = html.match(re);
    const v = safeField(m?.[1] || null);
    if (v) return v;
  }
  return null;
}
function numericAttr(html, names) {
  const v=attrValue(html,names);
  return v ? num(v) : null;
}
function fieldValue(v, fallback=null) {
  const s=clean(String(v??""));
  if(!s) return fallback;
  if(s.length>90) return fallback;
  if(/[<>={}]/.test(s)) return fallback;
  if(/\b(?:class|data-|style|container|thumbnail|icon|height|width|images--|div|span|href|src|aria-)\b/i.test(s)) return fallback;
  if(/^none["']?$/i.test(s) || /^(?:null|undefined)$/i.test(s)) return fallback;
  return s;
}
function extractAskingPrice(html, structuredPriceValue=null){
  if(structuredPriceValue){
    const n=num(structuredPriceValue);
    if(n && n>=1000 && n<=250000) return n;
  }
  const metaPrice=num(meta(html,"product:price:amount") || meta(html,"og:price:amount"));
  if(metaPrice && metaPrice>=1000 && metaPrice<=250000) return metaPrice;
  const patterns=[
    /itemprop=["']price["'][^>]*content=["']([0-9,.]+)["']/i,
    /["']price["']\s*:\s*["']?\$?([1-9][0-9,]{3,7})/i,
    /(?:sale price|internet price|dealer price|our price|price)[^$0-9]{0,80}\$\s*([1-9][0-9,]{3,7})/i
  ];
  for(const re of patterns){
    const n=num(first(html,re));
    if(n && n>=1000 && n<=250000) return n;
  }
  return null;
}

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
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "accept":"text/html,application/xhtml+xml"
    }
  });
  return { ok:r.ok, status:r.status, html:r.ok ? await r.text() : "" };
}

function looksLikeListing(url) {
  return /(silverado|sierra|f-?150)/i.test(url) && /(used|preowned|pre-owned|vehicle|inventory)/i.test(url);
}

function discoverLlmInventory(html, source) {
  const out=new Map();
  for(const match of html.matchAll(/<li\b[^>]*class=["'][^"']*vehicle-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)){
    const item=match[1];
    const titleTag=(item.match(/<a\b(?=[^>]*class=["'][^"']*vehicle-title)[^>]*>/i)||[])[0]||"";
    const url=abs((titleTag.match(/href=["']([^"']+)/i)||[])[1],source.baseUrl);
    if(!url || !/\/inventory\/(?:used|certified-used)-/i.test(url) || !looksLikeListing(url)) continue;
    const name=clean((item.match(/itemprop=["']name["'][^>]*>([^<]+)/i)||[])[1]||"");
    const year=Number((name.match(/\b20\d{2}\b/)||[])[0])||null;
    const make=(name.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||null;
    const model=(name.match(/\b(Silverado(?:\s+\d{4}\s*HD|\s+\d{4}HD|\s+EV)?|Sierra(?:\s+\d{4}\s*HD|\s+\d{4}HD)?|F-?150)\b/i)||[])[1]||null;
    const mileage=num((item.match(/itemprop=["']value["'][^>]*>([^<]+)/i)||[])[1]);
    const price=num((item.match(/itemprop=["']price["'][^>]*content=["']([0-9,.]+)/i)||[])[1]);
    const vin=(item.match(/itemprop=["']vehicleIdentificationNumber["'][^>]*content=["']([A-HJ-NPR-Z0-9]{17})/i)||[])[1]||null;
    if(!year || !make || !model || mileage==null) continue;
    out.set(url,{url,hints:{year,make,model,mileageMi:mileage,
      ...(price>=1000&&price<=250000?{askingPrice:price}:{}),...(vin?{vin}:{}),
      sourceId:source.id,sourceNameInternal:source.name,status:"available",firstSeenAt:now()}});
    if(out.size>=180) break;
  }
  return [...out.values()];
}

function discover(html, source) {
  if((source.inventoryUrls||[]).some(u=>/\/llm\/inventory\//.test(u))) return discoverLlmInventory(html,source);
  const out = new Map();
  // Several dealer search pages publish vehicle records in JSON-LD rather
  // than ordinary anchors. Read those records before scanning links.
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const root=JSON.parse(match[1].trim());
      const queue=Array.isArray(root)?[...root]:[root];
      while(queue.length){
        const node=queue.shift();
        if(!node || typeof node!=="object") continue;
        if(Array.isArray(node["@graph"])) queue.push(...node["@graph"]);
        if(node.about && typeof node.about==="object") queue.push(...(Array.isArray(node.about)?node.about:[node.about]));
        if(Array.isArray(node.itemListElement)) queue.push(...node.itemListElement);
        if(Array.isArray(node.offers?.itemOffered)) queue.push(...node.offers.itemOffered);
        else if(node.offers?.itemOffered && typeof node.offers.itemOffered==="object") queue.push(node.offers.itemOffered);
        if(node.item && typeof node.item==="object") queue.push(node.item);
        const rawUrl=node.url||node.offers?.url;
        const url=rawUrl && abs(rawUrl,source.baseUrl);
        const name=String(node.name||"");
        if(!url || !/(silverado|sierra|f-?150)/i.test(name+" "+url) || !looksLikeListing(url)) continue;
        const year=Number((name.match(/\b20\d{2}\b/)||[])[0])||null;
        const make=(name.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||null;
        const model=(name.match(/\b(Silverado(?:\s+(?:1500|2500\s*HD|3500\s*HD|EV))?|Sierra(?:\s+(?:1500|2500\s*HD|3500\s*HD|EV))?|F-?150(?:\s+Lightning)?)\b/i)||[])[1]||null;
        const image=Array.isArray(node.image)?node.image[0]:node.image;
        const rawPrice=node.offers?.price||node.offers?.lowPrice;
        const price=num(rawPrice);
        const mileage=num(node.mileageFromOdometer?.value??node.mileageFromOdometer);
        const vin=node.vehicleIdentificationNumber||node.identifier;
        const engine=safeField(typeof node.vehicleEngine==="string"?node.vehicleEngine:node.vehicleEngine?.name||node.vehicleEngine?.engineDisplacement?.value);
        const drivetrain=safeField(node.driveWheelConfiguration);
        const prior=out.get(url)||{};
        out.set(url,{...prior,...(year?{year}:{}),...(make?{make}:{}),...(model?{model}:{}),
          ...(typeof image==="string"?{directImage:image}:{}),
          ...(price>=1000&&price<=250000?{askingPrice:price}:{}),
          ...(mileage!=null?{mileageMi:mileage}:{}),
          ...(engine?{engine}:{}),
          ...(drivetrain?{drivetrain}:{}),
          ...(typeof vin==="string"&&/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)?{vin}:{}),
          status:"available",sourceId:source.id,sourceNameInternal:source.name,
          firstSeenAt:prior.firstSeenAt||now()});
      }
    } catch {}
  }
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const u = abs(m[1], source.baseUrl);
    if (!u) continue;
    const url=u.split("#")[0];
    const customMatch=(source.detailPatterns||[]).some(p=>p.test(url));
    if (!(customMatch || looksLikeListing(url))) continue;

    // Dealer search-result pages often expose price/photo even when the VDP hides them
    // behind client-side rendering or anti-bot middleware. Capture those hints here so
    // the public card can still be complete after the detail-page verification succeeds.
    const start=Math.max(0,m.index-4500), end=Math.min(html.length,m.index+9000);
    const context=html.slice(start,end);
    const contextText=clean(context);
    const hintImage=extractImage(context);
    const hintPrice=extractAskingPrice(context) ||
      numericAttr(context,["data-price","data-sale-price","data-vehicle-price","data-internet-price","data-msrp","data-final-price"]);
    const hintVin=((contextText.match(/\b([A-HJ-NPR-Z0-9]{17})\b/)||[])[1]||null);
    const hintYear=Number((contextText.match(/\b(20\d{2})\b/)||[])[1]||0)||null;
    const hintMake=((contextText.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||"");
    const hintModel=((contextText.match(/\b(Silverado(?:\s+1500(?:\s+LTD)?|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|Sierra(?:\s+1500|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|F-?150(?:\s+Lightning)?)\b/i)||[])[1]||"");
    const parsedHintMileage=num((contextText.match(/\b([0-9][0-9,]{2,6})\s*(?:mi|miles?)\b/i)||[])[1]);
    const newVehicleUrl=/(?:\/new[-\/]|\/inventory\/new-)/i.test(url);
    const hintMileage=parsedHintMileage!=null ? parsedHintMileage : (newVehicleUrl ? 0 : null);
    const hintDrivetrain=safeField((contextText.match(/\b(4WD|4x4|4×4|AWD|RWD|2WD)\b/i)||[])[1]||null);
    const hintEngine=safeField(
      (contextText.match(/\b((?:2\.7L|3\.0L|5\.0L|5\.3L|6\.2L|6\.6L)[^|,;<]{0,45}(?:TurboMax|Duramax|EcoTec3|V8|V-8|diesel|turbo|engine)?)\b/i)||[])[1]||null
    );
    const existing=out.get(url)||{};
    out.set(url,{
      ...existing,
      ...(hintImage?{directImage:hintImage}:{}),
      ...(hintPrice?{askingPrice:hintPrice}:{}),
      ...(hintVin?{vin:hintVin}:{}),
      ...(hintYear?{year:hintYear}:{}),
      ...(hintMake?{make:hintMake.replace(/^./,x=>x.toUpperCase())}:{}),
      ...(hintModel?{model:hintModel.replace(/\s+/g," ").replace(/^F150$/i,"F-150")}:{}),
      ...(hintMileage!=null?{mileageMi:hintMileage}:{}),
      ...(hintDrivetrain?{drivetrain:hintDrivetrain}:{}),
      ...(hintEngine?{engine:hintEngine}:{}),
      status:"available",
      lastVerifiedAt:now(),
      firstSeenAt:existing.firstSeenAt||now(),
      sourceNameInternal:source.name,
      sourceId:source.id
    });
    if (out.size >= 180) break;
  }
  return [...out.entries()].map(([url,hints])=>({url,hints}));
}

function parseJsonLdVehicle(html) {
  const scripts=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for(const match of scripts){
    try{
      const parsed=JSON.parse(match[1].trim());
      const queue=Array.isArray(parsed)?[...parsed]:[parsed];
      while(queue.length){
        const node=queue.shift();
        if(!node || typeof node!=="object") continue;
        if(Array.isArray(node["@graph"])) queue.push(...node["@graph"]);
        const type=Array.isArray(node["@type"])?node["@type"].join(" "):String(node["@type"]||"");
        if(!/(Vehicle|Car|Product)/i.test(type)) continue;
        const mileageRaw=node.mileageFromOdometer?.value ?? node.mileageFromOdometer ?? null;
        const imageRaw=Array.isArray(node.image)?node.image[0]:node.image;
        const offers=Array.isArray(node.offers)?node.offers[0]:node.offers;
        const offerPrice=offers?.price ?? offers?.lowPrice ?? offers?.priceSpecification?.price ?? null;
        return {
          name:safeField(node.name||null),
          description:clean(String(node.description||"")).slice(0,1000),
          sku:safeField(node.sku||null),
          vin:safeField(node.vehicleIdentificationNumber||node.vin||null),
          mileageMi:num(mileageRaw),
          image:typeof imageRaw==="string"?imageRaw:(imageRaw?.url||null),
          color:safeField(node.color||null),
          fuel:safeField(node.fuelType||null),
          transmission:safeField(node.vehicleTransmission||null),
          drivetrain:safeField(node.driveWheelConfiguration||null),
          engine:safeField(node.vehicleEngine?.name||node.vehicleEngine?.engineDisplacement||null),
          price:num(offerPrice)
        };
      }
    }catch{}
  }
  return {};
}

export function parseDetail(html, source, url, previous={}) {
  const text=clean(html.slice(0,600000));
  const title=meta(html,"og:title")||first(html,/<title[^>]*>([\s\S]*?)<\/title>/i)||"";
  const structured=parseJsonLdVehicle(html);
  const combined=title+" "+(structured.name||"")+" "+(structured.description||"")+" "+text;

  const year=Number((combined.match(/\b(20\d{2})\b/)||[])[1]||previous.year||0)||null;
  const make=((combined.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||previous.make||"").replace(/^./,x=>x.toUpperCase());
  const model=((combined.match(/\b(Silverado(?:\s+1500(?:\s+LTD)?|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|Sierra(?:\s+1500|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|F-?150(?:\s+Lightning)?)\b/i)||[])[1]||previous.model||"").replace(/\s+/g," ").replace(/^F150$/i,"F-150");
  const dealerMileage=first(html,/<span[^>]*class=["'][^"']*info__label[^"']*["'][^>]*>\s*Mileage\s*<\/span>\s*<span[^>]*class=["'][^"']*info__value[^"']*["'][^>]*>\s*([0-9,]+)\s*<\/span>/i);
  const mileage=structured.mileageMi ?? num(dealerMileage||first(html,/(?:Odometer|Mileage)\s*[:\-]?\s*([0-9][0-9,.]{0,10}\s*(?:mi|miles?))/i)||(combined.match(/\b([0-9][0-9,]{2,6})\s*(?:mi|miles?)\b/i)||[])[1]) ?? previous.mileageMi;
  const vin=structured.vin||((combined.match(/\b([A-HJ-NPR-Z0-9]{17})\b/)||[])[1]||previous.vin||null);
  const image=structured.image||extractImage(html)||previous.directImage||null;

  const rawEngine=structured.engine||attrValue(html,["data-engine","data-engine-description","data-engine-type"])||first(html,/(?:Engine|Engine Type)\s*[:\-]?\s*([^<\n]{2,90})/i);
  const rawDrivetrain=structured.drivetrain||attrValue(html,["data-drivetrain","data-drive-type","data-drive"])||first(html,/(?:Drivetrain|Drive Type)\s*[:\-]?\s*([^<\n]{2,50})/i)||first(structured.description||"",/\b(4WD|4x4|4×4|AWD|RWD|2WD|FWD)\b/i);
  const rawTransmission=structured.transmission||attrValue(html,["data-transmission"])||first(html,/Transmission\s*[:\-]?\s*([^<\n]{2,70})/i);
  const rawExterior=structured.color||attrValue(html,["data-extcolor","data-exterior-color","data-exterior"])||first(html,/Exterior(?: Color)?\s*[:\-]?\s*([^<\n]{2,70})/i);
  const rawInterior=attrValue(html,["data-intcolor","data-interior-color","data-interior"])||first(html,/Interior(?: Color)?\s*[:\-]?\s*([^<\n]{2,70})/i);

  const engine=safeField(rawEngine,safeField(previous.engine));
  const drivetrain=safeField(rawDrivetrain)||
    safeField(first(structured.description||"",/\b(4WD|4x4|4×4|AWD|RWD|2WD|FWD)\b/i))||
    safeField(previous.drivetrain);
  const transmission=safeField(rawTransmission,safeField(previous.transmission,"Automatic"));
  const exterior=safeField(rawExterior,safeField(previous.exterior,"See photo"));
  const interior=safeField(rawInterior,safeField(previous.interior,"See details"));
  const fuel=safeField(structured.fuel)||(/\b(EV|electric|dual[- ]motor)\b/i.test(combined)?"Electric":(/duramax|diesel/i.test(combined+" "+(engine||""))?"Diesel":safeField(previous.fuel,"Gasoline")));

  const parsedPrice =
    extractAskingPrice(html, structured.price) ||
    numericAttr(html,["data-price","data-sale-price","data-vehicle-price","data-internet-price","data-msrp","data-final-price"]);
  const previousPrice=Number(previous.askingPrice||0);
  const askingPrice=parsedPrice || (previousPrice>=1000 && previousPrice<=250000 ? previousPrice : null);
  const soldSignal=/\b(sold|no longer available|vehicle unavailable|removed from inventory)\b/i.test(combined);

  return {...previous,sourceId:source.id,sourceNameInternal:source.name,sourceUrl:url,year,make,model,mileageMi:mileage,vin,directImage:image,engine,drivetrain,transmission,exterior,interior,fuel,askingPrice,soldSignal};
}

function isRenderableVehicle(v) {
  return Boolean(
    v &&
    v.status==="available" &&
    v.mileageMi!=null &&
    v.mileageMi<MAX_MILES &&
    v.year &&
    v.make &&
    v.model &&
    safeField(v.engine) &&
    safeField(v.drivetrain)
  );
}

function hasValidPrice(v){
  const n=Number(v?.askingPrice||0);
  return Number.isFinite(n) && n>=1000 && n<=250000;
}
function isPublicReady(v) {
  const discoveredAt=Date.parse(v?.lastDiscoveredAt||"");
  const freshDiscovery=Number.isFinite(discoveredAt) && (Date.now()-discoveredAt)<=LIVE_VERIFICATION_MAX_AGE_MS;
  return Boolean(
    v &&
    v.status==="available" &&
    freshDiscovery &&
    v.mileageMi!=null &&
    v.mileageMi<MAX_MILES &&
    v.year &&
    v.make &&
    v.model
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

async function readLiveDatabase(env) {
  const raw = env.CONTENT ? await env.CONTENT.get(LIVE_DATABASE_KEY) : null;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function saveLiveDatabase(env, database) {
  if (env.CONTENT) await env.CONTENT.put(LIVE_DATABASE_KEY,JSON.stringify(database));
}

export async function syncVehicleInventory(env) {
  const old = await readState(env);
  const oldVehicles = old?.vehicles || [];
  const byUrl = Object.fromEntries(oldVehicles.map(v=>[v.sourceUrl,v]));
  // Only URLs discovered from dealer inventory pages in this sync enter the live database.
  // Previous rows are used only to enrich rediscovered vehicles; seeds never count as live inventory.
  const candidates = new Map();

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
      detailFailures: 0,
      rejectedMissingCore: 0,
      rejectedMileage: 0,
      rejectedMakeModel: 0
    };
    for (const inventoryUrl of (source.inventoryUrls || [])) {
      try {
        const r=await fetchHtml(inventoryUrl);
        if (!r.ok) { health.inventoryPagesFailed++; continue; }
        health.inventoryPagesOk++;
        health.lastSuccessAt = now();
        const found = discover(r.html,source);
        health.discovered += found.length;
        for (const item of found) {
          const url=item.url;
          const prior=byUrl[url]||{};
          const hinted={...prior,...item.hints};
          if(!candidates.has(url)) candidates.set(url,{sourceId:source.id,previous:hinted});
          else {
            const existing=candidates.get(url);
            candidates.set(url,{...existing,sourceId:existing.sourceId||source.id,previous:{...(existing.previous||{}),...item.hints}});
          }
        }
      } catch { health.inventoryPagesFailed++; }
    }
  }

  // Balance the 180-vehicle catalogue across every healthy source instead of
  // allowing the first/highest-volume dealer to consume the entire cap.
  const allCandidateEntries=[...candidates.entries()]
    .sort((a,b) => Number(Boolean(b[1].previous?.id)) - Number(Boolean(a[1].previous?.id)));
  const sourceBuckets=new Map();
  for(const entry of allCandidateEntries){
    const sourceId=entry[1]?.sourceId||"unknown";
    if(!sourceBuckets.has(sourceId)) sourceBuckets.set(sourceId,[]);
    sourceBuckets.get(sourceId).push(entry);
  }
  const candidateEntries=[];
  const buckets=[...sourceBuckets.values()];
  let round=0;
  while(candidateEntries.length<180 && buckets.some(bucket=>round<bucket.length)){
    for(const bucket of buckets){
      if(candidateEntries.length>=180) break;
      if(round<bucket.length) candidateEntries.push(bucket[round]);
    }
    round++;
  }

  // Persist the dealer discovery set BEFORE detail-page enrichment. A Worker run
  // must never lose the whole live database just because later VDP enrichment hits
  // a dealer timeout or Cloudflare subrequest ceiling.
  const discoveredRows=candidateEntries.map(([url,metaInfo])=>{
    const source=SOURCE_PLUGINS.find(s=>s.id===metaInfo.sourceId)||SOURCE_PLUGINS.find(s=>url.startsWith(s.baseUrl));
    const prior=metaInfo.previous||{};
    const row={
      ...prior,
      sourceId:source?.id||prior.sourceId||null,
      sourceNameInternal:source?.name||prior.sourceNameInternal||null,
      sourceUrl:url,
      status:prior.status||"available",
      firstSeenAt:prior.firstSeenAt||now(),
      lastDiscoveredAt:now()
    };
    row.id=stableId(row);
    return row;
  });

  // Persist discovery immediately as the live dealer-linked database.
  // This happens before slow detail-page enrichment, so a partial/slow enrichment
  // run cannot collapse the live database back to a handful of cards.
  const discoveryDatabase={
    version:INVENTORY_SCHEMA_VERSION,
    syncedAt:now(),
    candidateCap:180,
    databaseRows:discoveredRows.length,
    vehicles:discoveredRows.slice(0,180)
  };
  await saveLiveDatabase(env,discoveryDatabase);

  const provisionalSources = SOURCE_PLUGINS.map(({id,name}) => {
    const h=sourceHealth[id]||{};
    return {
      ...h,
      id,
      name,
      availableVehicles:discoveredRows.filter(v=>v.sourceId===id && v.status==="available").length,
      publicReadyVehicles:discoveredRows.filter(v=>v.sourceId===id && isPublicReady(v)).length,
      incompleteVehicles:discoveredRows.filter(v=>v.sourceId===id && !isPublicReady(v)).length,
      filteredVehicles:0,
      totalVehicles:discoveredRows.filter(v=>v.sourceId===id).length
    };
  });
  await saveLiveDatabase(env,{
    version:INVENTORY_SCHEMA_VERSION,
    syncedAt:now(),
    candidateCap:180,
    databaseRows:discoveredRows.length,
    sources:provisionalSources,
    vehicles:discoveredRows.slice(0,180)
  });

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
        v.status=prev.status||"available";
        v.lastCheckFailedAt=now();
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
      v.status=prev.status||"available";
      v.lastCheckFailedAt=now();
    }

    v.id=stableId(v);
    v.engine=safeField(v.engine);
    v.drivetrain=safeField(v.drivetrain);
    v.transmission=safeField(v.transmission);
    v.exterior=safeField(v.exterior);
    v.interior=safeField(v.interior);
    if(!v.year||!v.make||!v.model||v.mileageMi==null||!v.engine||!v.drivetrain) {
      if (sourceHealth[source.id]) sourceHealth[source.id].rejectedMissingCore++;
      v.status = "incomplete";
      v.incompleteReason = "missing_core";
      return v;
    }
    if(v.mileageMi>=MAX_MILES) {
      if (sourceHealth[source.id]) sourceHealth[source.id].rejectedMileage++;
      v.status = "filtered";
      v.incompleteReason = "mileage";
      return v;
    }
    if(!/^(Chevrolet|GMC|Ford)$/i.test(v.make) || !/(Silverado|Sierra|F-?150)/i.test(v.model)) {
      if (sourceHealth[source.id]) sourceHealth[source.id].rejectedMakeModel++;
      v.status = "filtered";
      v.incompleteReason = "make_model";
      return v;
    }
    return v;
  }

  // Keep each sync under Cloudflare's external-subrequest ceiling.
  // Discovery already consumes ~30 dealer requests, so enrich a rotating batch
  // of 12 VDPs per run. Every run republishes the full discovery database first.
  const detailBatchSize=12;
  const previousCursor=Number(old?.detailCursor||0);
  const start=candidateEntries.length ? (previousCursor % candidateEntries.length) : 0;
  const detailEntries=candidateEntries.length
    ? Array.from({length:Math.min(detailBatchSize,candidateEntries.length)},(_,n)=>candidateEntries[(start+n)%candidateEntries.length])
    : [];
  const vehicles=[];
  const concurrency=6;
  for(let i=0;i<detailEntries.length;i+=concurrency){
    const batch=detailEntries.slice(i,i+concurrency);
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
      (x.directImage?25:0) +
      (hasValidPrice(x)?25:0) +
      (x.engine?5:0) +
      (x.lastVerifiedAt?Math.min(10,Math.max(0,10-(Date.now()-Date.parse(x.lastVerifiedAt))/86400000)):0);
    if(score(v)>score(existing)) deduped.set(key,v);
  }
  const uniqueVehicles=[...deduped.values()];

  const cutoff = Date.now() - 30*24*60*60*1000;
  const retainedVehicles = uniqueVehicles.filter(v => {
    const retired = v.soldAt || v.unavailableAt;
    if (retired && Date.parse(retired) < cutoff) return false;
    return true;
  });

  const sources = SOURCE_PLUGINS.map(({id,name}) => {
    const h = sourceHealth[id] || { id, name, attemptedAt: now(), inventoryPagesOk:0, inventoryPagesFailed:0, discovered:0, detailChecks:0, detailFailures:0 };
    const matching = retainedVehicles.filter(v => v.sourceId === id);
    return {
      ...h,
      availableVehicles: matching.filter(v=>v.status==="available").length,
      publicReadyVehicles: matching.filter(isPublicReady).length,
      incompleteVehicles: matching.filter(v=>v.status==="incomplete").length,
      filteredVehicles: matching.filter(v=>v.status==="filtered").length,
      totalVehicles: matching.length
    };
  });
  const usableNew=retainedVehicles.filter(isRenderableVehicle);
  const usableOld=(old?.vehicles||[]).filter(isRenderableVehicle);

  // Fail-safe: never replace a working inventory with an empty/bad refresh.
  if(usableNew.length===0 && usableOld.length>0){
    const preserved={
      ...old,
      version:INVENTORY_SCHEMA_VERSION,
      maxMileage:MAX_MILES,
      syncedAt:old.syncedAt||now(),
      lastFailedSyncAt:now(),
      sources
    };
    await saveState(env,preserved);
    return preserved;
  }

  const mergedByUrl=new Map(discoveredRows.map(v=>[v.sourceUrl,v]));
  for(const v of retainedVehicles){
    const discovered=mergedByUrl.get(v.sourceUrl);
    if(!discovered){
      mergedByUrl.set(v.sourceUrl,v);
      continue;
    }

    // SRP discovery is authoritative for "currently in dealer inventory".
    // A VDP/detail parser may fail to enrich engine/drivetrain without meaning
    // the vehicle disappeared. Do not let an "incomplete" enrichment result
    // overwrite a live, customer-usable dealer discovery row.
    const explicitRemoval = v.status==="sold" || v.status==="unavailable" || v.status==="filtered";
    const discoveredCustomerReady = Boolean(
      discovered.year &&
      discovered.make &&
      discovered.model &&
      discovered.mileageMi!=null &&
      discovered.mileageMi<MAX_MILES &&
      discovered.directImage &&
      hasValidPrice(discovered)
    );

    if(v.status==="incomplete" && discoveredCustomerReady){
      mergedByUrl.set(v.sourceUrl,{
        ...discovered,
        ...v,
        status:"available",
        incompleteReason:null,
        enrichmentPending:true,
        lastDiscoveredAt:discovered.lastDiscoveredAt||now(),
        lastVerifiedAt:v.lastVerifiedAt||discovered.lastVerifiedAt||now()
      });
    } else {
      mergedByUrl.set(v.sourceUrl,{
        ...discovered,
        ...v,
        status:explicitRemoval ? v.status : (v.status||discovered.status||"available")
      });
    }
  }
  const liveDatabaseRows=[...mergedByUrl.values()]
    .filter(v=>v.status!=="sold" && v.status!=="unavailable")
    .slice(0,180);

  const finalVehicles=liveDatabaseRows;
  const state={
    version:INVENTORY_SCHEMA_VERSION,
    maxMileage:MAX_MILES,
    syncedAt:now(),
    candidateCap:180,
    databaseRows:finalVehicles.length,
    detailCursor:candidateEntries.length ? ((start+detailEntries.length)%candidateEntries.length) : 0,
    sources,
    vehicles:finalVehicles
  };
  await saveState(env,state);
  await saveLiveDatabase(env,{
    version:INVENTORY_SCHEMA_VERSION,
    syncedAt:state.syncedAt,
    candidateCap:180,
    databaseRows:finalVehicles.length,
    sources,
    vehicles:finalVehicles
  });
  return state;
}

export async function getVehicleInventory(env) {
  // Customer requests read the persisted dealer-linked live database only.
  // Dealer scraping is performed by the hourly cron/admin sync, never inline here.
  const [state,liveDatabase]=await Promise.all([readState(env),readLiveDatabase(env)]);
  const stateVehicles=Array.isArray(state?.vehicles)?state.vehicles:[];
  const liveVehicles=Array.isArray(liveDatabase?.vehicles)?liveDatabase.vehicles:[];

  // Prefer the larger live discovery database, while merging enriched snapshot
  // fields by source URL so price/photo/spec data is retained.
  const enrichedByUrl=new Map(stateVehicles.map(v=>[v.sourceUrl,v]));
  const sourceRows=(liveVehicles.length>=stateVehicles.length ? liveVehicles : stateVehicles);
  let databaseRows=sourceRows.map(v=>({
    ...(enrichedByUrl.get(v.sourceUrl)||{}),
    ...v,
    id:v.id||stableId(v),
    status:v.status||"available"
  }));

  const pricingConfig=await getPricingConfig(env);
  const costingRows=await syncVehicleCosting(env,databaseRows,pricingConfig);
  const costingById=new Map(costingRows.map(r=>[r.vehicleId,r]));

  const publicVehicles=databaseRows
    .filter(isPublicReady)
    .sort((a,b)=>(a.mileageMi??999999)-(b.mileageMi??999999))
    .slice(0,180);

  const vehicles=publicVehicles.map(v=>({
    id:v.id,
    year:v.year,
    make:v.make,
    model:v.model,
    trim:v.trim||"",
    mileageMi:Number.isFinite(Number(v.mileageMi))?Number(v.mileageMi):0,
    engine:v.engine||"Specification updating",
    drivetrain:v.drivetrain||"Specification updating",
    transmission:v.transmission||"Automatic",
    fuel:v.fuel||"Gasoline",
    exterior:v.exterior||"See dealer listing",
    interior:v.interior||"See dealer listing",
    vinPublic:v.vin?"••••••"+v.vin.slice(-6):"ROVIQ",
    imagePath:"/ukraine/image/"+encodeURIComponent(v.id),
    lastVerifiedAt:v.lastVerifiedAt||v.lastDiscoveredAt||null,
    pricing:publicCosting(costingById.get(v.id))
  }));

  return {
    version:liveDatabase?.version||state?.version||null,
    syncedAt:liveDatabase?.syncedAt||state?.syncedAt||null,
    maxMileage:MAX_MILES,
    databaseRows:databaseRows.length,
    candidateCap:180,
    vehicles
  };
}

export function searchVehicleInventory(inventory, params) {
  const q=String(params.get("q")||"").trim().toLowerCase().slice(0,80);
  const make=String(params.get("make")||"").trim().toLowerCase();
  const fuel=String(params.get("fuel")||"").trim().toLowerCase();
  const maxMileage=Number(params.get("maxMileage"));
  const vehicles=(inventory.vehicles||[]).filter(v=>{
    if(q && ![v.year,v.make,v.model,v.trim,v.engine,v.fuel,v.id].join(" ").toLowerCase().includes(q)) return false;
    if(make && String(v.make).toLowerCase()!==make) return false;
    if(fuel && String(v.fuel).toLowerCase()!==fuel) return false;
    if(params.has("maxMileage") && Number.isFinite(maxMileage) && maxMileage>=0 && v.mileageMi>maxMileage) return false;
    return true;
  });
  return {...inventory,vehicles,totalVehicles:(inventory.vehicles||[]).length};
}

export async function getPublicInventoryHealth(env) {
  let state=await readState(env);
  const age=state?.syncedAt ? Date.now()-Date.parse(state.syncedAt) : Infinity;
  const hasRenderableStoredInventory=Boolean((state?.vehicles||[]).some(isRenderableVehicle));
  if(!state || state.version!==INVENTORY_SCHEMA_VERSION || !Number.isFinite(age) || age > 30*60*1000 || !hasRenderableStoredInventory) {
    state=await syncVehicleInventory(env);
  }
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
      withImages: vehicles.filter(v=>v.status==="available" && Boolean(v.directImage)).length,
      withPrices: vehicles.filter(v=>v.status==="available" && hasValidPrice(v)).length,
      customerReady: vehicles.filter(isPublicReady).length
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
      publicReadyVehicles:Number(s.publicReadyVehicles||0),
      incompleteVehicles:Number(s.incompleteVehicles||0),
      filteredVehicles:Number(s.filteredVehicles||0),
      rejectedMissingCore:Number(s.rejectedMissingCore||0),
      rejectedMileage:Number(s.rejectedMileage||0),
      rejectedMakeModel:Number(s.rejectedMakeModel||0),
      lastSuccessAt:s.lastSuccessAt||null
    }))
  };
}

export async function getInventoryAdmin(env) {
  let state=await readState(env);
  const age=state?.syncedAt ? Date.now()-Date.parse(state.syncedAt) : Infinity;
  if(!state || state.version!==INVENTORY_SCHEMA_VERSION || !Number.isFinite(age) || age>15*60*1000 || Number(state.databaseRows||0)<20){
    state=await syncVehicleInventory(env);
  }
  return state;
}

export async function checkVehicleAvailability(env, vehicleId) {
  let state=await readState(env);
  if(!state || state.version!==INVENTORY_SCHEMA_VERSION) state=await syncVehicleInventory(env);

  const v=(state.vehicles||[]).find(x=>x.id===vehicleId);
  if(!v) return {available:false,reason:"not_found"};

  const source=SOURCE_PLUGINS.find(s=>s.id===v.sourceId);
  if(!source || !v.sourceUrl) return {available:false,reason:"source_unavailable"};

  try{
    const r=await fetchHtml(v.sourceUrl);
    if(!r.ok){
      v.missCount=(v.missCount||0)+1;
      if(v.missCount>=2) v.status="unavailable";
      await saveState(env,state);
      return {available:false,reason:"dealer_page_unreachable",httpStatus:r.status};
    }

    const fresh=parseDetail(r.html,source,v.sourceUrl,v);
    const sameVin=!v.vin || !fresh.vin || fresh.vin===v.vin;
    const cleanVehicle=Boolean(
      fresh.year &&
      fresh.make &&
      fresh.model &&
      fresh.mileageMi!=null &&
      fresh.mileageMi<MAX_MILES &&
      safeField(fresh.engine) &&
      safeField(fresh.drivetrain)
    );

    if(fresh.soldSignal || !sameVin || !cleanVehicle){
      v.status=fresh.soldSignal?"sold":"unavailable";
      v.lastAvailabilityCheckAt=now();
      v.availabilityReason=fresh.soldSignal?"sold_signal":(!sameVin?"vin_mismatch":"incomplete_live_data");
      await saveState(env,state);
      return {available:false,reason:v.availabilityReason};
    }

    Object.assign(v,fresh,{
      status:"available",
      missCount:0,
      lastVerifiedAt:now(),
      lastAvailabilityCheckAt:now(),
      availabilityReason:"dealer_verified"
    });
    await saveState(env,state);

    return {
      available:true,
      reason:"dealer_verified",
      vehicleId:v.id,
      vin:v.vin||null,
      sourceId:v.sourceId,
      sourceNameInternal:v.sourceNameInternal||source.name,
      sourceUrl:v.sourceUrl,
      askingPrice:Number(v.askingPrice)||null,
      lastVerifiedAt:v.lastVerifiedAt,
      reservationMode:source.reservationMode||"manual"
    };
  }catch{
    return {available:false,reason:"verification_error"};
  }
}

export async function requestDealerReservation(env, vehicleId, customer={}) {
  const check=await checkVehicleAvailability(env,vehicleId);
  if(!check.available) return {...check,reservationStatus:"unavailable"};

  const source=SOURCE_PLUGINS.find(s=>s.id===check.sourceId);
  const mode=source?.reservationMode||"manual";

  // Scraping proves current listing availability but does not grant ROVIQ authority
  // to place a dealer hold. Until a dealer-specific API is configured, create an
  // internal case and require explicit dealer confirmation.
  if(mode!=="api"){
    return {
      ...check,
      reservationStatus:"dealer_confirmation_pending",
      reservationMode:"manual",
      requiresDealerConfirmation:true
    };
  }

  return {
    ...check,
    reservationStatus:"dealer_confirmation_pending",
    reservationMode:"api_not_configured",
    requiresDealerConfirmation:true
  };
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
      withPrices:available.filter(hasValidPrice).length,
      customerReady:available.filter(isPublicReady).length,
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
        const all=[...r.html.matchAll(/https?:\/\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\s]*)?/gi)]
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
