import { richText, mediaFull, diagramImage, escapeHtml } from "../layout.js";
import { STATION_IMAGES } from "../../content/station-images.js";
import { CAR_WASH_IMAGE } from "../carwash-image.js";

const SERVICES = [
  { key: "fuel", title: "Fuel", accent: "gold" },
  { key: "ev", title: "EV Charging", accent: "teal" },
  { key: "cafe", title: "Café", accent: "navy" },
  { key: "wine", title: "Market & Retail", accent: "gold" },
  { key: "wash", title: "Car Wash", accent: "teal" }
];

export function stationPage(c) {
  return `
<section class="hero section--tight">
  <div class="container">
    <div class="grid grid--2" style="align-items:center;">
      <div>
        <span class="eyebrow">ROVIQ Station</span>
        <h1>${escapeHtml(c["station.hero_heading"] || "A modern automotive travel hub")}</h1>
        <p class="lead" style="font-family:'Cinzel',serif;color:var(--gold-light);font-size:1.2rem;">${escapeHtml(c["station.tagline"] || "Fuel. Charge. Eat. Reset. Keep moving.")}</p>
        <p class="lead">A premium gas-station and travel-center format combining fuel, EV charging, café, market, vehicle care and selected ROVIQ service handoffs.</p>
      </div>
      ${mediaFull(STATION_IMAGES["hero-forecourt"].file, STATION_IMAGES["hero-forecourt"].alt)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">The concept</span>
    <h2>More useful than a conventional stop.</h2>
    <div class="grid grid--2" style="align-items:start;">
      <div><p>ROVIQ Station brings the strongest parts of a modern forecourt, EV charging stop and premium convenience format together under one automotive brand. The experience remains recognizably a gas-station/travel-center — not a standalone restaurant, bar or hotel.</p><p>Its role inside the wider ROVIQ ecosystem is physical: a trusted place where charging, refueling, food, retail, vehicle care and selected service handoffs can meet the digital coordination layer.</p></div>
      ${mediaFull(STATION_IMAGES["forecourt-secondary"].file, STATION_IMAGES["forecourt-secondary"].alt)}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Product &amp; service mix</span>
    <h2>Five reasons to stop. One coherent experience.</h2>
    <div class="grid grid--5">
      ${SERVICES.map((s)=>`<div class="card card--accent-${s.accent}"><h3>${s.title}</h3><p>${escapeHtml(c[`station.service_${s.key}_body`] || "Part of the integrated ROVIQ Station experience.")}</p></div>`).join("\n")}
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
        <p>A dedicated vehicle-care module with its own ROVIQ identity and clear separation from the forecourt.</p>
      </div>
      ${mediaFull(CAR_WASH_IMAGE, "Roviq Station car wash and vacuum bay")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Café + market</span>
    <h2>A better stop without losing the travel-center logic.</h2>
    <div class="grid grid--2" style="align-items:center;">
      <div><p>The interior is designed around two different customer speeds: quick grab-and-go for people continuing their journey, and a warmer café zone for drivers who have time to sit while charging or resting.</p><p>Food, coffee, local goods and selected retail sit inside the same convenience-store operating environment rather than becoming a separate hospitality concept.</p></div>
      ${mediaFull(STATION_IMAGES["interior-cafe"].file, STATION_IMAGES["interior-cafe"].alt)}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Spatial logic</span>
    <h2>Designed around movement.</h2>
    <p>The public diagrams show the broad customer-flow concept only: forecourt and charging at the perimeter, café and market as the central destination, and vehicle-care functions positioned so they do not interrupt fast-stop traffic.</p>
    <div class="grid grid--2 station-diagram-grid">
      ${diagramImage("/diagrams/site_layout.png","Roviq Station site layout schematic","Public concept diagram — high-level site zoning only.")}
      ${diagramImage("/diagrams/interior_layout.png","Roviq Station interior zoning schematic","Public concept diagram — high-level interior flow only.")}
    </div>
  </div>
</section>

<section class="section section--navy">
  <div class="container">
    <span class="eyebrow">Regional expression</span>
    <h2>One brand, adapted to place.</h2>
    <div class="station-local-feature">
      <div>
        <h3>Pacific Northwest concept</h3>
        <p>ROVIQ keeps the operating model and brand consistent while allowing architecture, materials, landscape and local retail emphasis to respond to the region. The Oregon concept uses a Pacific Northwest character rather than a generic global forecourt.</p>
      </div>
      ${mediaFull(STATION_IMAGES["local-oregon"].file, STATION_IMAGES["local-oregon"].alt)}
    </div>
  </div>
</section>

<section class="section section--cream-alt">
  <div class="container">
    <span class="eyebrow">Future concepts</span>
    <h2>Explorations beyond the core Station.</h2>
    <p>ROVIQ’s visual library also explores later-stage concepts. These remain clearly labelled as future or exploratory ideas and are not presented as current operating commitments.</p>

    <div class="card card--accent-rust station-expansion-card">
      <span class="status-chip">Future concept</span>
      <h3>Motor Court</h3>
      <p>A roadside lodging extension designed around motorists and vehicle culture, explored as a possible later-stage format.</p>
      ${mediaFull(STATION_IMAGES["motorcourt"].file, STATION_IMAGES["motorcourt"].alt)}
    </div>

    <div class="card card--accent-rust station-expansion-card">
      <span class="status-chip">Future concept</span>
      <h3>Battery Swap / Post Station</h3>
      <p>An exploratory modular concept for future EV infrastructure and rapid vehicle-energy handoffs.</p>
      ${mediaFull(STATION_IMAGES["swap-station"].file, STATION_IMAGES["swap-station"].alt)}
    </div>

    <div class="card card--accent-rust station-expansion-card">
      <span class="status-chip">Future concept</span>
      <h3>Vehicle Relay</h3>
      <p>A modern reinterpretation of historical relay stations: a journey could be completed in legs using coordinated vehicle handoffs rather than one vehicle for the entire route.</p>
      ${mediaFull(STATION_IMAGES["relay-station"].file, STATION_IMAGES["relay-station"].alt)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <span class="eyebrow">Commercial discussions</span>
    <h2>Detailed planning stays private.</h2>
    <p>Site economics, market-entry assumptions, financial models, staged capital requirements, regulatory planning and detailed rollout logic are intentionally not published on the public website. They can be shared selectively in partner and investor materials.</p>
    <a href="/contact" class="btn btn--gold" style="margin-top:1rem;">Discuss ROVIQ Station &rarr;</a>
  </div>
</section>
`;
}
