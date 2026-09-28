// New crew-cab trucks from ROVIQ Core (Portland / Beaverton / Vancouver WA dealers).
// Core already applies the ROVIQ markup; this module only reads its public API.
const CORE_API = "https://roviq-core.onrender.com";
const PAGE_SIZE = 100;
const CACHE_SECONDS = 600;

export function coreNewTruckToCard(r) {
  const images = Array.isArray(r.image_urls) ? r.image_urls.filter(u => /^https:\/\//.test(String(u))) : [];
  const priceCents = Number(r.public_price_cents ?? r.price_cents);
  return {
    id: String(r.vin || r.id || ""),
    vin: r.vin || null,
    year: Number(r.year) || null,
    make: String(r.make || ""),
    model: String(r.model || ""),
    trim: String(r.trim || ""),
    mileageMi: Number.isFinite(Number(r.mileage)) ? Number(r.mileage) : null,
    drivetrain: r.drivetrain || null,
    fuel: r.fuel_type ? (/diesel/i.test(r.fuel_type) ? "Diesel" : /electric/i.test(r.fuel_type) ? "Electric" : "Gasoline") : null,
    exterior: r.exterior_color || null,
    image: images[0] || null,
    price: Number.isFinite(priceCents) && priceCents > 0 ? Math.round(priceCents / 100) : null
  };
}

export async function getNewTrucks(filters = new URLSearchParams(), fetcher = fetch, cache = globalThis.caches?.default) {
  const base = new URLSearchParams({ condition: "new", sort: "price_asc", limit: String(PAGE_SIZE) });
  const q = String(filters.get("q") || "").trim().slice(0, 80);
  const make = String(filters.get("make") || "");
  if (q) base.set("q", q);
  if (/^(Chevrolet|GMC|Ford)$/.test(make)) base.set("make", make);
  const out = [];
  const seen = new Set();
  let total = 0;
  for (let offset = 0; offset < 1000; offset += PAGE_SIZE) {
    const params = new URLSearchParams(base);
    params.set("offset", String(offset));
    const url = `${CORE_API}/api/inventory?${params}`;
    let res = cache ? await cache.match(url) : null;
    if (!res) {
      res = await fetcher(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`core_inventory_${res.status}`);
      if (cache) {
        const copy = new Response(res.clone().body, res);
        copy.headers.set("cache-control", `public, max-age=${CACHE_SECONDS}`);
        await cache.put(url, copy).catch(() => {});
      }
    }
    const body = await res.json();
    const rows = Array.isArray(body?.inventory) ? body.inventory : [];
    total = Number(body?.total) || total;
    // One card per VIN: a truck can be listed by more than one Core feed.
    for (const v of rows.map(coreNewTruckToCard)) {
      if (!v.id || !v.year || !v.make || !v.model || seen.has(v.id)) continue;
      seen.add(v.id);
      out.push(v);
    }
    if (rows.length < PAGE_SIZE || offset + rows.length >= total) break;
  }
  return { vehicles: out, total: out.length, syncedAt: new Date().toISOString() };
}

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i;

export async function findNewTruck(vin, fetcher = fetch, cache = globalThis.caches?.default) {
  if (!VIN_RE.test(String(vin || ""))) return null;
  const { vehicles } = await getNewTrucks(new URLSearchParams(), fetcher, cache);
  return vehicles.find(v => String(v.vin || "").toUpperCase() === String(vin).toUpperCase()) || null;
}

// Live availability from Core (dealer re-read hourly). Never includes the dealer.
export async function checkNewTruckAvailability(vin, fetcher = fetch) {
  if (!VIN_RE.test(String(vin || ""))) return { found: false, available: false };
  try {
    const res = await fetcher(`${CORE_API}/api/inventory/vin/${encodeURIComponent(vin)}`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    if (res.status === 404) return { found: false, available: false };
    if (!res.ok) return { error: true };
    const b = await res.json();
    return { found: true, available: Boolean(b.available), lastSeenAt: b.lastSeenAt || null };
  } catch { return { error: true }; }
}

// Core stores the request with the dealer and dealer price; we only keep its id.
export async function submitNewTruckInquiry(payload, fetcher = fetch) {
  try {
    const res = await fetcher(`${CORE_API}/api/inventory/inquiries`, {
      method: "POST", headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, ...(await res.json()) };
  } catch { return { ok: false, status: 0 }; }
}
