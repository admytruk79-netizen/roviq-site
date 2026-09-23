const vehicles = [
  {
    id: "ROVIQ-US-0001",
    year: 2026,
    make: "Chevrolet",
    model: "Silverado 1500",
    trim: "WT",
    mileageMi: 5229,
    engine: "2.7L TurboMax",
    power: "310 hp",
    drivetrain: "4×4",
    transmission: "8-speed automatic",
    fuel: "Gasoline",
    exterior: "Sterling Gray Metallic",
    interior: "Jet Black vinyl",
    vinPublic: "••••••108327",
    photo: "https://pictures.dealer.com/c/carrautogroupinc/0504/8ea960d39094638f006afbe60e3d52abx.jpg?imdensity=1&impolicy=downsize_bkpt&w=1400",
    photoLabel: "ACTUAL VEHICLE PHOTO",
    featured: true
  },
  {
    id: "ROVIQ-US-0002",
    year: 2024,
    make: "GMC",
    model: "Sierra 1500",
    trim: "Pro",
    mileageMi: 22491,
    engine: "2.7L Turbo",
    power: "310 hp",
    drivetrain: "4WD",
    transmission: "8-speed automatic",
    fuel: "Gasoline",
    exterior: "Summit White",
    interior: "Black",
    vinPublic: "••••••354709",
    photo: "https://www.mcelveen.com/inventoryphotos/16442/1gtphaek1tz194805/ip/1.jpg",
    photoLabel: "MODEL REFERENCE • SPECS VERIFIED"
  },
  {
    id: "ROVIQ-US-0003",
    year: 2021,
    make: "GMC",
    model: "Sierra 1500",
    trim: "AT4",
    mileageMi: 49460,
    engine: "3.0L Duramax I6",
    power: "Diesel",
    drivetrain: "4WD",
    transmission: "10-speed automatic",
    fuel: "Diesel",
    exterior: "Onyx Black",
    interior: "Jet Black / Kalahari",
    vinPublic: "••••••319056",
    photo: "https://www.autocollectionofmurfreesboro.com/imagetag/16508/main/l/Used-2021-GMC-Sierra-1500-AT4-1691011799.jpg",
    photoLabel: "MODEL REFERENCE • SPECS VERIFIED"
  },
  {
    id: "ROVIQ-US-0004",
    year: 2025,
    make: "GMC",
    model: "Sierra 2500HD",
    trim: "Denali",
    mileageMi: 11013,
    engine: "6.6L Duramax V8",
    power: "Turbo-diesel",
    drivetrain: "4WD",
    transmission: "10-speed automatic",
    fuel: "Diesel",
    exterior: "Onyx Black",
    interior: "Jet Black",
    vinPublic: "••••••213746",
    photo: "https://vehicle-images.dealerinspire.com/0b77-110006514/1GT4UREY7SF213746/9a54e052590b0a9dfe99bde25375d17d.jpg",
    photoLabel: "ACTUAL LISTING / MARKET PHOTO"
  },
  {
    id: "ROVIQ-US-0005",
    year: 2026,
    make: "GMC",
    model: "Sierra EV",
    trim: "Denali Max Range",
    mileageMi: 6679,
    engine: "Dual-motor electric",
    power: "Max Range",
    drivetrain: "e4WD",
    transmission: "Single-speed",
    fuel: "Electric",
    exterior: "Dark Ember Metallic",
    interior: "After Dark",
    vinPublic: "••••••400363",
    photo: "https://s3.amazonaws.com/images.gearjunkie.com/uploads/2022/10/2024-GMC-Sierra-EV-Denali-EV-1-front-3-4-v1-REL-1380x920.jpg",
    photoLabel: "MODEL REFERENCE • SPECS VERIFIED"
  }
];

function km(mi) {
  return Math.round(mi * 1.60934).toLocaleString("en-US");
}

