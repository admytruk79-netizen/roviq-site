import { getPricingConfig } from "./pricing.js";
import { syncVehicleCosting, publicCosting } from "./costing-db.js";
const INVENTORY_KEY = "vehicle_inventory:v1";
const LIVE_DATABASE_KEY = "vehicle_live_database:v1";
const MAX_MILES = 30000;
const LIVE_VERIFICATION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const INVENTORY_SCHEMA_VERSION = 33; // Ukraine feed: used/pre-owned inventory only

export const SOURCE_PLUGINS = [
  {
    id: "carr", name: "CARR Chevrolet", usedOnly: true,
    inventoryUrls: [
      "https://www.carrchevrolet.com/used-inventory/index.htm",
      "https://www.carrchevrolet.com/certified-inventory/index.htm",
      "https://www.carrchevrolet.com/used-trucks.htm",
      "https://www.carrchevrolet.com/used-trucks.htm?start=16"
    ],
    baseUrl: "https://www.carrchevrolet.com",
    detailPatterns: [/\/used\/Chevrolet\/.*Silverado/i,/\/used\/GMC\/.*Sierra/i,/\/used\/Ford\/.*F-?(?:150|250)/i]
  },
  {
    id: "ron-tonkin-chevrolet", name: "Ron Tonkin Chevrolet", usedOnly: true,
    inventoryUrls: [
      "https://www.tonkinchevrolet.com/llm/inventory/?type=used&limit=100",
      "https://www.tonkinchevrolet.com/llm/inventory/?type=used&limit=100&page=2"
    ],
    baseUrl: "https://www.tonkinchevrolet.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*silverado/i,/\/used-.*silverado/i]
  },
  {
    id: "carr-vancouver-gmc", name: "CARR Vancouver Buick GMC", usedOnly: true,
    inventoryUrls: [
      "https://www.carrbuickgmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.carrbuickgmc.com/searchused.aspx",
      "https://www.carrbuickgmc.com/searchused.aspx?pt=2",
      "https://www.carrbuickgmc.com/searchused.aspx?pt=3"
    ],
    baseUrl: "https://www.carrbuickgmc.com",
    detailPatterns: [/\/used-.*sierra/i]
  },
  {
    id: "beaverton-gmc", name: "Buick GMC of Beaverton", usedOnly: true,
    inventoryUrls: [
      "https://www.beavertongmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.beavertongmc.com/searchused.aspx?make=GMC&model=Sierra%201500&pt=2",
      "https://www.beavertongmc.com/searchused.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.beavertongmc.com/searchused.aspx?make=Chevrolet&model=Silverado%20EV",
      "https://www.beavertongmc.com/searchused.aspx",
      "https://www.beavertongmc.com/searchused.aspx?pt=2",
      "https://www.beavertongmc.com/searchused.aspx?pt=3",
      "https://www.beavertongmc.com/searchused.aspx?pt=4"
    ],
    baseUrl: "https://www.beavertongmc.com",
    detailPatterns: [/\/used-.*(?:silverado|sierra)/i]
  },
  {
    id: "damerow-ford", name: "Damerow Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.damerowford.com/inventory/used-vehicles/used/models-Ford-F--150/srp-sort-price--desc/",
      "https://www.damerowford.com/inventory/used-vehicles/used/models-Ford-F--150/srp-sort-price--desc/?page=2",
      "https://www.damerowford.com/inventory/used-vehicles/used/models-Ford-F--250/srp-sort-price--desc/"
    ],
    baseUrl: "https://www.damerowford.com",
    detailPatterns: [/\/inventory\/(?:certified-used|used)-.*f-?(?:150|250)/i]
  },
  {
    id: "northside-ford", name: "Northside Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--150/",
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--150/?page=2",
      "https://www.northsideford.net/inventory/used-vehicles/models-Ford-F--250/"
    ],
    baseUrl: "https://www.northsideford.net",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*f-?(?:150|250)/i,/\/vehicle\/.*f-?(?:150|250)/i]
  },
  {
    id: "courtesy-ford", name: "Courtesy Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.courtesyford.com/used-vehicles/",
      "https://www.courtesyford.com/used-vehicles/page/2/",
      "https://www.courtesyford.com/used-vehicles/page/3/"
    ],
    baseUrl: "https://www.courtesyford.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*f-?(?:150|250)/i]
  },
  {
    id: "auto-town-gmc", name: "Auto Town GMC", usedOnly: true,
    inventoryUrls: [
      "https://www.autotowngmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.autotowngmc.com/searchused.aspx?make=GMC&model=Sierra%201500&pt=2",
      "https://www.autotowngmc.com/searchused.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.autotowngmc.com/searchused.aspx",
      "https://www.autotowngmc.com/searchused.aspx?pt=2",
      "https://www.autotowngmc.com/searchused.aspx?pt=3"
    ],
    baseUrl: "https://www.autotowngmc.com",
    detailPatterns: [/\/used-.*(?:silverado|sierra)/i]
  },
  {
    id: "aa-motor-pdx", name: "A&A Motor PDX", usedOnly: true,
    inventoryUrls: ["https://www.motorpdx.com/ford/f-150-for-sale","https://www.motorpdx.com/ford-for-sale"],
    baseUrl: "https://www.motorpdx.com"
  },
  {
    id: "doherty-ford", name: "Doherty Ford", usedOnly: true,
    inventoryUrls: ["https://www.doherty-ford.com/used-inventory/index.htm"],
    baseUrl: "https://www.doherty-ford.com"
  },
  {
    id: "bmw-of-salem", name: "BMW of Salem", usedOnly: true,
    inventoryUrls: ["https://www.bmwofsalem.com/used-inventory/used-ford-salem-or.htm"],
    baseUrl: "https://www.bmwofsalem.com"
  },
  {
    id: "kendall-eugene-fleet", name: "Kendall Ford of Eugene", usedOnly: true,
    inventoryUrls: ["https://oregon-fleet-sales.kendallford.com/Pickup?filters=Chassis.Condition%3AUsed&filters=Chassis.Make%3AFord"],
    baseUrl: "https://oregon-fleet-sales.kendallford.com", fleetInventory: true
  },
  {
    id: "kendall-ford-vancouver", name: "Kendall Ford of Vancouver", usedOnly: true,
    // Kendall's pages block servers, but the dealer's own inventory search
    // service (Cars Commerce) answers with exact per-VIN records. Reading it
    // avoids guessing specs from search-page text, which mixed up vehicles.
    searchService: {pageUrl: "https://www.kendallfordvancouver.com/used-vehicles/", typeSlugs: ["Used", "Certified Used"]},
    baseUrl: "https://www.kendallfordvancouver.com",
    detailPatterns: [/\/inventory\/(?:used|certified-used)-.*f-?(?:150|250)/i]
  },
  {
    id: "gresham-ford", name: "Gresham Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.greshamford.com/llm/inventory/?type=used",
      "https://www.greshamford.com/llm/inventory/?_p=2&type=used",
      "https://www.greshamford.com/llm/inventory/?_p=3&type=used"
    ],
    baseUrl: "https://www.greshamford.com",
    detailPatterns: [/\/inventory\/(?:used|certified-used)-.*f-?(?:150|250)/i]
  },
  {
    id: "dicks-canby-ford", name: "Dick's Canby Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.dickscanbyford.com/searchused.aspx?make=Ford&model=F-150",
      "https://www.dickscanbyford.com/searchused.aspx?make=Ford&model=F-150&pt=2",
      "https://www.dickscanbyford.com/searchused.aspx?make=Ford&model=F-250",
      "https://www.dickscanbyford.com/searchused.aspx?make=Ford&model=F-150%20Lightning",
      "https://www.dickscanbyford.com/searchused.aspx"
    ],
    baseUrl: "https://www.dickscanbyford.com",
    detailPatterns: [/\/used-.*f-?(?:150|250)/i]
  },
  {
    id: "power-chevrolet", name: "Power Chevrolet", usedOnly: true,
    inventoryUrls: [
      "https://www.powerchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.powerchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=2",
      "https://www.powerchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=3",
      "https://www.powerchevrolet.com/searchused.aspx"
    ],
    baseUrl: "https://www.powerchevrolet.com",
    detailPatterns: [/\/used-.*silverado/i]
  },
  {
    id: "northwest-chevrolet", name: "Northwest Chevrolet", usedOnly: true,
    inventoryUrls: [
      "https://www.northwestchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.northwestchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=2",
      "https://www.northwestchevrolet.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=3",
      "https://www.northwestchevrolet.com/searchused.aspx"
    ],
    baseUrl: "https://www.northwestchevrolet.com",
    detailPatterns: [/\/used-.*silverado/i]
  },
  {
    id: "landmark-ford", name: "Landmark Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.landmarkford.com/used-vehicles/?_dFR%5Bmodel%5D%5B0%5D=F-150",
      "https://www.landmarkford.com/used-vehicles/page/2/?_dFR%5Bmodel%5D%5B0%5D=F-150"
    ],
    baseUrl: "https://www.landmarkford.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*f-?150/i]
  },
  {
    id: "tonkin-hillsboro-ford", name: "Tonkin Hillsboro Ford", usedOnly: true,
    inventoryUrls: [
      "https://www.tonkinhillsboroford.com/used-vehicles/?_dFR%5Bmodel%5D%5B0%5D=F-150",
      "https://www.tonkinhillsboroford.com/used-vehicles/page/2/?_dFR%5Bmodel%5D%5B0%5D=F-150"
    ],
    baseUrl: "https://www.tonkinhillsboroford.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*f-?150/i]
  },
  {
    id: "weston-gmc", name: "Weston Buick GMC", usedOnly: true,
    inventoryUrls: [
      "https://www.westonbuickgmc.com/searchused.aspx?make=GMC&model=Sierra%201500",
      "https://www.westonbuickgmc.com/searchused.aspx?make=GMC&model=Sierra%201500&pt=2"
    ],
    baseUrl: "https://www.westonbuickgmc.com",
    detailPatterns: [/\/used-.*sierra/i]
  },
  {
    id: "royal-moore-gmc", name: "Royal Moore Buick GMC", usedOnly: true,
    inventoryUrls: [
      "https://www.royalmooregmc.com/used-vehicles/?_dFR%5Bmodel%5D%5B0%5D=Sierra%201500",
      "https://www.royalmooregmc.com/used-vehicles/page/2/?_dFR%5Bmodel%5D%5B0%5D=Sierra%201500"
    ],
    baseUrl: "https://www.royalmooregmc.com",
    detailPatterns: [/\/inventory\/(?:certified-)?used-.*sierra/i]
  },
  {
    id: "mcloughlin-chevrolet", name: "McLoughlin Chevrolet", usedOnly: true,
    inventoryUrls: [
      "https://www.mcloughlinchevy.com/searchused.aspx?make=Chevrolet&model=Silverado%201500",
      "https://www.mcloughlinchevy.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=2",
      "https://www.mcloughlinchevy.com/searchused.aspx?make=Chevrolet&model=Silverado%201500&pt=3",
      "https://www.mcloughlinchevy.com/searchused.aspx"
    ],
    baseUrl: "https://www.mcloughlinchevy.com",
    detailPatterns: [/\/used-.*silverado/i]
  }
]

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
  const machineReadable=/\/llm\/inventory\//i.test(url);
  const headers=machineReadable ? {
    "user-agent":"ROVIQ-Inventory/1.0 (+vehicle inventory aggregation)",
    "accept":"text/html,text/plain,application/json;q=0.9,*/*;q=0.8",
    "cache-control":"no-cache"
  } : {
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "accept":"text/html,application/xhtml+xml"
  };
  const r = await fetch(url, {
    redirect:"follow",
    signal:AbortSignal.timeout(15000),
    headers
  });
  return { ok:r.ok, status:r.status, html:r.ok ? await r.text() : "" };
}

