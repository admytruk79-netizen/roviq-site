import { richText, mediaFull, escapeHtml } from "../layout.js";
import { STATION_IMAGES } from "../../content/station-images.js";

const SERVICES = [
  { key: "fuel", title: "Fuel", accent: "gold" },
  { key: "ev", title: "EV Charging", accent: "teal" },
  { key: "cafe", title: "Café", accent: "navy" },
  { key: "wine", title: "Market & Retail", accent: "gold" },
  { key: "wash", title: "Car Wash", accent: "teal" }
];

const MODULES = [
  {
    title: "Motor Court",
    body: "station.expansion_motor_court_body",
    image: "motorcourt",
    label: "Hospitality concept"
  },
  {
    title: "Swap Station",
    body: "station.expansion_post_station_body",
    image: "swap-station",
    label: "Energy concept"
  },
  {
    title: "Vehicle Relay",
    body: "station.expansion_vehicle_relay_body",
    image: "relay-station",
    label: "Mobility concept"
  }
];

export function stationPage(c) {
  const fuelImage = c["station.image_fuel"];
  const portlandImage = c["station.image_portland"];

  return `
<style>
  .station-hero-grid {
    display:grid;
    grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);
    gap:3rem;
    align-items:center;
  }
  .station-hero-grid .media-full { box-shadow:0 18px 55px rgba(0,0,0,.28); border-color:rgba(255,255,255,.14); }
  .station-hero-copy { max-width:34rem; }
  .station-hero-copy .lead:last-child { margin-bottom:0; }

  .station-feature-grid {
    display:grid;
    grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);
    gap:3rem;
    align-items:center;
  }
  .station-feature-grid--reverse { grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr); }
  .station-feature-copy { max-width:38rem; }
  .station-feature-grid .media-full { box-shadow:0 12px 32px rgba(11,37,69,.12); }

  .station-service-grid {
    display:grid;
    grid-template-columns:repeat(5,minmax(0,1fr));
    gap:1rem;
    margin-top:1.75rem;
  }
  .station-service-grid .card { padding:1.35rem; min-height:100%; }
  .station-service-grid .card h3 { font-size:1.08rem; }
  .station-service-grid .card p { font-size:.92rem; margin-bottom:0; }

  .station-visual {
    margin-top:2.25rem;
    max-width:1040px;
    margin-left:auto;
    margin-right:auto;
  }
  .station-visual .media-full { box-shadow:0 12px 34px rgba(11,37,69,.12); }
  .station-visual--pair {
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:1.25rem;
    max-width:none;
  }

  .station-network-band { text-align:center; }
  .station-network-band .lead { max-width:52rem; margin:0 auto; color:#d7e0ef; }

  .station-modules { display:grid; gap:1.5rem; margin-top:2rem; }
  .station-module {
    display:grid;
    grid-template-columns:minmax(260px,.9fr) minmax(0,1.1fr);
    background:#fff;
    border:1px solid var(--line);
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 8px 24px rgba(11,37,69,.07);
  }
  .station-module:nth-child(even) { grid-template-columns:minmax(0,1.1fr) minmax(260px,.9fr); }
  .station-module:nth-child(even) .station-module-image { order:2; }
  .station-module-copy { padding:2rem; align-self:center; }
  .station-module-copy h3 { margin-bottom:.6rem; }
  .station-module-copy p { margin-bottom:0; }
  .station-module-image .media-full { height:100%; border:0; border-radius:0; }
  .station-module-image .media-full img { width:100%; height:100%; object-fit:cover; min-height:300px; }
  .station-concept-label {
    display:inline-block;
    margin-bottom:.75rem;
    font-size:.72rem;
    text-transform:uppercase;
    letter-spacing:.1em;
    font-weight:800;
    color:var(--rust);
  }

  .station-cta {
    background:linear-gradient(135deg,#f5f0e2,#fff);
    border:1px solid var(--line);
    border-radius:16px;
    padding:2.5rem;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:2rem;
  }
  .station-cta-copy { max-width:46rem; }
  .station-cta-copy p { margin-bottom:0; }

  @media (max-width:1000px) {
    .station-service-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
  }
  @media (max-width:800px) {
    .station-hero-grid,
    .station-feature-grid,
    .station-feature-grid--reverse { grid-template-columns:1fr; gap:1.75rem; }
    .station-hero-copy,
    .station-feature-copy { max-width:none; }
    .station-service-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .station-module,
    .station-module:nth-child(even) { grid-template-columns:1fr; }
    .station-module:nth-child(even) .station-module-image { order:0; }
    .station-module-image .media-full img { min-height:0; height:auto; object-fit:contain; }
    .station-cta { display:block; padding:2rem; }
    .station-cta .btn { margin-top:1.25rem; }
  }
  @media (max-width:520px) {
    .station-service-grid { grid-template-columns:1fr; }
    .station-visual--pair { grid-template-columns:1fr; }
    .station-module-copy { padding:1.5rem; }
  }
</style>

<section class="hero section--tight">
  <div class="container">
    <div class="station-hero-grid">
      <div class="station-hero-copy">
        <span class="eyebrow">${escapeHtml(c["station.hero_eyebrow"])}</span>
        <h1>${escapeHtml(c["station.hero_heading"])}</h1>
        <p class="lead" style="font-family:'Cinzel', serif; color:var(--gold-light); font-size:1.2rem;">${escapeHtml(c["station.tagline"])}</p>
        <p class="lead">${escapeHtml(c["station.hero_sub"])}</p>
      </div>
      ${mediaFull(STATION_IMAGES["hero-forecourt"].file, STATION_IMAGES["hero-forecourt"].alt)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="station-feature-grid">
      <div class="station-feature-copy">
        <span class="eyebrow">The concept</span>
        <h2>${escapeHtml(c["station.concept_heading"])}</h2>
        ${richText(c["station.concept_body"])}
      </div>
      ${mediaFull(STATION_IMAGES["forecourt-secondary"].file, STATION_IMAGES["forecourt-secondary"].alt)}
    </div>
  </div>
</section>

<section class="section section--navy station-network-band">
  <div class="container">
    <span class="eyebrow">A physical node in the Roviq network</span>
    <h2>More than a stop: a coordinated automotive service hub</h2>
    <p class="lead">Roviq Station is envisioned as a premium travel-center format combining fuel, EV charging, café and market retail, vehicle care, and selected Roviq-enabled service handoffs in one recognizable location.</p>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Product &amp; service mix</span>
    <h2>Multiple needs, one visit</h2>
    <div class="station-service-grid">
      ${SERVICES.map(
        (s) => `<div class="card card--accent-${s.accent}">
          <h3>${s.title}</h3>
          <p>${escapeHtml(c[`station.service_${s.key}_body`])}</p>
        </div>`
      ).join("\n")}
    </div>
    ${fuelImage ? `
      <div class="station-visual station-visual--pair">
        ${mediaFull(fuelImage, "Roviq Station fuel and forecourt detail")}
        ${mediaFull(STATION_IMAGES["ev-charging"].file, STATION_IMAGES["ev-charging"].alt)}
      </div>` : `
      <div class="station-visual">
        ${mediaFull(STATION_IMAGES["ev-charging"].file, STATION_IMAGES["ev-charging"].alt)}
      </div>`}
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="station-feature-grid station-feature-grid--reverse">
      <div>
        ${mediaFull(STATION_IMAGES["interior-cafe"].file, STATION_IMAGES["interior-cafe"].alt)}
      </div>
      <div class="station-feature-copy">
        <span class="eyebrow">Customer experience</span>
        <h2>${escapeHtml(c["station.layout_heading"])}</h2>
        ${richText(c["station.layout_body"])}
        <p class="diagram-caption" style="text-align:left; margin-top:1rem;">Quick-stop convenience and café dwell time are designed as distinct flows inside one clearly recognizable travel-center environment.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    ${portlandImage ? `
      <div class="station-feature-grid">
        <div class="station-feature-copy">
          <span class="eyebrow">Market entry</span>
          <h2>${escapeHtml(c["station.portland_heading"])}</h2>
          ${richText(c["station.portland_body"])}
        </div>
        ${mediaFull(portlandImage, "Portland-area Roviq Station concept")}
      </div>` : `
      <div style="max-width:760px;">
        <span class="eyebrow">Market entry</span>
        <h2>${escapeHtml(c["station.portland_heading"])}</h2>
        ${richText(c["station.portland_body"])}
      </div>`}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Future modules</span>
    <h2>${escapeHtml(c["station.expansion_heading"])}</h2>
    <div style="max-width:780px;">${richText(c["station.expansion_body"])}</div>

    <div class="station-modules">
      ${MODULES.map((m) => `
        <article class="station-module">
          <div class="station-module-image">
            ${mediaFull(STATION_IMAGES[m.image].file, STATION_IMAGES[m.image].alt)}
          </div>
          <div class="station-module-copy">
            <span class="station-concept-label">${m.label}</span>
            <h3>${m.title}</h3>
            <p>${escapeHtml(c[m.body])}</p>
          </div>
        </article>`).join("\n")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="station-cta">
      <div class="station-cta-copy">
        <span class="eyebrow">Explore the connection</span>
        <h2>Physical infrastructure connected to the coordination platform</h2>
        <p>Roviq Station complements the software layer rather than replacing existing automotive businesses. It can serve as a visible service point, customer handoff location, and future network node.</p>
      </div>
      <a href="/roviq-x-station" class="btn btn--navy">See Roviq × Station &rarr;</a>
    </div>
  </div>
</section>
`;
}
