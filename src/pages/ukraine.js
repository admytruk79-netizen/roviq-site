const vehicles = [
  {
    id: "ROVIQ-US-0001",
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
    towing: "9,000 lb",
    vinPublic: "••••••108327",
    source: "https://www.carrchevrolet.com/used/Chevrolet/2026-Chevrolet-Silverado-1500-8fbee0baac1839ba6a4280d5c7d82991.htm",
    directImage: "https://pictures.dealer.com/c/carrautogroupinc/0504/8ea960d39094638f006afbe60e3d52abx.jpg?imdensity=1&impolicy=downsize_bkpt&w=1400"
  },
  {
    id: "ROVIQ-US-0002",
    year: 2022,
    make: "Chevrolet",
    model: "Silverado 1500 LTD",
    trim: "LTZ",
    mileageMi: 29366,
    engine: "6.2L EcoTec3 V8",
    drivetrain: "4×4",
    transmission: "Automatic",
    fuel: "Gasoline",
    exterior: "Summit White",
    interior: "Jet Black leather",
    towing: "9,400 lb",
    vinPublic: "••••••107862",
    source: "https://www.carrchevrolet.com/used/Chevrolet/2022-Chevrolet-Silverado-1500-LTD-f7b80716ac182443b3ec2a6e0067f4d4.htm"
  },
  {
    id: "ROVIQ-US-0003",
    year: 2025,
    make: "Chevrolet",
    model: "Silverado 2500HD",
    trim: "Custom",
    mileageMi: 31500,
    engine: "6.6L Duramax V8 Turbo-Diesel",
    drivetrain: "4WD",
    transmission: "Automatic",
    fuel: "Diesel",
    exterior: "White",
    interior: "Black",
    towing: "HD configuration",
    vinPublic: "••••••124815",
    source: "https://www.tonkinwilsonvillenissan.com/vehicle/used-2025-Chevrolet-Silverado2500Hd-Custom-Truck-Portland-OR-1GC5KMEY8SF124815/"
  },
  {
    id: "ROVIQ-US-0004",
    year: 2026,
    make: "GMC",
    model: "Sierra EV",
    trim: "Denali Max Range",
    mileageMi: 6677,
    engine: "Dual-motor electric",
    drivetrain: "e4WD",
    transmission: "Single-speed",
    fuel: "Electric",
    exterior: "Dark Ember Metallic",
    interior: "After Dark",
    towing: "Tow package equipped",
    vinPublic: "••••••400363",
    source: "https://www.cadillacportland.com/used-Portland-2026-GMC-Sierra%2BEV-Denali%2BMax%2BRange-1GT4EYEL5TU400363"
  },
  {
    id: "ROVIQ-US-0005",
    year: 2025,
    make: "Chevrolet",
    model: "Silverado EV",
    trim: "RST Max Range",
    mileageMi: 13140,
    engine: "Dual-motor electric",
    drivetrain: "AWD",
    transmission: "Single-speed",
    fuel: "Electric",
    exterior: "Slate Gray",
    interior: "Black",
    range: "460 mi listed range",
    vinPublic: "••••••409171",
    source: "https://www.lithia.com/used/Chevrolet/2025-Chevrolet-Silverado-EV-85b4cf85ac1814e012e1fffc0cd18e38.htm"
  }
];

const byId = Object.fromEntries(vehicles.map(v => [v.id, v]));

function km(mi) {
  return Math.round(mi * 1.60934).toLocaleString("en-US");
}

function escapeAttr(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function firstImageFromHtml(html) {
  const candidates = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /https:\/\/pictures\.dealer\.com\/[^\"'<>\\s]+/i,
    /https:\/\/vehicle-images\.dealerinspire\.com\/[^\"'<>\\s]+/i,
    /https:\/\/[^\"'<>\\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^\"'<>\\s]*)?/i
  ];
  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match) return (match[1] || match[0]).replace(/&amp;/g, "&");
  }
  return null;
}

export async function handleUkraineVehicleImage(request) {
  const url = new URL(request.url);
  const id = decodeURIComponent(url.pathname.split("/").pop() || "");
  const vehicle = byId[id];
  if (!vehicle) return new Response("Not found", { status: 404 });

  if (vehicle.directImage) {
    return Response.redirect(vehicle.directImage, 302);
  }

  try {
    const sourceResponse = await fetch(vehicle.source, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ROVIQVehicleCatalog/1.0)",
        "accept": "text/html,application/xhtml+xml"
      },
      redirect: "follow"
    });
    if (!sourceResponse.ok) throw new Error("source unavailable");
    const html = await sourceResponse.text();
    const imageUrl = firstImageFromHtml(html);
    if (!imageUrl) throw new Error("image unavailable");
    return Response.redirect(imageUrl, 302);
  } catch {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#dbe6ef"/><stop offset="1" stop-color="#b9c9d6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="48%" text-anchor="middle" font-family="Arial" font-size="70" font-weight="700" fill="#163b5b">ROVIQ</text><text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="28" fill="#49667f">Vehicle photo temporarily unavailable</text></svg>`;
    return new Response(svg, { headers: { "content-type": "image/svg+xml", "cache-control": "no-store" } });
  }
}