function looksLikeListing(url) {
  return /(silverado|sierra|f-?150|f-?250|lightning)/i.test(url) && /(used|preowned|pre-owned|vehicle|inventory)/i.test(url);
}
function looksLikeUsedListing(url) {
  return /(?:\/used(?:[-\/]|%2b)|\/certified-used-|\/certified\/|\/preowned|\/pre-owned)/i.test(String(url||""));
}

function canonicalModel(value) {
  const s=String(value||"").replace(/[-_]/g," ").replace(/\s+/g," ").trim();
  if (/\b(?:F\s*150\s*Lightning|Lightning)\b/i.test(s)) return "F-150 Lightning";
  if (/\bF\s*250\b/i.test(s)) return "F-250";
  if (/\bF\s*150\b/i.test(s)) return "F-150";
  if (/\bSilverado\s*EV\b/i.test(s)) return "Silverado EV";
  if (/\bSierra\s*EV\b/i.test(s)) return "Sierra EV";
  for(const make of ["Silverado","Sierra"]){
    const match=s.match(new RegExp(`\\b${make}\\s*(1500|2500|3500)\\s*(HD)?\\b`,"i"));
    if(match) return make+" "+match[1]+(match[2]?" HD":"");
  }
  return String(value||"").replace(/\s+/g," ").trim();
}

