const vehicle = {
  id: "ROVIQ-US-0001",
  status: "Available in USA",
  year: 2026,
  make: "Chevrolet",
  model: "Silverado 1500",
  trim: "WT",
  mileageMi: "5,229",
  mileageKm: "8,415",
  engine: "TurboMax™",
  horsepower: "310 hp",
  drivetrain: "4×4",
  transmission: "8-speed automatic",
  fuelEconomy: "17 / 21 MPG",
  towing: "9,000 lb",
  exterior: "Sterling Gray Metallic",
  interior: "Jet Black vinyl",
  seats: "5",
  vinPublic: "••••••108327",
  image: "https://pictures.dealer.com/c/carrautogroupinc/0504/8ea960d39094638f006afbe60e3d52abx.jpg?imdensity=1&impolicy=downsize_bkpt&w=1400"
};

export function ukrainePage() {
  return `
  <style>
    .uk-wrap{max-width:1180px;margin:0 auto;padding:44px 22px 72px}
    .uk-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:34px;align-items:center;margin-bottom:34px}
    .uk-kicker{font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#5b7590;margin-bottom:10px}
    .uk-hero h1{font-size:clamp(2.2rem,5vw,4.3rem);line-height:.98;margin:0 0 16px;color:#0a2946}
    .uk-hero p{font-size:1.08rem;line-height:1.6;color:#536b80;max-width:650px;margin:0}
    .uk-note{margin-top:20px;padding:13px 15px;border-left:4px solid #f1c40f;background:#fff;border-radius:7px;color:#40566a}
    .uk-card{background:#fff;border:1px solid #dbe5ee;border-radius:18px;overflow:hidden;box-shadow:0 16px 44px rgba(12,42,68,.1)}
    .uk-photo{position:relative;background:#eef3f7;aspect-ratio:16/10;overflow:hidden}
    .uk-photo img{width:100%;height:100%;object-fit:cover;display:block}
    .uk-badge{position:absolute;left:16px;top:16px;background:#0a4f89;color:#fff;border-radius:999px;padding:8px 12px;font-size:11px;font-weight:800;letter-spacing:.08em}
    .uk-info{padding:24px}
    .uk-id{font-size:12px;color:#7890a4;font-weight:800;letter-spacing:.08em}
    .uk-info h2{font-size:2rem;line-height:1.05;margin:7px 0 6px;color:#102d48}
    .uk-sub{font-size:1rem;font-weight:700;color:#45617a;margin-bottom:22px}
    .uk-specs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .uk-spec{padding:13px;border-radius:10px;background:#f6f9fb;border:1px solid #e5edf3}
    .uk-spec span{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;color:#8193a4;margin-bottom:5px}
    .uk-spec strong{font-size:14px;color:#183c5a}
    .uk-actions{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}
    .uk-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 17px;border-radius:9px;text-decoration:none;font-weight:800;border:1px solid #0a4f89}
    .uk-btn.primary{background:#0a4f89;color:#fff}
    .uk-btn.secondary{background:#fff;color:#0a4f89}
    .uk-foot{margin-top:18px;font-size:12px;color:#71879a;line-height:1.5}
    @media(max-width:820px){.uk-hero{grid-template-columns:1fr}.uk-specs{grid-template-columns:repeat(2,minmax(0,1fr))}.uk-info h2{font-size:1.55rem}}
  </style>

  <section class="uk-wrap">
    <div class="uk-hero">
      <div>
        <div class="uk-kicker">ROVIQ • U.S. Vehicle Selection</div>
        <h1>Selected for Ukraine.</h1>
        <p>Curated low-mileage American vehicles with verified specifications. Public listings show the vehicle and its condition — not dealer pricing, sourcing cost, or ROVIQ commercial terms.</p>
        <div class="uk-note"><strong>Verified inventory only.</strong> Every vehicle shown here is tied to a live U.S. source record reviewed by ROVIQ.</div>
      </div>
      <div></div>
    </div>

    <article class="uk-card">
      <div class="uk-photo">
        <img src="${vehicle.image}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}" loading="eager">
        <div class="uk-badge">ULTRA-LOW MILEAGE</div>
      </div>
      <div class="uk-info">
        <div class="uk-id">${vehicle.id} • ${vehicle.status.toUpperCase()}</div>
        <h2>${vehicle.year} ${vehicle.make} ${vehicle.model}</h2>
        <div class="uk-sub">${vehicle.trim} • ${vehicle.drivetrain} • ${vehicle.engine}</div>

        <div class="uk-specs">
          <div class="uk-spec"><span>Mileage</span><strong>${vehicle.mileageMi} mi / ${vehicle.mileageKm} km</strong></div>
          <div class="uk-spec"><span>Engine</span><strong>${vehicle.engine}</strong></div>
          <div class="uk-spec"><span>Power</span><strong>${vehicle.horsepower}</strong></div>
          <div class="uk-spec"><span>Drivetrain</span><strong>${vehicle.drivetrain}</strong></div>
          <div class="uk-spec"><span>Transmission</span><strong>${vehicle.transmission}</strong></div>
          <div class="uk-spec"><span>Fuel economy</span><strong>${vehicle.fuelEconomy}</strong></div>
          <div class="uk-spec"><span>Towing</span><strong>${vehicle.towing}</strong></div>
          <div class="uk-spec"><span>Exterior</span><strong>${vehicle.exterior}</strong></div>
          <div class="uk-spec"><span>Interior</span><strong>${vehicle.interior}</strong></div>
          <div class="uk-spec"><span>Seats</span><strong>${vehicle.seats}</strong></div>
          <div class="uk-spec"><span>Vehicle ID</span><strong>${vehicle.vinPublic}</strong></div>
          <div class="uk-spec"><span>Status</span><strong>${vehicle.status}</strong></div>
        </div>

        <div class="uk-actions">
          <a class="uk-btn primary" href="/contact?vehicle=${encodeURIComponent(vehicle.id)}">Request this vehicle</a>
          <a class="uk-btn secondary" href="/contact">Ask ROVIQ</a>
        </div>

        <div class="uk-foot">Availability can change without notice. Final export eligibility, documentation, logistics, taxes and delivery terms are confirmed individually before purchase.</div>
      </div>
    </article>
  </section>`;
}