function vehicleCard(v) {
  return `
    <article class="uk-card">
      <div class="uk-photo">
        <img src="${v.photo}" alt="${v.year} ${v.make} ${v.model} ${v.trim}" loading="lazy"
          onerror="this.closest('.uk-photo').classList.add('photo-error');this.remove()">
        <div class="uk-badge">${v.featured ? "ULTRA-LOW MILEAGE" : "VERIFIED VEHICLE"}</div>
        <div class="uk-photo-label">${v.photoLabel}</div>
      </div>
      <div class="uk-info">
        <div class="uk-id">${v.id} • AVAILABLE IN USA</div>
        <h2>${v.year} ${v.make} ${v.model}</h2>
        <div class="uk-sub">${v.trim} • ${v.drivetrain} • ${v.engine}</div>
        <div class="uk-specs">
          <div class="uk-spec"><span>Mileage</span><strong>${v.mileageMi.toLocaleString("en-US")} mi / ${km(v.mileageMi)} km</strong></div>
          <div class="uk-spec"><span>Engine</span><strong>${v.engine}</strong></div>
          <div class="uk-spec"><span>Power</span><strong>${v.power}</strong></div>
          <div class="uk-spec"><span>Drivetrain</span><strong>${v.drivetrain}</strong></div>
          <div class="uk-spec"><span>Transmission</span><strong>${v.transmission}</strong></div>
          <div class="uk-spec"><span>Fuel</span><strong>${v.fuel}</strong></div>
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
    .uk-hero{max-width:820px;margin-bottom:28px}
    .uk-kicker{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#5b7590;margin-bottom:10px}
    .uk-hero h1{font-size:clamp(2.1rem,5vw,4rem);line-height:1;margin:0 0 15px;color:#0a2946}
    .uk-hero p{font-size:1.04rem;line-height:1.6;color:#536b80;margin:0}
    .uk-note{margin-top:18px;padding:13px 15px;border-left:4px solid #f1c40f;background:#fff;border-radius:7px;color:#40566a}
    .uk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
    .uk-card{background:#fff;border:1px solid #dbe5ee;border-radius:18px;overflow:hidden;box-shadow:0 14px 38px rgba(12,42,68,.09)}
    .uk-photo{position:relative;background:linear-gradient(135deg,#e7eef4,#cbd8e2);aspect-ratio:16/10;overflow:hidden}
    .uk-photo:after{content:"ROVIQ";position:absolute;inset:auto 18px 18px auto;color:rgba(10,41,70,.18);font-size:34px;font-weight:900;letter-spacing:.08em}
    .uk-photo img{width:100%;height:100%;object-fit:cover;display:block;position:relative;z-index:1}
    .uk-badge{position:absolute;z-index:2;left:14px;top:14px;background:#0a4f89;color:#fff;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:800;letter-spacing:.08em}
    .uk-photo-label{position:absolute;z-index:2;right:12px;bottom:12px;background:rgba(5,25,44,.78);color:#fff;border-radius:6px;padding:6px 8px;font-size:9px;font-weight:800;letter-spacing:.08em}
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
    @media(max-width:480px){.uk-wrap{padding-left:14px;padding-right:14px}.uk-info{padding:16px}.uk-specs{grid-template-columns:1fr 1fr}.uk-actions{flex-direction:column}.uk-btn{width:100%}}
  </style>

  <section class="uk-wrap">
    <div class="uk-hero">
      <div class="uk-kicker">ROVIQ • U.S. Vehicle Selection</div>
      <h1>Available vehicles for Ukraine.</h1>
      <p>Curated used and low-mileage American trucks selected from current U.S. inventory. Customer-facing listings intentionally omit acquisition price, dealer source and ROVIQ commercial terms.</p>
      <div class="uk-note"><strong>Five verified vehicles are shown below.</strong> Vehicle specifications and mileage are tied to real current or recently indexed listings. Exact listing photos are used where available; otherwise the image is clearly marked as a model reference.</div>
    </div>

    <div class="uk-grid">
      ${vehicles.map(vehicleCard).join("")}
    </div>

    <div class="uk-foot">Availability changes quickly. ROVIQ re-verifies the vehicle, title/history, export eligibility and final logistics before any customer commitment.</div>
  </section>`;
}