function verifiedFuel(v) {
  const model=canonicalModel(v.model);
  if (["F-150 Lightning","Silverado EV","Sierra EV"].includes(model)) return "Electric";
  // Dealer search pages contain ads for other vehicles; an electric keyword on
  // the page is not evidence that this particular listing is electric.
  const fuel=String(v.fuel||"");
  if (/electric|\bEV\b/i.test(fuel)) return /diesel/i.test(v.engine||"")?"Diesel":"Gasoline";
  return fuel||"Gasoline";
}

export function discoverFleetInventory(html, source, inventoryUrl) {
  const out=new Map();
  const vinMatches=[...html.matchAll(/\b([A-HJ-NPR-Z0-9]{17})\b/gi)];
  for(let i=0;i<vinMatches.length;i++){
    const m=vinMatches[i];
    const vin=m[1].toUpperCase();
    // Scope parsing to this VIN's own listing segment. The previous implementation
    // used a broad +/-5k window, which could pick up the price from a neighboring
    // truck and attach it to the wrong VIN.
    const prev=vinMatches[i-1], next=vinMatches[i+1];
    const start=prev ? Math.max(prev.index+prev[0].length,m.index-3000) : Math.max(0,m.index-3000);
    const end=next ? next.index : Math.min(html.length,m.index+7000);
    const raw=html.slice(start,end);
    const postVinRaw=html.slice(m.index,end);
    const text=clean(raw);
    const postVinText=clean(postVinRaw);
    if(!/\bFord\s+F-?(?:150|250)\b/i.test(text)) continue;
    const model=canonicalModel((text.match(/\bFord\s+(F-?(?:150|250)(?:\s+Lightning)?)\b/i)||[])[1]);
    const year=Number((text.match(/\b(20\d{2})\s+Ford\s+F-?(?:150|250)\b/i)||[])[1]||0)||null;
    if(!year) continue;
    const trim=safeField((text.match(/Vehicle Trim\s+([A-Za-z0-9 -]{1,35})/i)||[])[1]||null);
    const drivetrain=safeField((text.match(/Drivetrain\s+(4WD|AWD|RWD|2WD|FWD)/i)||[])[1]||null);
    const transmission=safeField((text.match(/Transmission\s+([^$|]{2,35}?)(?:\s+Color|\s+Vehicle Trim|\s+See More Details|$)/i)||[])[1]||null);
    const fuel=safeField((text.match(/Fuel Type\s+(Gasoline|Diesel|Hybrid|Electric|Flex Fuel)/i)||[])[1]||null);
    const color=safeField((text.match(/Color\s+([^$|]{2,35}?)(?:\s+Vehicle Trim|\s+See More Details|$)/i)||[])[1]||null);
    const usedMileage=num((postVinText.match(/Mileage\s+([0-9,]+)\b/i)||[])[1]);
    const mileageMi=usedMileage;
    if(mileageMi==null || mileageMi>=MAX_MILES) continue;
    const price=num((postVinText.match(/(?:Price\*?|Sale Price|Total Price)\s*\|?\s*\$\s*([0-9,]+)/i)||[])[1]) ||
      num((postVinText.match(/MSRP\s*\|?\s*\$\s*([0-9,]+)/i)||[])[1]);
    const directImage=extractImage(raw);
    const url=inventoryUrl+"#"+vin;
    out.set(url,{url,hints:{
      year,make:"Ford",model,trim:trim||"",
      mileageMi,vin,condition:"used",
      ...(drivetrain?{drivetrain}:{}),
      ...(transmission?{transmission}:{}),
      ...(fuel?{fuel}:{}),
      ...(color?{exterior:color}:{}),
      ...(price>=1000&&price<=250000?{askingPrice:price}:{}),
      ...(directImage?{directImage}:{}),
      status:"available",sourceId:source.id,sourceNameInternal:source.name,firstSeenAt:now()
    }});
    if(out.size>=180) break;
  }
  return [...out.values()];
}

