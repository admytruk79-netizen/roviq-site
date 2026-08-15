import { richText, mediaFull, diagramImage, renderBullets, renderStats, escapeHtml } from "../layout.js";
import { STATION_IMAGES } from "../../content/station-images.js";
import { CAR_WASH_IMAGE } from "../carwash-image.js";

const SERVICES = [
  { key: "fuel", title: "Fuel", accent: "gold" },
  { key: "ev", title: "EV Charging", accent: "teal" },
  { key: "cafe", title: "Café", accent: "navy" },
  { key: "wine", title: "Wine & Retail", accent: "gold" },
  { key: "wash", title: "Car Wash", accent: "teal" }
];

export function stationPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <div class="grid grid--2" style="align-items:center;">
      <div>
        <span class="eyebrow">${escapeHtml(c["station.hero_eyebrow"])}</span>
        <h1>${escapeHtml(c["station.hero_heading"])}</h1>
        <p class="lead" style="font-family:'Cinzel',serif;color:var(--gold-light);font-size:1.2rem;">${escapeHtml(c["station.tagline"])}</p>
        <p class="lead">${escapeHtml(c["station.hero_sub"])}</p>
      </div>
      ${mediaFull(STATION_IMAGES["hero-forecourt"].file, STATION_IMAGES["hero-forecourt"].alt)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">The concept</span>
    <h2>${escapeHtml(c["station.concept_heading"])}</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div>${richText(c["station.concept_body"])}</div>
      ${mediaFull(STATION_IMAGES["forecourt-secondary"].file, STATION_IMAGES["forecourt-secondary"].alt)}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Why now</span>
    <h2>${escapeHtml(c["station.market_heading"])}</h2>
    ${renderStats(c["station.market_stats"])}
    ${richText(c["station.market_body"])}
    <div class="callout">
      <span class="eyebrow">${escapeHtml(c["station.proof_heading"])}</span>
      ${richText(c["station.proof_body"])}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Where Roviq Station fits</span>
    <h2>${escapeHtml(c["station.benchmark_heading"])}</h2>
    ${renderBullets(c["station.benchmark_body"])}
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Product &amp; service mix</span>
    <h2>Five services, one visit</h2>
    <div class="grid grid--5">
      ${SERVICES.map((s)=>`<div class="card card--accent-${s.accent}"><h3>${s.title}</h3><p>${escapeHtml(c[`station.service_${s.key}_body`])}</p></div>`).join("\n")}
    </div>

    <div class="station-module-grid" style="margin-top:1.5rem;">
      <div class="station-module-card">
        <span class="eyebrow">EV charging</span>
        <h3>Dedicated fast-charging bank</h3>
        ${mediaFull(STATION_IMAGES["ev-charging"].file, STATION_IMAGES["ev-charging"].alt)}
      </div>
      <div class="station-module-card">
        <span class="eyebrow">Portable café</span>
        <h3>A smaller satellite format</h3>
        ${mediaFull(STATION_IMAGES["portable-cafe"].file, STATION_IMAGES["portable-cafe"].alt)}
      </div>
    </div>

    <div class="station-wash-feature">
      <div>
        <span class="eyebrow">Car wash</span>
        <h3>Car Wash &amp; Vacuum Bay</h3>
        <p>A dedicated wash and vacuum module with its own ROVIQ identity — not another forecourt image.</p>
      </div>
      ${mediaFull(CAR_WASH_IMAGE, "Roviq Station car wash and vacuum bay")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Site &amp; interior</span>
    <h2>${escapeHtml(c["station.layout_heading"])}</h2>
    ${richText(c["station.layout_body"])}
    <div class="grid grid--2 station-diagram-grid">
      ${diagramImage("/diagrams/site_layout.png","Roviq Station site layout schematic","Site layout — fuel/EV canopy at the perimeter, café + retail anchoring the center, wash at the rear.")}
      ${diagramImage("/diagrams/interior_layout.png","Roviq Station interior zoning schematic","Interior layout — fast lane kept separate from sit-down café flow.")}
    </div>
    <div class="station-interior-render">
      ${mediaFull(STATION_IMAGES["interior-cafe"].file, STATION_IMAGES["interior-cafe"].alt)}
      <p class="diagram-caption">The interior in practice — coffee, fresh food, retail and grab-and-go inside the Station.</p>
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Market entry</span>
    <h2>${escapeHtml(c["station.portland_heading"])}</h2>
    ${richText(c["station.portland_body"])}
    <div class="station-local-feature">
      <div>
        <span class="eyebrow">Local expression</span>
        <h3>Designed for place, not dropped onto it</h3>
        <p>ROVIQ keeps the operating model and brand consistent while allowing architecture, materials and landscape to reflect the local setting. The Oregon concept uses a Pacific Northwest character rather than a generic global forecourt.</p>
      </div>
      ${mediaFull(STATION_IMAGES["local-oregon"].file, STATION_IMAGES["local-oregon"].alt)}
    </div>
    <div class="station-portland-diagram">${diagramImage("/diagrams/portland_socar_layout.png","Portland, Oregon entry site layout","Portland entry path and the regulatory/tax constraints designed into the plan from day one.")}</div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <div class="grid grid--2" style="align-items:start;">
      <div><span class="eyebrow">Planning frame</span><h2>${escapeHtml(c["station.financials_heading"])}</h2>${richText(c["station.financials_body"])}</div>
      <div><span class="eyebrow">Named directly</span><h2>${escapeHtml(c["station.risks_heading"])}</h2>${richText(c["station.risks_body"])}</div>
    </div>
  </div>
</section>

<section class="section" id="roadmap">
  <div class="container">
    <span class="eyebrow">The roadmap</span>
    <h2>${escapeHtml(c["station.roadmap_heading"])}</h2>
    ${richText(c["station.roadmap_body"])}
    <div class="station-roadmap-diagram">${diagramImage("/diagrams/master_roadmap.png","Roviq Station master staged roadmap","Master staged roadmap — Tier 1 core pilot, Tier 2 low-capex layer, Tier 3 moonshot.")}</div>
    <div class="tier-columns">
      <div class="tier tier--1"><span class="tier-label">Tier 1 &middot; Core pilot</span><h3>${escapeHtml(c["station.tier1_heading"].replace(/^Tier 1\s*—\s*/,""))}</h3><p>${escapeHtml(c["station.tier1_body"])}</p></div>
      <div class="tier tier--2"><span class="tier-label">Tier 2 &middot; Low-capex layer</span><h3>${escapeHtml(c["station.tier2_heading"].replace(/^Tier 2\s*—\s*/,""))}</h3><p>${escapeHtml(c["station.tier2_body"])}</p></div>
      <div class="tier tier--3"><span class="tier-label">Tier 3 &middot; Moonshot</span><h3>${escapeHtml(c["station.tier3_heading"].replace(/^Tier 3\s*—\s*/,""))}</h3><p>${escapeHtml(c["station.tier3_body"])}</p></div>
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Beyond the first site</span>
    <h2>${escapeHtml(c["station.expansion_heading"])} <span class="tag-inline tag-inline--tier3">Tier 3 &middot; Later stage</span></h2>
    ${richText(c["station.expansion_body"])}

    <div class="card card--accent-rust station-expansion-card">
      <h3>Motor Court <span class="tag-inline tag-inline--tier3">Tier 3</span></h3>
      <p>${escapeHtml(c["station.expansion_motor_court_body"])}</p>
      ${mediaFull(STATION_IMAGES["motorcourt"].file, STATION_IMAGES["motorcourt"].alt)}
    </div>

    <div class="card card--accent-rust station-expansion-card">
      <h3>Post Station / Battery Swap <span class="tag-inline tag-inline--tier3">Tier 3</span></h3>
      <p>${escapeHtml(c["station.expansion_post_station_body"])}</p>
      ${mediaFull(STATION_IMAGES["swap-station"].file, STATION_IMAGES["swap-station"].alt)}
    </div>

    <div class="card card--accent-rust station-expansion-card">
      <h3>Vehicle Relay <span class="tag-inline tag-inline--tier3">Tier 3</span></h3>
      <p>${escapeHtml(c["station.expansion_vehicle_relay_body"])}</p>
      ${mediaFull(STATION_IMAGES["relay-station"].file, STATION_IMAGES["relay-station"].alt)}
    </div>
  </div>
</section>
`;
}