function vehicleCard(v) {
  const extra = v.range ? ["Range", v.range] : ["Capability", v.towing || "—"];
  return `
    <article class="uk-card">
      <div class="uk-photo">
        <img src="/ukraine/image/${encodeURIComponent(v.id)}" alt="${escapeAttr(v.year + " " + v.make + " " + v.model + " " + v.trim)}" loading="lazy">
        <div class="uk-badge">${v.mileageMi < 10000 ? "ULTRA-LOW MILEAGE" : "UNDER 60,000 MILES"}</div>
      </div>
      <div class="uk-info">
        <div class="uk-id">${v.id} • AVAILABLE IN USA</div>
        <h2>${v.year} ${v.make} ${v.model}</h2>
        <div class="uk-sub">${v.trim} • ${v.drivetrain} • ${v.engine}</div>
        <div class="uk-specs">
          <div class="uk-spec"><span>Mileage</span><strong>${v.mileageMi.toLocaleString("en-US")} mi / ${km(v.mileageMi)} km</strong></div>
          <div class="uk-spec"><span>Engine</span><strong>${v.engine}</strong></div>
          <div class="uk-spec"><span>Drivetrain</span><strong>${v.drivetrain}</strong></div>
          <div class="uk-spec"><span>Transmission</span><strong>${v.transmission}</strong></div>
          <div class="uk-spec"><span>Fuel</span><strong>${v.fuel}</strong></div>
          <div class="uk-spec"><span>${extra[0]}</span><strong>${extra[1]}</strong></div>
          <div class="uk-spec"><span>Exterior</span><strong>${v.exterior}</strong></div>
          <div class="uk-spec"><span>Interior</span><strong>${v.interior}</strong></div>
          <div class="uk-spec"><span>Vehicle ID</span><strong>${v.vinPublic}</strong></div>
        </div>
        <div class="uk-actions">
          <a class="uk-btn primary" href="/contact?vehicle=${encodeURIComponent(v.id)}">Request this vehicle</a>
          <a class="uk-btn secondary" href="/contact">Ask ROVIQ</a>
        </div>
      </div>
    </article>`;
}

export function ukrainePage() {
  return `
  <style>
    .uk-wrap{max-width:1220px;margin:0 auto;padding:42px 20px 72px}
    .uk-hero{max-width:850px;margin-bottom:28px}
    .uk-kicker{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#5b7590;margin-bottom:10px}
    .uk-hero h1{font-size:clamp(2.1rem,5vw,4rem);line-height:1;margin:0 0 15px;color:#0a2946}
    .uk-hero p{font-size:1.04rem;line-height:1.6;color:#536b80;margin:0}
    .uk-note{margin-top:18px;padding:13px 15px;border-left:4px solid #f1c40f;background:#fff;border-radius:7px;color:#40566a}
    .uk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
    .uk-card{background:#fff;border:1px solid #dbe5ee;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(12,42,68,.09)}
    .uk-photo{position:relative;background:#e8eef3;aspect-ratio:16/10;overflow:hidden}
    .uk-photo img{width:100%;height:100%;object-fit:cover;display:block}
    .uk-badge{position:absolute;left:14px;top:14px;background:#0a4f89;color:#fff;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:800;letter-spacing:.08em}
    .uk-info{padding:20px}
    .uk-id{font-size:11px;color:#7890a4;font-weight:800;letter-spacing:.08em}
    .uk-info h2{font-size:1.55rem;line-height:1.05;margin:7px 0 5px;color:#102d48}
    .uk-sub{font-size:.96rem;font-weight:700;color:#45617a;margin-bottom:17px}
    .uk-specs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .uk-spec{padding:10px;border-radius:9px;background:#f6f9fb;border:1px solid #e5edf3;min-width:0}
    .uk-spec span{display:block;font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:#8193a4;margin-bottom:4px}
    .uk-spec strong{font-size:12px;color:#183c5a;line-height:1.25}
    .uk-actions{display:flex;gap:10px;margin-top:17px}
    .uk-btn{display:inline-flex;align-items:center;justify-content:center;padding:11px 14px;border-radius:9px;text-decoration:none;font-weight:800;border:1px solid #0a4f89;font-size:13px}
    .uk-btn.primary{background:#0a4f89;color:#fff;flex:1}
    .uk-btn.secondary{background:#fff;color:#0a4f89}
    .uk-foot{margin-top:22px;font-size:12px;color:#71879a;line-height:1.55}
    @media(max-width:860px){.uk-grid{grid-template-columns:1fr}.uk-specs{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:480px){.uk-wrap{padding-left:14px;padding-right:14px}.uk-info{padding:16px}.uk-actions{flex-direction:column}.uk-btn{width:100%}}
  </style>

  <section class="uk-wrap">
    <div class="uk-hero">
      <div class="uk-kicker">ROVIQ • U.S. Vehicle Selection</div>
      <h1>Trucks selected for Ukraine.</h1>
      <p>Current U.S. inventory with fewer than 60,000 miles, selected for practical use, capability and condition. Customer-facing listings intentionally omit dealer pricing, source identity and ROVIQ commercial terms.</p>
      <div class="uk-note"><strong>Current filter: under 60,000 miles.</strong> This page now includes gasoline, Duramax diesel and electric pickups. Each card uses one photograph pulled from its verified source listing.</div>
    </div>

    <div class="uk-grid">
      ${vehicles.map(vehicleCard).join("")}
    </div>

    <div class="uk-foot">Availability changes quickly. ROVIQ re-verifies mileage, vehicle history, title status, export eligibility and final logistics before any customer commitment.</div>
  </section>`;
}