function discoverLlmInventory(html, source) {
  const out=new Map();
  for(const match of html.matchAll(/<li\b[^>]*class=["'][^"']*vehicle-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)){
    const item=match[1];
    const titleTag=(item.match(/<a\b(?=[^>]*class=["'][^"']*vehicle-title)[^>]*>/i)||[])[0]||"";
    const url=abs((titleTag.match(/href=["']([^"']+)/i)||[])[1],source.baseUrl);
    const name=clean((item.match(/itemprop=["']name["'][^>]*>([^<]+)/i)||[])[1]||"");
    if(!url || !/\/inventory\/(?:new|used|certified-used)-/i.test(url) || !/(silverado|sierra|f-?150|f-?250|lightning)/i.test(url+" "+name)) continue;
    if(source.usedOnly && !/\/inventory\/(?:used|certified-used)-/i.test(url)) continue;
    const year=Number((name.match(/\b20\d{2}\b/)||[])[0])||null;
    const make=(name.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||null;
    const model=canonicalModel((name.match(/\b(Silverado(?:\s+\d{4}\s*HD|\s+\d{4}HD|\s+EV)?|Sierra(?:\s+\d{4}\s*HD|\s+\d{4}HD|\s+EV)?|F-?(?:150|250)(?:\s+Lightning)?)\b/i)||[])[1]);
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

const SEARCH_PAGE_USER_AGENT="Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";

export function readSearchServiceConfig(html) {
  const m=String(html||"").match(/var SEARCH_SERVICE\s*=\s*(\{[\s\S]*?\});\s*(?:var|\/\*)/);
  if(!m) return null;
  try {
    const cfg=JSON.parse(m[1]);
    if(!cfg.search || !cfg.apiKey) return null;
    // Without the site's field map the index returns only a thin record (no cab style, no specs).
    const fm=String(html).match(/var SEARCH_SERVICE_FIELD_MAP\s*=\s*(\{[\s\S]*?\});\s*(?:var|\/\*)/);
    let requestedFields;
    try { requestedFields=fm?JSON.parse(fm[1]).requestedFields:undefined; } catch { requestedFields=undefined; }
    return {search:cfg.search,apiKey:cfg.apiKey,statuses:cfg.visibleStatusValues||["publish"],requestedFields};
  } catch { return null; }
}

// One exact dealer record per VIN: used, crew cab / SuperCrew, target models, under the mileage cap.
export function searchServiceListingToHints(listing, source) {
  const make=String(listing?.make||"");
  const model=canonicalModel(listing?.model);
  if(!/^(Chevrolet|GMC|Ford)$/i.test(make) || !/^(?:Silverado|Sierra|F-150|F-250)/i.test(model)) return null;
  if(/3500|4500|5500/.test(String(listing?.model||"")+" "+model)) return null;
  if(!/used/i.test(String(listing?.type||""))) return null;
  const style=String(listing?.styles?.style_name||listing?.styles?.style_description||"");
  const url=String(listing?.vdp_url||"");
  // Cab comes from the dealer's style name; the VDP slug (e.g. "-4wd-supercrew-") is the fallback.
  if(!/super\s*-?crew|crew\s*-?cab/i.test(style ? style+" "+String(listing?.trim||"") : url)) return null;
  const mileageMi=Number(listing?.mileage);
  if(!Number.isFinite(mileageMi) || mileageMi<=0 || mileageMi>=MAX_MILES) return null;
  if(!listing?.vin || !looksLikeUsedListing(url)) return null;
  const pricing=listing?.pricing||{};
  const askingPrice=[pricing.our_price,pricing.internet_price,pricing.price].map(Number).find(n=>n>=1000&&n<=250000);
  const mech=listing?.mechanical||{};
  const image=(listing?.media?.images||[]).find(u=>typeof u==="string");
  return {url,hints:{
    year:Number(listing.year)||null,make,model,trim:safeField(listing.trim||"",""),
    mileageMi,vin:String(listing.vin).toUpperCase(),condition:"used",
    ...(mech.engine?{engine:safeField(mech.engine)}:{}),
    ...(mech.drivetrain?{drivetrain:safeField(mech.drivetrain)}:{}),
    ...(mech.transmission?{transmission:safeField(mech.transmission)}:{}),
    ...(mech.fuel_type?{fuel:/diesel/i.test(mech.fuel_type)?"Diesel":/electric/i.test(mech.fuel_type)?"Electric":"Gasoline"}:{}),
    ...(listing.styles?.exterior_color?{exterior:safeField(listing.styles.exterior_color)}:{}),
    ...(listing.styles?.interior_color?{interior:safeField(listing.styles.interior_color)}:{}),
    ...(askingPrice?{askingPrice}:{}),
    ...(image?{directImage:image}:{}),
    status:"available",sourceId:source.id,sourceNameInternal:source.name,firstSeenAt:now()
  }};
}

export async function querySearchService(source, filters, fetcher, maxPages) {
  const page=await fetcher(source.searchService.pageUrl,{headers:{"user-agent":SEARCH_PAGE_USER_AGENT},signal:AbortSignal.timeout(20000)});
  if(!page.ok) return null;
  const cfg=readSearchServiceConfig(await page.text());
  if(!cfg) return null;
  const all=[];
  for(let n=1;n<=maxPages;n++){
    const r=await fetcher(cfg.search+"/search",{method:"POST",signal:AbortSignal.timeout(20000),
      headers:{"content-type":"application/json",accept:"application/json","x-api-key":cfg.apiKey},
      body:JSON.stringify({page:n,perPage:100,filters:{status:cfg.statuses,...filters},...(cfg.requestedFields?{requestedFields:cfg.requestedFields}:{})})});
    if(!r.ok) return null;
    const body=await r.json();
    const listings=body?.data?.listings||body?.listings||[];
    all.push(...listings);
    if(listings.length<100) break;
  }
  return all;
}

export async function discoverSearchService(source, fetcher=fetch) {
  const listings=await querySearchService(source,{type_slug:source.searchService.typeSlugs},fetcher,10);
  if(!listings) return {ok:false};
  const found=[];
  for(const l of listings){const item=searchServiceListingToHints(l,source);if(item) found.push(item);}
  return {ok:true,found};
}

// Live re-check of one VIN against the dealer's own search index (the VDP itself is bot-blocked).
export async function checkSearchServiceVin(source, vin, fetcher=fetch) {
  const listings=await querySearchService(source,{vin:[vin]},fetcher,1);
  if(!listings) return {ok:false};
  const listing=listings.find(l=>String(l?.vin||"").toUpperCase()===String(vin).toUpperCase());
  return {ok:true,item:listing?searchServiceListingToHints(listing,source):null};
}

function discover(html, source, inventoryUrl) {
  if(source.fleetInventory) return discoverFleetInventory(html,source,inventoryUrl);
  if((source.inventoryUrls||[]).some(u=>/\/llm\/inventory\//.test(u))){
    const structured=discoverLlmInventory(html,source);
    if(structured.length) return structured;
    // Dealer.com LLM output varies by theme. If the structured parser finds
    // nothing, continue through the generic anchor/context parser below.
  }
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
        if(!url || !/(silverado|sierra|f-?150|f-?250|lightning)/i.test(name+" "+url) || !looksLikeListing(url)) continue;
        if(source.usedOnly && !looksLikeUsedListing(url)) continue;
        const year=Number((name.match(/\b20\d{2}\b/)||[])[0])||null;
        const make=(name.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||null;
        const model=canonicalModel((name.match(/\b(Silverado(?:\s+(?:1500|2500\s*HD|3500\s*HD|EV))?|Sierra(?:\s+(?:1500|2500\s*HD|3500\s*HD|EV))?|F-?(?:150|250)(?:\s+Lightning)?)\b/i)||[])[1]);
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
    if(source.usedOnly && !customMatch && !looksLikeUsedListing(url)) continue;

    // Dealer search-result pages often expose price/photo even when the VDP hides them
    // behind client-side rendering or anti-bot middleware. Capture those hints here so
    // the public card can still be complete after the detail-page verification succeeds.
    const start=Math.max(0,m.index-4500), end=Math.min(html.length,m.index+9000);
    const context=html.slice(start,end);
    const contextText=clean(context);
    const hintImage=extractImage(context);
    const hintPrice=extractAskingPrice(context) ||
      numericAttr(context,["data-price","data-sale-price","data-vehicle-price","data-internet-price","data-msrp","data-final-price"]);
    const decodedUrl=decodeURIComponent(url).replace(/\+/g," ");
    const hintVin=((contextText.match(/\b([A-HJ-NPR-Z0-9]{17})\b/)||[])[1]||
      (decodedUrl.match(/\b([A-HJ-NPR-Z0-9]{17})\b/i)||[])[1]||null);
    const hintYear=Number((contextText.match(/\b(20\d{2})\b/)||[])[1]||
      (decodedUrl.match(/\b(20\d{2})\b/)||[])[1]||0)||null;
    const hintMake=((contextText.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||
      (decodedUrl.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||"");
    const hintModel=((decodedUrl.match(/\b(Silverado(?:[\s-]+1500(?:[\s-]+LTD)?|[\s-]+2500[\s-]*HD|[\s-]+3500[\s-]*HD|[\s-]+EV)?|Sierra(?:[\s-]+1500|[\s-]+2500[\s-]*HD|[\s-]+3500[\s-]*HD|[\s-]+EV)?|F-?(?:150|250)(?:[\s-]+Lightning)?)\b/i)||[])[1]||
      (contextText.match(/\b(Silverado(?:\s+1500(?:\s+LTD)?|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|Sierra(?:\s+1500|\s+2500\s*HD|\s+3500\s*HD|\s+EV)?|F-?(?:150|250)(?:\s+Lightning)?)\b/i)||[])[1]||"");
    const parsedHintMileage=num((contextText.match(/\b([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{1,6})\s*(?:mi|miles?)\b/i)||[])[1]);
    const hintMileage=parsedHintMileage;
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
      ...(hintModel?{model:canonicalModel(hintModel)}:{}),
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
  const identity=decodeURIComponent(url).replace(/\+/g," ")+" "+title+" "+(structured.name||"");

  const year=Number((combined.match(/\b(20\d{2})\b/)||[])[1]||previous.year||0)||null;
  const make=((combined.match(/\b(Chevrolet|GMC|Ford)\b/i)||[])[1]||previous.make||"").replace(/^./,x=>x.toUpperCase());
  const model=canonicalModel((identity.match(/\b(Silverado(?:[\s-]+1500(?:[\s-]+LTD)?|[\s-]+2500[\s-]*HD|[\s-]+3500[\s-]*HD|[\s-]+EV)?|Sierra(?:[\s-]+1500|[\s-]+2500[\s-]*HD|[\s-]+3500[\s-]*HD|[\s-]+EV)?|F-?(?:150|250)(?:[\s-]+Lightning)?)\b/i)||[])[1]||previous.model||"");
  const dealerMileage=first(html,/<span[^>]*class=["'][^"']*info__label[^"']*["'][^>]*>\s*Mileage\s*<\/span>\s*<span[^>]*class=["'][^"']*info__value[^"']*["'][^>]*>\s*([0-9,]+)\s*<\/span>/i);
  const mileage=structured.mileageMi ?? num(dealerMileage||first(html,/(?:Odometer|Mileage)\s*[:\-]?\s*([0-9][0-9,.]{0,10}\s*(?:mi|miles?))/i)||(combined.match(/\b([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{1,6})\s*(?:mi|miles?)\b/i)||[])[1]) ?? previous.mileageMi;
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
  const fuel=verifiedFuel({model,engine,fuel:safeField(structured.fuel)||(/duramax|diesel/i.test(engine||"")?"Diesel":safeField(previous.fuel,"Gasoline"))});

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

export function normalizePriorInventory(state){
  return (state?.vehicles || []).map(v=>
    Number(state?.version)<32 && v.mileageMi===0 ? {...v,mileageMi:null} : v
  );
}

export function retainRecentUnseenVehicles(discoveredRows, oldVehicles, sourceHealth){
  const rows=new Map(discoveredRows.map(v=>[v.sourceUrl,v]));
  for(const prior of oldVehicles){
    if(!prior?.sourceUrl || rows.has(prior.sourceUrl) || prior.status!=="available") continue;
    const health=sourceHealth[prior.sourceId];
    // A successful, complete crawl is evidence that an unseen listing left the
    // dealer inventory. A failed page is not. Keep only recently discovered rows.
    if(!health || health.inventoryPagesFailed<1) continue;
    const age=Date.now()-Date.parse(prior.lastDiscoveredAt||"");
    if(!Number.isFinite(age) || age<0 || age>LIVE_VERIFICATION_MAX_AGE_MS) continue;
    rows.set(prior.sourceUrl,prior);
  }
  return [...rows.values()].slice(0,180);
}

export async function syncVehicleInventory(env) {
  const old = await readState(env);
  // Version 31 inferred zero miles for new listings with no dealer mileage.
  // Discard those unverified values before any old-row enrichment is reused.
  const oldVehicles = normalizePriorInventory(old);
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
    const inventoryFetches=source.searchService
      ? [{url:source.searchService.pageUrl,load:()=>discoverSearchService(source)}]
      : (source.inventoryUrls||[]).map(url=>({url,load:async()=>{const r=await fetchHtml(url);return r.ok?{ok:true,found:discover(r.html,source,url)}:{ok:false}}}));
    for (const {load} of inventoryFetches) {
      try {
        const r=await load();
        if (!r.ok) { health.inventoryPagesFailed++; continue; }
        health.inventoryPagesOk++;
        health.lastSuccessAt = now();
        const found = r.found;
        health.discovered += found.length;
        for (const item of found) {
          const url=item.url;
          const prior=byUrl[url]||{};
          const hinted={...prior,...item.hints};
          if(item.hints?.mileageMi==null && prior.mileageMi===0) hinted.mileageMi=null;
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
  for(const bucket of sourceBuckets.values()) bucket.sort((a,b)=>
    Number(/^(?:Silverado EV|Sierra EV|F-150 Lightning)$/i.test(canonicalModel(b[1]?.previous?.model))) -
    Number(/^(?:Silverado EV|Sierra EV|F-150 Lightning)$/i.test(canonicalModel(a[1]?.previous?.model)))
  );
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
  const freshRows=candidateEntries.map(([url,metaInfo])=>{
    const source=SOURCE_PLUGINS.find(s=>s.id===metaInfo.sourceId)||SOURCE_PLUGINS.find(s=>url.startsWith(s.baseUrl));
    const prior=metaInfo.previous||{};
    const row={
      ...prior,
      sourceId:source?.id||prior.sourceId||null,
      sourceNameInternal:source?.name||prior.sourceNameInternal||null,
      sourceUrl:url,
      // A vehicle rediscovered on a current dealer used-inventory page is live again.
      status:"available",
      firstSeenAt:prior.firstSeenAt||now(),
      lastDiscoveredAt:now()
    };
    row.id=stableId(row);
    return row;
  });
  const discoveredRows=retainRecentUnseenVehicles(freshRows,oldVehicles,sourceHealth);

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
    let v={...prev,sourceId:source.id,sourceNameInternal:source.name,sourceUrl:url,lastDiscoveredAt:now()};

    if (source.searchService) {
      // The search-service record is the dealer's own current data for this VIN;
      // its detail page blocks servers, so there is nothing further to verify.
      v={...v,status:"available",missCount:0,lastVerifiedAt:now(),firstSeenAt:prev.firstSeenAt||now(),unavailableAt:null,soldAt:null};
    } else try {
      if (sourceHealth[source.id]) sourceHealth[source.id].detailChecks++;
      const r=await fetchHtml(url);
      if (!r.ok) {
        if (sourceHealth[source.id]) sourceHealth[source.id].detailFailures++;
        v.missCount=(prev.missCount||0)+1;
        v.status=prev.status||"available";
        v.lastCheckFailedAt=now();
      } else {
        // Fleet rows use an inventory-page fragment as their URL. Parsing the
        // whole page as a VDP mixes the specs of unrelated trucks.
        v=source.fleetInventory ? {...v,fuel:verifiedFuel(v),soldSignal:!v.vin||!r.html.includes(v.vin)} : parseDetail(r.html,source,url,prev);
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
    const missingCore=!v.year||!v.make||!v.model||v.mileageMi==null||
      (!source.fleetInventory && (!v.engine||!v.drivetrain));
    if(missingCore) {
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
    if(!/^(Chevrolet|GMC|Ford)$/i.test(v.make) || !/(Silverado|Sierra|F-?(?:150|250))/i.test(v.model)) {
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
  const detailBatchSize=Math.min(36,Math.max(1,Number(env.inventoryDetailBatchSize)||12));
  const previousCursor=Number(old?.detailCursor||0);
  const start=candidateEntries.length ? (previousCursor % candidateEntries.length) : 0;
  // EV search pages can list VINs without mileage or price. Enrich a few of
  // those individual VDPs first so verified electric trucks reach the catalog.
  const priorityEntries=candidateEntries.filter(([,meta])=>
    /^(?:Silverado EV|Sierra EV|F-150 Lightning)$/i.test(canonicalModel(meta.previous?.model)) &&
    meta.previous?.mileageMi==null
  ).slice(0,4);
  const rotatingEntries=candidateEntries.length
    ? Array.from({length:candidateEntries.length},(_,n)=>candidateEntries[(start+n)%candidateEntries.length])
    : [];
  // Search-index sources (Kendall Ford Vancouver) already carry the dealer's exact
  // record and need no VDP fetch, so they never wait in the 12-per-run rotation.
  const searchIndexEntries=candidateEntries.filter(entry=>
    SOURCE_PLUGINS.find(s=>s.id===entry[1]?.sourceId)?.searchService && !priorityEntries.includes(entry)
  );
  const detailEntries=[...priorityEntries,...searchIndexEntries];
  let rotated=0;
  for(const entry of rotatingEntries){
    if(rotated>=detailBatchSize) break;
    rotated++;
    if(!detailEntries.includes(entry)) detailEntries.push(entry);
  }
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
  const usableOld=oldVehicles.filter(isRenderableVehicle);

  // Fail-safe: never replace a working inventory with an empty/bad refresh.
  if(usableNew.length===0 && usableOld.length>0){
    const preserved={
      ...old,
      version:INVENTORY_SCHEMA_VERSION,
      vehicles:oldVehicles,
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
    detailCursor:candidateEntries.length ? ((start+rotated)%candidateEntries.length) : 0,
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

  const isVerifiedUsedListing=v=>{
    const source=SOURCE_PLUGINS.find(s=>s.id===v.sourceId);
    const url=String(v.sourceUrl||"").toLowerCase();
    const condition=String(v.condition||v.vehicleCondition||"").toLowerCase();
    return condition==="used" || condition==="pre-owned" || condition==="certified used" || condition==="certified pre-owned" || looksLikeUsedListing(url) || /(?:\/used-vehicles|\/used-inventory|searchused\.aspx|[?&]type=used\b|chassis\.condition%3aused)/i.test(url);
  };

  const publicVehicles=databaseRows
    .filter(v=>isPublicReady(v) && isVerifiedUsedListing(v))
    .sort((a,b)=>(a.mileageMi??999999)-(b.mileageMi??999999))
    .slice(0,180);

  const vehicles=publicVehicles.map(v=>({
    id:v.id,
    year:v.year,
    make:v.make,
    model:canonicalModel(v.model),
    trim:v.trim||"",
    mileageMi:v.mileageMi==null?null:Number(v.mileageMi),
    engine:v.engine||"Specification updating",
    drivetrain:v.drivetrain||"Specification updating",
    transmission:v.transmission||"Automatic",
    fuel:verifiedFuel(v),
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
  const normalizedQ=q.replace(/[-\s]/g,"");
  const model=String(params.get("model")||"").trim();
  const make=String(params.get("make")||"").trim().toLowerCase();
  const fuel=String(params.get("fuel")||"").trim().toLowerCase();
  const maxMileage=Number(params.get("maxMileage"));
  const sort=String(params.get("sort")||"year_desc");
  const vehicles=(inventory.vehicles||[]).filter(v=>{
    const searchable=[v.year,v.make,v.model,v.trim,v.engine,v.fuel,v.id].join(" ").toLowerCase();
    if(q && !searchable.includes(q) && !searchable.replace(/[-\s]/g,"").includes(normalizedQ)) return false;
    if(model && canonicalModel(v.model)!==canonicalModel(model)) return false;
    if(make && String(v.make).toLowerCase()!==make) return false;
    if(fuel && !String(v.fuel).toLowerCase().startsWith(fuel)) return false;
    if(params.has("maxMileage") && Number.isFinite(maxMileage) && maxMileage>=0 && v.mileageMi>maxMileage) return false;
    return true;
  });
  const price=v=>v.pricing?.hasPrice ? Number(v.pricing.vehiclePrice) : Infinity;
  const tie=(a,b)=>(a.mileageMi??Infinity)-(b.mileageMi??Infinity);
  vehicles.sort((a,b)=>{
    if(sort==="mileage_asc") return tie(a,b) || (b.year||0)-(a.year||0);
    if(sort==="price_asc") return price(a)-price(b) || tie(a,b);
    if(sort==="price_desc") return (Number.isFinite(price(b))?price(b):-Infinity)-(Number.isFinite(price(a))?price(a):-Infinity) || tie(a,b);
    return (b.year||0)-(a.year||0) || tie(a,b);
  });
  return {...inventory,vehicles,totalVehicles:(inventory.vehicles||[]).length};
}

export async function getPublicInventoryHealth(env) {
  const state=(await readState(env))||{version:INVENTORY_SCHEMA_VERSION,syncedAt:null,maxMileage:MAX_MILES,sources:[],vehicles:[]};
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
  return (await readState(env))||{
    version:INVENTORY_SCHEMA_VERSION,
    maxMileage:MAX_MILES,
    syncedAt:null,
    candidateCap:180,
    databaseRows:0,
    sources:[],
    vehicles:[]
  };
}

export async function checkVehicleAvailability(env, vehicleId) {
  let state=await readState(env);
  if(!state || state.version!==INVENTORY_SCHEMA_VERSION) state=await syncVehicleInventory(env);

  const v=(state.vehicles||[]).find(x=>x.id===vehicleId);
  if(!v) return {available:false,reason:"not_found"};

  const source=SOURCE_PLUGINS.find(s=>s.id===v.sourceId);
  if(!source || !v.sourceUrl) return {available:false,reason:"source_unavailable"};

  if(source.searchService){
    try{
      const r=await checkSearchServiceVin(source,v.vin);
      if(!r.ok) return {available:false,reason:"dealer_page_unreachable"};
      v.lastAvailabilityCheckAt=now();
      if(!r.item){
        v.status="sold";
        v.availabilityReason="not_in_dealer_inventory";
        await saveState(env,state);
        return {available:false,reason:v.availabilityReason};
      }
      const {firstSeenAt,...fresh}=r.item.hints;
      Object.assign(v,fresh,{status:"available",missCount:0,lastVerifiedAt:now(),availabilityReason:"dealer_verified"});
      await saveState(env,state);
      return {
        available:true,reason:"dealer_verified",vehicleId:v.id,vin:v.vin||null,sourceId:v.sourceId,
        sourceNameInternal:v.sourceNameInternal||source.name,sourceUrl:v.sourceUrl,
        askingPrice:Number(v.askingPrice)||null,lastVerifiedAt:v.lastVerifiedAt,reservationMode:source.reservationMode||"manual"
      };
    }catch{
      return {available:false,reason:"verification_error"};
    }
  }

  try{
    const r=await fetchHtml(v.sourceUrl);
    if(!r.ok){
      v.missCount=(v.missCount||0)+1;
      if(v.missCount>=2) v.status="unavailable";
      await saveState(env,state);
      return {available:false,reason:"dealer_page_unreachable",httpStatus:r.status};
    }

    const fresh=source.fleetInventory ? {...v,soldSignal:!v.vin||!r.html.includes(v.vin)} : parseDetail(r.html,source,v.sourceUrl,v);
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
